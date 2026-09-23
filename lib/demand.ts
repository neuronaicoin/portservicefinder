import { supabaseBrowser } from "@/lib/supabase-browser";

export interface PortDemand {
  port: string;
  country: string;
  count: number;
}

// Son 30 gundeki TOPLAM arama sayisi (platform genelinde). Tekil bir
// liman/servis kombinasyonundan cok daha hizli anlamli bir sayiya ulasir,
// bu yuzden dusuk hacimde bile "gercek ve cesaret verici" gorunur.
export async function getTotalSearchesLast30Days(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count } = await supabaseBrowser
    .from("search_events")
    .select("id", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo.toISOString());

  return count ?? 0;
}

// Son 30 gunde en cok aranan limanlar (gercek verilerden, en az MIN_COUNT
// arama olanlari dondurur - tek aramalik "zayif" sonuclari gostermemek icin).
export async function getTopSearchedPorts(limit = 5, minCount = 3): Promise<PortDemand[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabaseBrowser
    .from("search_events")
    .select("port, country")
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (error || !data) return [];

  const counts: Record<string, PortDemand> = {};
  for (const row of data as { port: string; country: string }[]) {
    const key = `${row.port}|${row.country}`;
    if (!counts[key]) counts[key] = { port: row.port, country: row.country, count: 0 };
    counts[key].count++;
  }

  return Object.values(counts)
    .filter((p) => p.count >= minCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
