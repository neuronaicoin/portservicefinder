import { ImageResponse } from "next/og";

export const alt = "PortServiceFinder — Global Maritime Services Directory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#08100a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Top gold accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#c8a84b",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
          <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#c8a84b" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="#c8a84b" strokeWidth="0.6" opacity="0.5" />
            <polygon points="50,15 56,50 50,50" fill="#f5f0e8" />
            <polygon points="50,15 44,50 50,50" fill="#c8a84b" />
            <polygon points="50,85 56,50 50,50" fill="#c8a84b" />
            <polygon points="50,85 44,50 50,50" fill="#f5f0e8" />
            <polygon points="85,50 50,44 50,50" fill="#c8a84b" />
            <polygon points="85,50 50,56 50,50" fill="#f5f0e8" />
            <polygon points="15,50 50,44 50,50" fill="#f5f0e8" />
            <polygon points="15,50 50,56 50,50" fill="#c8a84b" />
            <circle cx="50" cy="50" r="3.5" fill="#c8a84b" />
          </svg>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#f5f0e8",
              letterSpacing: -2,
              display: "flex",
            }}
          >
            PortService<span style={{ color: "#c8a84b" }}>Finder</span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 46,
            color: "#f5f0e8",
            textAlign: "center",
            fontStyle: "italic",
            marginBottom: 24,
            display: "flex",
            letterSpacing: -1,
          }}
        >
          Every Port. Every Service. One Platform.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#b0c0a4",
            textAlign: "center",
            display: "flex",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Global Maritime Services Directory · 150+ Countries · 1,200+ Ports
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 18,
            color: "#c8a84b",
            letterSpacing: 4,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          <span style={{ display: "inline-block", width: 40, height: 1, background: "#c8a84b", opacity: 0.5 }} />
          Free to Search · No Commission
          <span style={{ display: "inline-block", width: 40, height: 1, background: "#c8a84b", opacity: 0.5 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
