'use client';
import { useState, useEffect, useMemo } from 'react';
import { saveItem, loadItem, genId } from '@/lib/voyage-storage';

const lb = "'Libre Bodoni', serif";
const rj = "'Rajdhani', sans-serif";
const g = { color: '#c8a84b', fontStyle: 'italic' } as React.CSSProperties;

// ============================================================
// TYPES
// ============================================================
type Category = 'agent' | 'surveyor' | 'bunker' | 'pandi' | 'class' | 'lawyer' | 'chandler' | 'repair' | 'towage' | 'other';

interface Contact {
  id: string;
  name: string;
  company: string;
  category: Category;
  port: string;
  phone: string;
  email: string;
  vhf: string;
  emergency: boolean;
  notes: string;
}

const CATEGORY_META: Record<Category, { label: string; icon: string }> = {
  agent: { label: 'Port Agent', icon: '🏴' },
  surveyor: { label: 'Surveyor', icon: '🔍' },
  bunker: { label: 'Bunker Supplier', icon: '⛽' },
  pandi: { label: 'P&I Correspondent', icon: '🛡️' },
  class: { label: 'Class Society', icon: '📐' },
  lawyer: { label: 'Lawyer / Claims', icon: '⚖️' },
  chandler: { label: 'Ship Chandler', icon: '📦' },
  repair: { label: 'Repair / Service', icon: '🔧' },
  towage: { label: 'Towage / Tugs', icon: '🚢' },
  other: { label: 'Other', icon: '📇' },
};

