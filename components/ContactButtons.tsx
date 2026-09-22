"use client";

interface Props {
  providerId: string;
  phone: string;
  email: string;
}

// Call/Email butonlarina tiklamayi 'lead' olarak kaydeder, sonra tel:/mailto:
// baglantisina normal sekilde devam eder. Izleme cagrisi fire-and-forget'tir —
// hicbir zaman kullanicinin gecisini geciktirmez ya da engellemez.
export function ContactButtons({ providerId, phone, email }: Props) {
  function trackLead(method: "call" | "email") {
    fetch("/api/track-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, contactMethod: method }),
    }).catch(() => {
      /* sessizce gec - izleme basarisiz olsa bile iletisimi engellemez */
    });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: "auto" }}>
      <a
        href={`tel:${phone.replace(/\s/g, "")}`}
        onClick={() => trackLead("call")}
        style={{
          padding: "8px 10px",
          background: "#c8a84b",
          color: "#08100a",
          textDecoration: "none",
          fontFamily: "'Rajdhani',sans-serif",
          fontSize: 10,
          letterSpacing: "1px",
          textTransform: "uppercase",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Call
      </a>
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(
          "Inquiry via PortServiceFinder"
        )}&body=${encodeURIComponent(
          `Hi, I found you on PortServiceFinder and I'm interested in your services.`
        )}`}
        onClick={() => trackLead("email")}
        style={{
          padding: "8px 10px",
          background: "transparent",
          border: "1px solid rgba(200,168,75,.4)",
          color: "#c8a84b",
          textDecoration: "none",
          fontFamily: "'Rajdhani',sans-serif",
          fontSize: 10,
          letterSpacing: "1px",
          textTransform: "uppercase",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Email
      </a>
    </div>
  );
}
