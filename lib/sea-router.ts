// ============================================================
// sea-router.ts — automatic sea-only routing using a real
// world land/sea mask (world-atlas topojson via CDN) + A*.
// Builds a lat/lon grid, marks land vs sea using point-in-polygon,
// carves man-made canals (Suez, Panama, Kiel, Corinth) as passable,
// then A* finds a sea path between any two ports worldwide.
// Planning aid only — NOT for navigation.
// ============================================================

export interface RouteWaypoint { name: string; lat: number; lon: number; major: boolean; }

// ---- grid config ----
const GRID_RES = 1;                 // degrees per cell (1° ~ 60nm). Good balance.
const LAT_MIN = -85, LAT_MAX = 85;  // skip poles
const LON_MIN = -180, LON_MAX = 180;
const NLAT = Math.round((LAT_MAX - LAT_MIN) / GRID_RES);
const NLON = Math.round((LON_MAX - LON_MIN) / GRID_RES);

// man-made canals: cells along these are forced to SEA (passable)
// each is a list of [lat,lon] points that we rasterize as open water
const CANALS: { name: string; pts: [number, number][] }[] = [
  { name: 'Suez', pts: [[31.26, 32.31], [30.6, 32.34], [30.0, 32.35], [29.93, 32.55]] },
  { name: 'Panama', pts: [[9.36, -79.92], [9.1, -79.8], [9.0, -79.68], [8.88, -79.55]] },
  { name: 'Kiel', pts: [[54.37, 9.95], [54.3, 9.7], [54.2, 9.3], [53.9, 9.13]] },
  { name: 'Corinth', pts: [[37.95, 22.94], [37.93, 22.99]] },
];

// named choke points — if the route passes near one, we label it
const NAMED_POINTS: { name: string; lat: number; lon: number }[] = [
  { name: 'Suez Canal', lat: 30.4, lon: 32.35 },
  { name: 'Panama Canal', lat: 9.1, lon: -79.7 },
  { name: 'Strait of Gibraltar', lat: 35.95, lon: -5.6 },
  { name: 'Strait of Malacca', lat: 2.5, lon: 101.3 },
  { name: 'Bab-el-Mandeb', lat: 12.6, lon: 43.4 },
  { name: 'Strait of Hormuz', lat: 26.5, lon: 56.3 },
  { name: 'Dover Strait', lat: 51.0, lon: 1.5 },
  { name: 'Cape of Good Hope', lat: -34.8, lon: 19.6 },
  { name: 'Cape Horn', lat: -55.9, lon: -67.2 },
  { name: 'Sunda Strait', lat: -6.0, lon: 105.9 },
  { name: 'Lombok Strait', lat: -8.7, lon: 115.7 },
  { name: 'Taiwan Strait', lat: 24.5, lon: 119.5 },
  { name: 'Korea Strait', lat: 34.0, lon: 129.0 },
  { name: 'Luzon Strait', lat: 20.5, lon: 121.0 },
  { name: 'Bosphorus', lat: 41.1, lon: 29.06 },
  { name: 'Dardanelles', lat: 40.2, lon: 26.4 },
  { name: 'Bering Strait', lat: 65.5, lon: -169.0 },
  { name: 'Magellan Strait', lat: -53.5, lon: -70.5 },
  { name: 'Yucatan Channel', lat: 21.5, lon: -85.5 },
  { name: 'Windward Passage', lat: 20.0, lon: -73.5 },
  { name: 'Mozambique Channel', lat: -20.0, lon: 40.0 },
];

// ---- module state (built once) ----
let landMask: Uint8Array | null = null;   // 1 = land, 0 = sea
let building: Promise<void> | null = null;

function idx(iLat: number, iLon: number): number { return iLat * NLON + iLon; }
function latOf(iLat: number): number { return LAT_MAX - iLat * GRID_RES; }
function lonOf(iLon: number): number { return LON_MIN + iLon * GRID_RES; }
function iLatOf(lat: number): number { return Math.min(NLAT - 1, Math.max(0, Math.round((LAT_MAX - lat) / GRID_RES))); }
function iLonOf(lon: number): number { let l = ((lon + 180) % 360 + 360) % 360 - 180; return Math.min(NLON - 1, Math.max(0, Math.round((l - LON_MIN) / GRID_RES))); }

