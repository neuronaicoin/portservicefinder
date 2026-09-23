import { supabaseBrowser } from "@/lib/supabase-browser";

// Bir provider'in son 30 gunde kac kez "arama sonucunda gorunmus olabilecegi"
// sayisi — provider'in kayitli ulke + limanlarina denk gelen gercek
// search_events kayitlarindan hesaplanir. YENI bir izleme kodu gerekmez,
// zaten var olan arama verisinden turetilir.
export async function getSearchAppearances(
  country: string,
  ports: string[]
): Promise<number> {
  if (!country || !ports || ports.length === 0) return 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count } = await supabaseBrowser
    .from("search_events")
    .select("id", { count: "exact", head: true })
    .eq("country", country)
    .in("port", ports)
    .gte("created_at", thirtyDaysAgo.toISOString());

  return count ?? 0;
}

// Liman bazinda kirilim - hangi limanda kac kez arandigi (dashboard'da
// "Your visibility this month" bolumu icin).
export interface PortAppearance {
  port: string;
  count: number;
}

export async function getAppearancesByPort(
  country: string,
  ports: string[]
): Promise<PortAppearance[]> {
  if (!country || !ports || ports.length === 0) return [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabaseBrowser
    .from("search_events")
    .select("port")
    .eq("country", country)
    .in("port", ports)
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data as { port: string }[]) {
    counts[row.port] = (counts[row.port] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([port, count]) => ({ port, count }))
    .sort((a, b) => b.count - a.count);
}
