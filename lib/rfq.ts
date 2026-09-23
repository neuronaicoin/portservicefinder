import { supabaseBrowser } from "@/lib/supabase-browser";

export interface RfqInput {
  country: string;
  port: string;
  serviceType: string; // 'agent' | 'chandler' | MARINE_SERVICES key
  vesselType: string;
  eta: string;
  requirementDetails: string;
  urgency: "standard" | "urgent";
  operatorName: string;
  operatorEmail: string;
  operatorPhone: string;
}

// Bir RFQ olusturur ve eslesen provider'lara otomatik dagitir.
// Eslesme: ayni ulke + provider'in ports listesinde bu liman + tur eslesmesi
// (agent/chandler direkt type eslesir, marine service kategorileri svc icinde aranir).
export async function submitRfq(input: RfqInput): Promise<{ ok: boolean; distributedCount: number }> {
  const { data: rfq, error: rfqError } = await supabaseBrowser
    .from("rfq_requests")
    .insert([
      {
        country: input.country,
        port: input.port,
        service_type: input.serviceType,
        vessel_type: input.vesselType || null,
        eta: input.eta || null,
        requirement_details: input.requirementDetails,
        urgency: input.urgency,
        operator_name: input.operatorName,
        operator_email: input.operatorEmail,
        operator_phone: input.operatorPhone || null,
      },
    ])
    .select("id")
    .single();

  if (rfqError || !rfq) {
    console.error("submitRfq insert error:", rfqError?.message);
    return { ok: false, distributedCount: 0 };
  }

  // Eslesen provider'lari bul
  const { data: providers } = await supabaseBrowser
    .from("providers")
    .select("id, type, svc, ports")
    .eq("country", input.country)
    .eq("status", "active");

  const matched = (providers || []).filter((p: any) => {
    const portsMatch = Array.isArray(p.ports) && p.ports.includes(input.port);
    if (!portsMatch) return false;
    if (input.serviceType === "agent" || input.serviceType === "chandler") {
      return p.type === input.serviceType;
    }
    // marine service kategorisi - svc dizisinde ara
    return Array.isArray(p.svc) && p.svc.includes(input.serviceType);
  });

  if (matched.length === 0) {
    return { ok: true, distributedCount: 0 };
  }

  const rows = matched.map((p: any) => ({ rfq_id: rfq.id, provider_id: p.id }));
  const { error: distError } = await supabaseBrowser.from("rfq_distributions").insert(rows);

  if (distError) {
    console.error("submitRfq distribution error:", distError.message);
    return { ok: true, distributedCount: 0 };
  }

  return { ok: true, distributedCount: matched.length };
}

export interface ReceivedRfq {
  distributionId: string;
  rfqId: string;
  port: string;
  country: string;
  serviceType: string;
  vesselType: string | null;
  eta: string | null;
  requirementDetails: string;
  urgency: string;
  operatorName: string;
  operatorEmail: string;
  operatorPhone: string | null;
  createdAt: string;
}

// Bir provider'a dagitilmis RFQ'lari getirir (en yeni once).
export async function getReceivedRfqs(providerId: string, limit = 20): Promise<ReceivedRfq[]> {
  const { data, error } = await supabaseBrowser
    .from("rfq_distributions")
    .select("id, created_at, rfq_requests(id, port, country, service_type, vessel_type, eta, requirement_details, urgency, operator_name, operator_email, operator_phone)")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as any[])
    .filter((row) => row.rfq_requests)
    .map((row) => ({
      distributionId: row.id,
      rfqId: row.rfq_requests.id,
      port: row.rfq_requests.port,
      country: row.rfq_requests.country,
      serviceType: row.rfq_requests.service_type,
      vesselType: row.rfq_requests.vessel_type,
      eta: row.rfq_requests.eta,
      requirementDetails: row.rfq_requests.requirement_details,
      urgency: row.rfq_requests.urgency,
      operatorName: row.rfq_requests.operator_name,
      operatorEmail: row.rfq_requests.operator_email,
      operatorPhone: row.rfq_requests.operator_phone,
      createdAt: row.created_at,
    }));
}

export async function getRfqCount(providerId: string): Promise<number> {
  const { count } = await supabaseBrowser
    .from("rfq_distributions")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", providerId);
  return count ?? 0;
}
