"use client";

import { useEffect, useRef, useState } from "react";
import {
  getUnreadLeadCount,
  getLatestLeadTimestamp,
  markNotificationsSeen,
} from "@/lib/leads";

interface Props {
  providerId: string;
}

const POLL_INTERVAL_MS = 20000;

function playDing() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1108, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    /* sesli uyari calismazsa sessizce gec */
  }
}

export function NotificationBell({ providerId }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [ringing, setRinging] = useState(false);
  const lastKnownTimestamp = useRef<string | null>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (!providerId) return;
    let active = true;

    async function check() {
      const [count, latest] = await Promise.all([
        getUnreadLeadCount(providerId),
        getLatestLeadTimestamp(providerId),
      ]);
      if (!active) return;
      setUnreadCount(count);

      if (firstLoad.current) {
        lastKnownTimestamp.current = latest;
        firstLoad.current = false;
        return;
      }
      if (latest && latest !== lastKnownTimestamp.current) {
        lastKnownTimestamp.current = latest;
        playDing();
        setRinging(true);
        setTimeout(() => setRinging(false), 1000);
      }
    }

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [providerId]);

  async function handleClick() {
    setUnreadCount(0);
    await markNotificationsSeen(providerId);
    const el = document.getElementById("recent-leads-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Notifications"
      className={ringing ? "animate-bounce" : ""}
      style={{
        position: "relative",
        width: 42,
        height: 42,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        border: "1px solid rgba(200,168,75,.25)",
        background: "#111c13",
        cursor: "pointer",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z"
          stroke="#d4dcc8"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M10 18a2 2 0 0 0 4 0" stroke="#d4dcc8" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            padding: "0 4px",
            borderRadius: 9,
            background: "#e05555",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