// ============================================================
// STYLES
// ============================================================
const card: React.CSSProperties = { background: '#111c13', border: '1px solid rgba(200,168,75,.18)', padding: '20px 18px', borderRadius: 4, marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: rj, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(200,168,75,.12)' };
const label: React.CSSProperties = { display: 'block', fontFamily: rj, fontSize: 10, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a8a72', fontWeight: 600, marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0c1610', border: '1px solid rgba(200,168,75,.2)', color: '#f5f0e8', padding: '7px 9px', fontFamily: rj, fontSize: 12.5, fontWeight: 500, borderRadius: 3, boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#c8a84b', border: '1px solid rgba(200,168,75,.4)', padding: '8px 14px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };
const goldBtn: React.CSSProperties = { background: '#c8a84b', color: '#08100a', border: 'none', padding: '8px 16px', fontFamily: rj, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', borderRadius: 4 };

const STORAGE_KEY = 'contacts';
const SINGLETON_ID = 'contactbook';

// ============================================================
// COMPONENT
// ============================================================
export default function ContactBookPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | Category>('all');
  const [editing, setEditing] = useState<Contact | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Load contact book (single saved record) on mount
  useEffect(() => {
    try {
      const saved = loadItem<{ contacts: Contact[] }>(STORAGE_KEY, SINGLETON_ID);
      if (saved && Array.isArray(saved.data.contacts)) setContacts(saved.data.contacts);
    } catch { /* ignore */ }
  }, []);

  function persist(next: Contact[]) {
    setContacts(next);
    try {
      saveItem(STORAGE_KEY, 'Contact Book', { contacts: next }, SINGLETON_ID);
      setSaveMsg('✓ Saved');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch { /* ignore */ }
  }

  function emptyContact(): Contact {
    return { id: genId(), name: '', company: '', category: 'agent', port: '', phone: '', email: '', vhf: '', emergency: false, notes: '' };
  }

  function openNew() { setEditing(emptyContact()); setShowForm(true); }
  function openEdit(c: Contact) { setEditing({ ...c }); setShowForm(true); }

  function saveContact() {
    if (!editing) return;
    const exists = contacts.some((c) => c.id === editing.id);
    const next = exists ? contacts.map((c) => (c.id === editing.id ? editing : c)) : [...contacts, editing];
    persist(next);
    setShowForm(false); setEditing(null);
  }
  function deleteContact(id: string) {
    if (!confirm('Delete this contact?')) return;
    persist(contacts.filter((c) => c.id !== id));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) => catFilter === 'all' || c.category === catFilter)
      .filter((c) => {
        if (!q) return true;
        return [c.name, c.company, c.port, c.phone, c.email, c.notes].some((f) => f.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        if (a.emergency !== b.emergency) return a.emergency ? -1 : 1;
        return (a.port || '').localeCompare(b.port || '') || a.name.localeCompare(b.name);
      });
  }, [contacts, query, catFilter]);

  const emergencyCount = contacts.filter((c) => c.emergency).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: rj, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>
          ⚓ Voyage Hub · Contact Book
        </div>
        <h1 style={{ fontFamily: lb, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
          Contact <em style={g}>Book</em>
        </h1>
        <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 720 }}>
          Your agents, surveyors, bunker suppliers, P&amp;I and class contacts — organised by port and
          category, with emergency numbers pinned to the top. Stored in your browser.
        </p>
      </div>

      {/* Action bar */}
      <div className="action-bar" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={openNew} style={goldBtn}>+ Add Contact</button>
        <button onClick={() => window.print()} style={ghostBtn}>🖨️ Print / PDF</button>
        {saveMsg && <span style={{ color: '#4caf76', fontFamily: rj, fontSize: 12, fontWeight: 600 }}>{saveMsg}</span>}
        <span style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginLeft: 'auto' }}>
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}{emergencyCount > 0 && ` · ${emergencyCount} emergency`}
        </span>
      </div>

      {/* PSF cross-sell */}
      <div style={{ ...card, background: 'rgba(200,168,75,.05)', borderColor: 'rgba(200,168,75,.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: rj, fontSize: 12.5, color: '#b0c0a4' }}>
          🔎 Need an agent, chandler or service at a port? <b style={{ color: '#c8a84b' }}>Find verified providers on PortServiceFinder.</b>
        </div>
        <a href="/" style={{ ...ghostBtn, textDecoration: 'none', display: 'inline-block' }}>Search Providers →</a>
      </div>

      {/* Search + filter */}
      {contacts.length > 0 && (
        <div style={card}>
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Search — name, company, port, phone</label>
            <input style={inputStyle} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Singapore, P&I, agent..." />
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button onClick={() => setCatFilter('all')} style={chip(catFilter === 'all')}>All</button>
            {(Object.keys(CATEGORY_META) as Category[]).map((k) => (
              <button key={k} onClick={() => setCatFilter(k)} style={chip(catFilter === k)}>{CATEGORY_META[k].icon} {CATEGORY_META[k].label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && editing && (
        <div style={{ ...card, borderColor: 'rgba(200,168,75,.5)' }}>
          <div style={sectionTitle}>{contacts.some((c) => c.id === editing.id) ? 'Edit Contact' : 'New Contact'}</div>
          <div className="ct-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={label}>Name</label><input style={inputStyle} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="John Tan" /></div>
            <div><label style={label}>Company</label><input style={inputStyle} value={editing.company} onChange={(e) => setEditing({ ...editing, company: e.target.value })} placeholder="ABC Agency Pte Ltd" /></div>
            <div>
              <label style={label}>Category</label>
              <select style={inputStyle} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as Category })}>
                {(Object.keys(CATEGORY_META) as Category[]).map((k) => <option key={k} value={k}>{CATEGORY_META[k].label}</option>)}
              </select>
            </div>
          </div>
          <div className="ct-g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
            <div><label style={label}>Port / Location</label><input style={inputStyle} value={editing.port} onChange={(e) => setEditing({ ...editing, port: e.target.value })} placeholder="Singapore" /></div>
            <div><label style={label}>Phone</label><input style={inputStyle} value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="+65 1234 5678" /></div>
            <div><label style={label}>VHF Ch</label><input style={inputStyle} value={editing.vhf} onChange={(e) => setEditing({ ...editing, vhf: e.target.value })} placeholder="Ch 12" /></div>
          </div>
          <div className="ct-g3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={label}>Email</label><input style={inputStyle} value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="ops@agency.com" /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: rj, fontSize: 12.5, color: editing.emergency ? '#ff8a8a' : '#7a8a72', padding: '7px 0' }}>
                <input type="checkbox" checked={editing.emergency} onChange={(e) => setEditing({ ...editing, emergency: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#ff8a8a' }} />
                🚨 Emergency / 24h
              </label>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={label}>Notes</label><input style={inputStyle} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="OOH mobile, languages, services..." /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveContact} style={{ ...goldBtn, padding: '8px 18px' }} disabled={!editing.name && !editing.company}>Save Contact</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {contacts.length === 0 && !showForm && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>
          No contacts yet. Tap <b style={{ color: '#c8a84b' }}>+ Add Contact</b> to build your book.
        </div>
      )}
      {contacts.length > 0 && filtered.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: '#7a8a72', fontFamily: rj }}>No contacts match your search.</div>
      )}

      <div className="ct-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        {filtered.map((c) => {
          const m = CATEGORY_META[c.category];
          return (
            <div key={c.id} style={{ ...card, marginBottom: 0, borderColor: c.emergency ? 'rgba(255,138,138,.4)' : 'rgba(200,168,75,.18)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: lb, fontSize: 15, fontWeight: 700, color: '#f5f0e8', lineHeight: 1.2 }}>{c.name || c.company}</div>
                  {c.name && c.company && <div style={{ fontFamily: rj, fontSize: 11.5, color: '#b0c0a4' }}>{c.company}</div>}
                  <div style={{ fontFamily: rj, fontSize: 10, color: '#7a8a72', marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span>{m.icon} {m.label}</span>
                    {c.port && <span>📍 {c.port}</span>}
                    {c.vhf && <span>📻 {c.vhf}</span>}
                  </div>
                </div>
                {c.emergency && <span style={{ fontSize: 9, background: 'rgba(255,138,138,.14)', color: '#ff8a8a', padding: '2px 7px', borderRadius: 3, fontFamily: rj, fontWeight: 700, letterSpacing: '.5px', border: '1px solid rgba(255,138,138,.3)', whiteSpace: 'nowrap' }}>🚨 24H</span>}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {c.phone && <a href={`tel:${c.phone.replace(/\s/g, '')}`} style={linkBtn}>📞 {c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`} style={linkBtn}>✉️ Email</a>}
              </div>

              {c.notes && <p style={{ fontFamily: rj, fontSize: 11, color: '#7a8a72', marginTop: 8, lineHeight: 1.5 }}>{c.notes}</p>}

              <div style={{ display: 'flex', gap: 10, marginTop: 10, paddingTop: 8, borderTop: '1px dashed rgba(200,168,75,.12)' }}>
                <button onClick={() => openEdit(c)} style={{ background: 'transparent', border: 'none', color: '#c8a84b', fontFamily: rj, fontSize: 10.5, cursor: 'pointer', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700 }}>Edit</button>
                <button onClick={() => deleteContact(c.id)} style={{ background: 'transparent', border: 'none', color: '#ff8a8a', fontFamily: rj, fontSize: 10.5, cursor: 'pointer', letterSpacing: '.5px', textTransform: 'uppercase', fontWeight: 700 }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .ct-g3, .ct-list { grid-template-columns: 1fr !important; }
          .action-bar button { font-size: 10px !important; padding: 7px 10px !important; }
        }
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; color: black !important; }
          nav, footer, .action-bar { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function chip(active: boolean): React.CSSProperties {
  return {
    padding: '5px 11px',
    background: active ? '#c8a84b' : 'transparent',
    color: active ? '#08100a' : '#7a8a72',
    border: `1px solid ${active ? '#c8a84b' : 'rgba(200,168,75,.25)'}`,
    fontFamily: rj, fontSize: 10, letterSpacing: '.5px', fontWeight: 700, cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap',
  };
}

const linkBtn: React.CSSProperties = {
  display: 'inline-block', textDecoration: 'none', background: '#0c1610', color: '#c8a84b',
  border: '1px solid rgba(200,168,75,.25)', padding: '5px 10px', borderRadius: 3,
  fontFamily: rj, fontSize: 11.5, fontWeight: 600,
};
