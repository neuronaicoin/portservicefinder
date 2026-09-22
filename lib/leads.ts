import { supabaseBrowser } from "@/lib/supabase-browser";

export interface Lead {
  id: string;
  contact_method: "call" | "email";
  created_at: string;
}

// Bir provider'in en son lead'lerini getirir (en yeni once).
export async function getRecentLeads(providerId: string, limit = 20): Promise<Lead[]> {
  const { data, error } = await supabaseBrowser
    .from("leads")
    .select("id, contact_method, created_at")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Lead[];
}

// Toplam lead sayisi.
export async function getTotalLeadCount(providerId: string): Promise<number> {
  const { count } = await supabaseBrowser
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", providerId);
  return count ?? 0;
}

// Son 7 gundeki lead sayisi.
export async function getLeadsThisWeek(providerId: string): Promise<number> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count } = await supabaseBrowser
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .gte("created_at", weekAgo.toISOString());
  return count ?? 0;
}

// Provider'in son_gorulme zamanindan sonra gelen okunmamis lead sayisi.
export async function getUnreadLeadCount(providerId: string): Promise<number> {
  const { data: prov } = await supabaseBrowser
    .from("providers")
    .select("last_notifications_seen_at")
    .eq("id", providerId)
    .single();

  const lastSeen = (prov as { last_notifications_seen_at: string | null } | null)
    ?.last_notifications_seen_at;

  let query = supabaseBrowser
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", providerId);

  if (lastSeen) query = query.gt("created_at", lastSeen);

  const { count } = await query;
  return count ?? 0;
}

// En son lead'in zaman damgasi (dashboard acikken yeni lead algilamak icin).
export async function getLatestLeadTimestamp(providerId: string): Promise<string | null> {
  const { data } = await supabaseBrowser
    .from("leads")
    .select("created_at")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return (data as { created_at: string } | null)?.created_at ?? null;
}

// Zile basildiginda "gorulme" zamanini simdi olarak isaretler.
export async function markNotificationsSeen(providerId: string): Promise<boolean> {
  const { error } = await supabaseBrowser
    .from("providers")
    .update({ last_notifications_seen_at: new Date().toISOString() })
    .eq("id", providerId);
  return !error;
}
