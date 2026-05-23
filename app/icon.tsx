import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#08100a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#c8a84b" strokeWidth="4" />
          <polygon points="50,15 56,50 50,50" fill="#f5f0e8" />
          <polygon points="50,15 44,50 50,50" fill="#c8a84b" />
          <polygon points="50,85 56,50 50,50" fill="#c8a84b" />
          <polygon points="50,85 44,50 50,50" fill="#f5f0e8" />
          <polygon points="85,50 50,44 50,50" fill="#c8a84b" />
          <polygon points="85,50 50,56 50,50" fill="#f5f0e8" />
          <polygon points="15,50 50,44 50,50" fill="#f5f0e8" />
          <polygon points="15,50 50,56 50,50" fill="#c8a84b" />
          <circle cx="50" cy="50" r="5" fill="#c8a84b" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
