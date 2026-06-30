'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listItems, deleteItem, exportAll, importAll, type ToolKey } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' };

const TOOL_INFO: Record<string, { name: string; icon: string; href: string }> = {
  bunker: { name: 'CP Performance', icon: '⛽', href: '/voyage/bunker' },
  distance: { name: 'Distance Calc', icon: '📏', href: '/voyage/distance' },
  tracker: { name: 'Voyage Tracker', icon: '📈', href: '/voyage/tracker' },
  cii: { name: 'CII Calculator', icon: '🌍', href: '/voyage/cii' },
  laytime: { name: 'Laytime', icon: '⏱️', href: '/voyage/laytime' },
  tce: { name: 'TCE Calc', icon: '💵', href: '/voyage/tce' },
  draft: { name: 'Draft Survey', icon: '⚓', href: '/voyage/draft' },
  ports: { name: 'Port Database', icon: '🏴', href: '/voyage/ports' },
  psc: { name: 'PSC Sentry', icon: '🔍', href: '/voyage/psc' },
  documents: { name: 'Documents', icon: '📝', href: '/voyage/documents' },
  cp: { name: 'CP Manager', icon: '📜', href: '/voyage/cp' },
  noon: { name: 'Noon Report', icon: '📝', href: '/voyage/noon' },
};

interface SavedListItem {
  id: string;
  key: ToolKey;
  name: string;
  updatedAt: string;
}

export default function SavedItemsPage() {
  const [items, setItems] = useState<SavedListItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  function refresh() {
    const allKeys = Object.keys(TOOL_INFO) as ToolKey[];
    const all: SavedListItem[] = [];
    for (const key of allKeys) {
      const list = listItems(key);
      list.forEach((it) =>
        all.push({ id: it.id, key: it.key, name: it.name, updatedAt: it.updatedAt })
      );
    }
    all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setItems(all);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleDelete(key: ToolKey, id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteItem(key, id);
    refresh();
  }

  function handleExport() {
    const data = exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psf-voyage-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('✓ Backup downloaded');
    setTimeout(() => setMessage(''), 3000);
  }

  function handleImport() {
    if (!importText.trim()) {
      setMessage('⚠ Please paste your backup JSON');
      return;
    }
    const result = importAll(importText);
    if (result.success) {
      setMessage(`✓ Restored ${result.count} items`);
      setImportText('');
      setShowImport(false);
      refresh();
    } else {
      setMessage(`⚠ Import failed: ${result.error}`);
    }
    setTimeout(() => setMessage(''), 4000);
  }

  const filtered = filter === 'all' ? items : items.filter((it) => it.key === filter);
  const uniqueKeys = Array.from(new Set(items.map((it) => it.key)));

  return (
    <div>
      {/* HERO */}
      <section style={{ padding: '30px 0 20px', borderBottom: '1px solid rgba(200,168,75,.1)', marginBottom: 28 }}>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 700, marginBottom: 10 }}>
          💾 My <em style={g}>Saved</em> Items
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6 }}>
          All your saved voyages, calculations, and documents — stored locally in your browser.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            disabled={items.length === 0}
            style={{
              background: 'transparent',
              border: '1px solid rgba(200,168,75,.4)',
              color: '#c8a84b',
              padding: '8px 14px',
              fontFamily: rj,
              fontSize: 11,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 700,
              cursor: items.length === 0 ? 'not-allowed' : 'pointer',
              opacity: items.length === 0 ? 0.5 : 1,
              borderRadius: 4,
            }}
          >
            📥 Backup (Download JSON)
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(200,168,75,.4)',
              color: '#c8a84b',
              padding: '8px 14px',
              fontFamily: rj,
              fontSize: 11,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            📤 Restore from Backup
          </button>
        </div>

        {message && (
          <div
            style={{
              marginTop: 12,
              padding: '8px 14px',
              background: 'rgba(200,168,75,.08)',
              border: '1px solid rgba(200,168,75,.3)',
              color: '#c8a84b',
              fontFamily: rj,
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 4,
            }}
          >
            {message}
          </div>
        )}

        {showImport && (
          <div style={{ marginTop: 14 }}>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your backup JSON here..."
              rows={6}
              style={{
                width: '100%',
                background: '#0c1610',
                border: '1px solid rgba(200,168,75,.3)',
                color: '#f5f0e8',
                padding: 12,
                fontFamily: 'monospace',
                fontSize: 11,
                borderRadius: 4,
              }}
            />
            <button
              onClick={handleImport}
              style={{
                marginTop: 8,
                background: '#c8a84b',
                color: '#08100a',
                border: 'none',
                padding: '8px 14px',
                fontFamily: rj,
                fontSize: 11,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              Restore Now
            </button>
          </div>
        )}
      </section>

      {/* FILTER */}
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              background: filter === 'all' ? '#c8a84b' : 'transparent',
              color: filter === 'all' ? '#08100a' : '#7a8a72',
              border: `1px solid ${filter === 'all' ? '#c8a84b' : 'rgba(200,168,75,.25)'}`,
              fontFamily: rj,
              fontSize: 10,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 3,
            }}
          >
            All ({items.length})
          </button>
          {uniqueKeys.map((key) => {
            const info = TOOL_INFO[key];
            if (!info) return null;
            const count = items.filter((it) => it.key === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '6px 12px',
                  background: filter === key ? '#c8a84b' : 'transparent',
                  color: filter === key ? '#08100a' : '#7a8a72',
                  border: `1px solid ${filter === key ? '#c8a84b' : 'rgba(200,168,75,.25)'}`,
                  fontFamily: rj,
                  fontSize: 10,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: 3,
                }}
              >
                {info.icon} {info.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ITEMS LIST */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px dashed rgba(200,168,75,.2)',
            borderRadius: 6,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 14 }}>💾</div>
          <h3 style={{ fontFamily: lb, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            No saved items yet
          </h3>
          <p style={{ fontSize: 13, color: '#b0c0a4', marginBottom: 22 }}>
            Use any tool and click <strong style={{ color: '#c8a84b' }}>Save</strong> to keep your
            work here.
          </p>
          <Link href="/voyage" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: '#c8a84b',
                color: '#08100a',
                border: 'none',
                padding: '10px 22px',
                fontFamily: rj,
                fontSize: 11,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              Browse Tools
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((item) => {
            const info = TOOL_INFO[item.key];
            if (!info) return null;
            return (
              <div
                key={`${item.key}_${item.id}`}
                style={{
                  background: '#111c13',
                  border: '1px solid rgba(200,168,75,.15)',
                  padding: '14px 16px',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontSize: 22 }}>{info.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: lb,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#f5f0e8',
                      marginBottom: 3,
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#7a8a72', fontFamily: rj }}>
                    {info.name} · Last edit: {new Date(item.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`${info.href}?id=${item.id}`} style={{ textDecoration: 'none' }}>
                    <button
                      style={{
                        background: 'transparent',
                        border: '1px solid #c8a84b',
                        color: '#c8a84b',
                        padding: '6px 12px',
                        fontFamily: rj,
                        fontSize: 10,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: 3,
                      }}
                    >
                      Open
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(item.key, item.id, item.name)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,138,138,.3)',
                      color: '#ff8a8a',
                      padding: '6px 12px',
                      fontFamily: rj,
                      fontSize: 10,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      cursor: 'pointer',
                      borderRadius: 3,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
