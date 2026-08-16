'use client';
import { useState, useEffect, useRef } from 'react';

const rj = "'Rajdhani', sans-serif";

// Gercek PORT_DATA'dan dogrulanmis limanlar — yogun trafik (agirlik yuksek)
const HIGH_TRAFFIC_PORTS = [
  'Singapore', 'Rotterdam', 'Istanbul', 'Fujairah', 'Hong Kong', 'Shanghai',
  'Antwerp', 'Hamburg', 'Houston', 'Busan', 'Piraeus', 'Algeciras',
  'Gibraltar', 'Santos', 'Balboa', 'Dubai / Jebel Ali', 'Ambarli', 'Tuzla',
];

// Gercek PORT_DATA'dan dogrulanmis, daha az yogun ama gercek limanlar
const OTHER_PORTS = [
  'Durrës', 'Luanda', 'Casablanca', 'Lagos', 'Mombasa', 'Colombo',
  'Karachi', 'Chittagong', 'Manila', 'Ho Chi Minh City', 'Jakarta',
  'Auckland', 'Valparaiso', 'Buenos Aires', 'Montevideo', 'Veracruz',
];

const CATEGORIES = ['Ship Agents', 'Shipchandlers', 'Marine Services'];

// 70/30 agirlikli havuz olustur
function buildWeightedPool(): string[] {
  const pool: string[] = [];
  HIGH_TRAFFIC_PORTS.forEach((p) => { for (let i = 0; i < 7; i++) pool.push(p); });
  OTHER_PORTS.forEach((p) => { for (let i = 0; i < 3; i++) pool.push(p); });
  return pool;
}

interface RealEvent {
  country: string;
  port: string;
  service_type: string | null;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
}

export default function LiveSearchFeed() {
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(true);
  const [realEvents, setRealEvents] = useState<RealEvent[]>([]);
  const poolRef = useRef(buildWeightedPool());
  const realIdxRef = useRef(0);
  const fallbackIdxRef = useRef(0);

  // Gercek arama olaylarini cek (60 sn'de bir yenile)
  useEffect(() => {
    const fetchReal = () => {
      fetch('/api/recent-searches')
        .then((r) => r.json())
        .then((d) => {
          // Sadece son 1 saatteki gercek olaylar sayilir
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          const fresh = (d.events || []).filter(
            (e: RealEvent) => new Date(e.created_at).getTime() > oneHourAgo
          );
          setRealEvents(fresh);
        })
        .catch(() => setRealEvents([]));
    };
    fetchReal();
    const iv = setInterval(fetchReal, 60000);
    return () => clearInterval(iv);
  }, []);

  // Her 15 saniyede bir metni degistir
  useEffect(() => {
    const rotate = () => {
      setVisible(false);
      setTimeout(() => {
        if (realEvents.length > 0) {
          // GERCEK VERI VAR: "Someone searched..." formati
          const e = realEvents[realIdxRef.current % realEvents.length];
          realIdxRef.current++;
          const cat = e.service_type ? `${e.service_type} in ${e.port}` : e.port;
          setText(`🔍 Someone searched "${cat}" — ${timeAgo(e.created_at)}`);
        } else {
          // GERCEK VERI YOK: notr, olay iddiasi tasimayan yedek metin
          const pool = poolRef.current;
          const port = pool[Math.floor(Math.random() * pool.length)];
          const cat = CATEGORIES[fallbackIdxRef.current % CATEGORIES.length];
          fallbackIdxRef.current++;
          setText(`🔍 Searching: ${cat} in ${port}`);
        }
        setVisible(true);
      }, 300);
    };

    rotate(); // ilk metni hemen goster
    const iv = setInterval(rotate, 15000);
    return () => clearInterval(iv);
  }, [realEvents]);

  return (
    <div
      className="lsf-pill"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        minHeight: 20,
        background: '#c8a84b',
        border: '2px solid #c8a84b',
        borderRadius: 999,
        padding: '10px 22px',
        boxShadow: '0 4px 18px rgba(200,168,75,.4)',
        opacity: visible ? 1 : 0,
        transition: 'opacity .3s ease',
        flexWrap: 'wrap',
        maxWidth: '92vw',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#08100a',
          flexShrink: 0,
          boxShadow: '0 0 0 0 rgba(8,16,10,.7)',
          animation: 'lsfPulse 1.6s infinite',
        }}
      />
      <span
        className="lsf-text"
        style={{
          fontFamily: rj,
          fontSize: 15,
          fontWeight: 800,
          color: '#08100a',
          letterSpacing: '.3px',
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
      <style>{`
        @keyframes lsfPulse {
          0% { box-shadow: 0 0 0 0 rgba(8,16,10,.55); }
          70% { box-shadow: 0 0 0 6px rgba(8,16,10,0); }
          100% { box-shadow: 0 0 0 0 rgba(8,16,10,0); }
        }
        @media (max-width: 640px) {
          .lsf-pill { padding: 8px 16px !important; gap: 7px !important; border-radius: 16px !important; max-width: 94vw !important; }
          .lsf-text { font-size: 12px !important; }
        }
        @media (max-width: 380px) {
          .lsf-text { font-size: 11px !important; }
        }
      `}</style>
    </div>
  );
}
