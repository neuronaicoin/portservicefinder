"use client";

import { useEffect, useState } from "react";
import { getTotalSearchesLast30Days, getTopSearchedPorts, type PortDemand } from "@/lib/demand";

const rj = "'Rajdhani',sans-serif";

// Gercek search_events verisinden beslenir. Cok az veri varsa (yeni site,
// dusuk hacim) sahte bir sayi UYDURMAZ - onun yerine durust, hala cesaret
// verici genel bir mesaja duser. SCF'deki LiveActivityStrip'in ayni
// "gercek veri + durust yedek" prensibi.
const MEANINGFUL_THRESHOLD = 10;

export function RecentDemand() {
  const [total, setTotal] = useState<number | null>(null);
  const [topPorts, setTopPorts] = useState<PortDemand[]>([]);

  useEffect(() => {
    async function load() {
      const [t, ports] = await Promise.all([getTotalSearchesLast30Days(), getTopSearchedPorts()]);
      setTotal(t);
      setTopPorts(ports);
    }
    load();
  }, []);

  if (total === null) return null; // yuklenirken bos, atlama efekti yok

  const hasMeaningfulData = total >= MEANINGFUL_THRESHOLD;

  return (
    <div
      style={{
        background: "#111c13",
        border: "1px solid rgba(200,168,75,.2)",
        borderRadius: 14,
        padding: "22px 24px",
        maxWidth: 480,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#c8a84b", marginBottom: 10, fontWeight: 700 }}>
        Real Demand
      </div>

      {hasMeaningfulData ? (
        <>
          <p style={{ color: "#f5f0e8", fontSize: 15, fontWeight: 600, marginBottom: topPorts.length > 0 ? 14 : 0 }}>
            {total} operator searches on PortServiceFinder in the last 30 days
          </p>
          {topPorts.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
              {topPorts.map((p) => (
                <div key={`${p.port}-${p.country}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#d4dcc8" }}>
                  <span>{p.port}, {p.country}</span>
                  <span style={{ color: "#c8a84b", fontWeight: 700 }}>{p.count} searches</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p style={{ color: "#d4dcc8", fontSize: 14, lineHeight: 1.6 }}>
          Operators are actively searching PortServiceFinder for agents, chandlers, and marine services —
          list your business so they can find you.
        </p>
      )}
    </div>
  );
}
