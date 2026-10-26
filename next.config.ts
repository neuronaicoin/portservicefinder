import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";
import { ALL_PORTS, legacySlug } from "./lib/ports";

/** Old blog addresses that now live at another post (duplicates merged). */
function blogRedirects() {
  try {
    const file = path.join(process.cwd(), "lib", "blog-redirects.json");
    return JSON.parse(fs.readFileSync(file, "utf8")) as { source: string; destination: string; permanent: boolean }[];
  } catch {
    return [];
  }
}

/** Port pages whose address changed when accented letters started being kept (paranagu → paranagua). */
function portRedirects() {
  const out: { source: string; destination: string; permanent: boolean }[] = [];
  const taken = new Set(ALL_PORTS.map((p) => p.slug));
  const seen = new Set<string>();
  for (const p of ALL_PORTS) {
    const old = legacySlug(p.name);
    if (!old || old === p.slug || taken.has(old) || seen.has(old)) continue;
    seen.add(old);
    out.push({ source: `/ports/${old}`, destination: `/ports/${p.slug}`, permanent: true });
    out.push({ source: `/ports/${old}/:service`, destination: `/ports/${p.slug}/:service`, permanent: true });
  }
  return out;
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // "all services" was never a page of its own
      { source: "/ports/:port/all", destination: "/ports/:port", permanent: true },
      ...portRedirects(),
      ...blogRedirects(),
    ];
  },
};

export default nextConfig;