// point in polygon (ray casting). ring: [ [lon,lat], ... ]
function pointInRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) && (lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// ---- load world-atlas land topojson from CDN and rasterize ----
async function buildMask(): Promise<void> {
  if (landMask) return;
  if (building) return building;
  building = (async () => {
    // world-atlas land-110m topojson (small, ~100KB)
    const url = 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json';
    const topo = await fetch(url).then((r) => r.json());

    // decode topojson -> array of polygon rings (lon/lat)
    const arcsRaw: number[][][] = topo.arcs;
    const scale = topo.transform ? topo.transform.scale : [1, 1];
    const translate = topo.transform ? topo.transform.translate : [0, 0];

    // decode delta-encoded arcs to absolute lon/lat
    const decodedArcs: number[][][] = arcsRaw.map((arc) => {
      let x = 0, y = 0;
      return arc.map((p) => {
        x += p[0]; y += p[1];
        return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
      });
    });

    function arcToPoints(arcIndex: number): number[][] {
      if (arcIndex >= 0) return decodedArcs[arcIndex];
      // negative index -> reversed arc (~arcIndex)
      const a = decodedArcs[~arcIndex];
      return a.slice().reverse();
    }

    function ringToCoords(ring: number[]): number[][] {
      const coords: number[][] = [];
      for (const ai of ring) {
        const pts = arcToPoints(ai);
        for (const p of pts) coords.push(p);
      }
      return coords;
    }

    // collect all polygon rings from the 'land' geometry
    const rings: number[][][] = [];
    const geom = topo.objects.land;
    function collect(g: any) {
      if (!g) return;
      if (g.type === 'Polygon') {
        g.arcs.forEach((r: number[]) => rings.push(ringToCoords(r)));
      } else if (g.type === 'MultiPolygon') {
        g.arcs.forEach((poly: number[][]) => poly.forEach((r: number[]) => rings.push(ringToCoords(r))));
      } else if (g.type === 'GeometryCollection') {
        g.geometries.forEach(collect);
      }
    }
    collect(geom);

    // rasterize: for each grid cell centre, test if inside any land ring
    const mask = new Uint8Array(NLAT * NLON);
    // build bounding boxes for rings to speed up
    const bboxes = rings.map((r) => {
      let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
      for (const p of r) { if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0]; if (p[1] < miny) miny = p[1]; if (p[1] > maxy) maxy = p[1]; }
      return [minx, miny, maxx, maxy];
    });

    for (let iLat = 0; iLat < NLAT; iLat++) {
      const lat = latOf(iLat);
      for (let iLon = 0; iLon < NLON; iLon++) {
        const lon = lonOf(iLon);
        let land = false;
        for (let r = 0; r < rings.length; r++) {
          const b = bboxes[r];
          if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue;
          if (pointInRing(lon, lat, rings[r])) { land = !land; }
        }
        if (land) mask[idx(iLat, iLon)] = 1;
      }
    }

    // carve canals -> force sea
    for (const c of CANALS) {
      for (let s = 0; s < c.pts.length - 1; s++) {
        const [la1, lo1] = c.pts[s], [la2, lo2] = c.pts[s + 1];
        const steps = 20;
        for (let t = 0; t <= steps; t++) {
          const la = la1 + (la2 - la1) * (t / steps);
          const lo = lo1 + (lo2 - lo1) * (t / steps);
          const il = iLatOf(la), io = iLonOf(lo);
          mask[idx(il, io)] = 0;
          // also clear neighbours so the channel is wide enough to traverse
          for (const [dl, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
            const nl = il + dl, no = io + dc;
            if (nl >= 0 && nl < NLAT && no >= 0 && no < NLON) mask[idx(nl, no)] = 0;
          }
        }
      }
    }

    landMask = mask;
  })();
  return building;
}

// nearest sea cell to a coordinate (spiral search)
function nearestSeaCell(lat: number, lon: number): [number, number] {
  const il0 = iLatOf(lat), io0 = iLonOf(lon);
  if (landMask && landMask[idx(il0, io0)] === 0) return [il0, io0];
  for (let r = 1; r < 12; r++) {
    for (let dl = -r; dl <= r; dl++) {
      for (let dc = -r; dc <= r; dc++) {
        if (Math.abs(dl) !== r && Math.abs(dc) !== r) continue;
        const il = il0 + dl, io = io0 + dc;
        if (il < 0 || il >= NLAT || io < 0 || io >= NLON) continue;
        if (landMask && landMask[idx(il, io)] === 0) return [il, io];
      }
    }
  }
  return [il0, io0];
}

// A* on the sea grid. Returns list of [lat,lon] or null.
function astar(startLat: number, startLon: number, goalLat: number, goalLon: number): [number, number][] | null {
  if (!landMask) return null;
  const [sil, sio] = nearestSeaCell(startLat, startLon);
  const [gil, gio] = nearestSeaCell(goalLat, goalLon);
  const start = idx(sil, sio), goal = idx(gil, gio);

  const openSet = new Set<number>([start]);
  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>([[start, 0]]);
  const fScore = new Map<number, number>();

  function cellLat(i: number) { return latOf(Math.floor(i / NLON)); }
  function cellLon(i: number) { return lonOf(i % NLON); }
  function heur(i: number): number {
    const dLat = cellLat(i) - goalLat;
    let dLon = cellLon(i) - goalLon;
    if (dLon > 180) dLon -= 360; if (dLon < -180) dLon += 360;
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }
  fScore.set(start, heur(start));

  const neighbors = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
  let iterations = 0;
  const MAX_ITER = 200000;

  while (openSet.size > 0) {
    if (++iterations > MAX_ITER) return null;
    // node in openSet with lowest fScore
    let current = -1, best = Infinity;
    for (const n of openSet) { const f = fScore.get(n) ?? Infinity; if (f < best) { best = f; current = n; } }
    if (current === goal) {
      // reconstruct
      const path: [number, number][] = [];
      let c: number | undefined = current;
      while (c !== undefined) {
        path.unshift([cellLat(c), cellLon(c)]);
        c = cameFrom.get(c);
      }
      return path;
    }
    openSet.delete(current);
    const cil = Math.floor(current / NLON), cio = current % NLON;
    for (const [dl, dc] of neighbors) {
      let nio = cio + dc;
      // wrap longitude
      if (nio < 0) nio = NLON - 1; else if (nio >= NLON) nio = 0;
      const nil = cil + dl;
      if (nil < 0 || nil >= NLAT) continue;
      if (landMask[idx(nil, nio)] === 1) continue; // land blocked
      const nIdx = idx(nil, nio);
      const stepCost = (dl !== 0 && dc !== 0) ? 1.4142 : 1;
      const tentative = (gScore.get(current) ?? Infinity) + stepCost;
      if (tentative < (gScore.get(nIdx) ?? Infinity)) {
        cameFrom.set(nIdx, current);
        gScore.set(nIdx, tentative);
        fScore.set(nIdx, tentative + heur(nIdx) * 1.0);
        openSet.add(nIdx);
      }
    }
  }
  return null;
}

// simplify a dense path (Douglas–Peucker-ish by angle) and label named points
function simplifyAndLabel(path: [number, number][]): RouteWaypoint[] {
  if (path.length <= 2) return [];
  // drop first & last (they're the port cells); keep turning points
  const inner = path.slice(1, -1);
  const kept: [number, number][] = [];
  const STEP = Math.max(1, Math.floor(inner.length / 40)); // cap ~40 pts
  for (let i = 0; i < inner.length; i += STEP) kept.push(inner[i]);

  // label kept points that are near a named choke point
  const out: RouteWaypoint[] = kept.map(([lat, lon]) => {
    let name = '', major = false;
    for (const np of NAMED_POINTS) {
      const dLat = lat - np.lat; let dLon = lon - np.lon;
      if (dLon > 180) dLon -= 360; if (dLon < -180) dLon += 360;
      if (Math.sqrt(dLat * dLat + dLon * dLon) < 3) { name = np.name; major = true; break; }
    }
    return { name: name || 'WP', lat, lon, major };
  });
  return out;
}

// ============================================================
// PUBLIC: compute an automatic sea route between two ports.
// Returns ordered waypoints (geometry) with named majors flagged.
// Throws if the mask cannot load.
// ============================================================
export async function computeSeaRoute(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number }
): Promise<RouteWaypoint[]> {
  await buildMask();
  const path = astar(from.lat, from.lon, to.lat, to.lon);
  if (!path) return [];
  return simplifyAndLabel(path);
}

export function isMaskReady(): boolean { return !!landMask; }
