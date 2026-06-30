// ============================================================
// VOYAGE STORAGE HELPER
// Saves voyage tool data in browser localStorage
// No backend required, no signup, no tracking
// ============================================================

const STORAGE_PREFIX = 'psf_voyage_';
const STORAGE_VERSION = '1';

export type ToolKey =
  | 'bunker'
  | 'distance'
  | 'tracker'
  | 'cii'
  | 'laytime'
  | 'tce'
  | 'draft'
  | 'ports'
  | 'psc'
  | 'tide'
  | 'documents'
  | 'fleet'
  | 'cp'
  | 'noon'
  | 'disbursement'
  | 'contacts'
  | 'crew'
  | 'cargo'
  | 'vetting'
  | 'hire'
  | 'claims'
  | 'incidents'
  | 'drills'
  | 'marpol'
  | 'maintenance'
  | 'spares'
  | 'drydock'
  | 'training'
  | 'photos'
  | 'invoices'
  | 'cyber'
  | 'mlc'
  | 'emergency'
  | 'bunkersurvey'
  | 'planner'
  | 'congestion'
  | 'holidays'
  | 'news';

interface SavedItem<T = unknown> {
  id: string;
  key: ToolKey;
  name: string;
  data: T;
  createdAt: string;
  updatedAt: string;
  version: string;
}

// Generate simple unique ID
export function genId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
}

// Save data for a tool (auto-save current item)
export function saveItem<T>(key: ToolKey, name: string, data: T, existingId?: string): SavedItem<T> {
  if (typeof window === 'undefined') {
    return { id: '', key, name, data, createdAt: '', updatedAt: '', version: STORAGE_VERSION };
  }

  const id = existingId || genId();
  const now = new Date().toISOString();
  const existing = existingId ? loadItem<T>(key, existingId) : null;

  const item: SavedItem<T> = {
    id,
    key,
    name,
    data,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    version: STORAGE_VERSION,
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}_${id}`, JSON.stringify(item));
  } catch (e) {
    console.error('Storage save failed:', e);
  }

  return item;
}

// Load a specific saved item
export function loadItem<T>(key: ToolKey, id: string): SavedItem<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}_${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as SavedItem<T>;
  } catch {
    return null;
  }
}

// List all saved items for a tool
export function listItems<T>(key: ToolKey): SavedItem<T>[] {
  if (typeof window === 'undefined') return [];
  const items: SavedItem<T>[] = [];
  const prefix = `${STORAGE_PREFIX}${key}_`;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            items.push(JSON.parse(raw) as SavedItem<T>);
          } catch {
            /* skip corrupted */
          }
        }
      }
    }
  } catch (e) {
    console.error('Storage list failed:', e);
  }

  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// Delete a saved item
export function deleteItem(key: ToolKey, id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}_${id}`);
    return true;
  } catch {
    return false;
  }
}

// Count items across all tools (for dashboard badge)
export function countAll(): number {
  if (typeof window === 'undefined') return 0;
  let count = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) count++;
    }
  } catch {
    /* ignore */
  }
  return count;
}

// Export all data as JSON (for backup)
export function exportAll(): string {
  if (typeof window === 'undefined') return '{}';
  const data: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            data[k] = JSON.parse(raw);
          } catch {
            /* skip */
          }
        }
      }
    }
  } catch (e) {
    console.error('Export failed:', e);
  }
  return JSON.stringify(data, null, 2);
}

// Import data from JSON (restore backup)
export function importAll(jsonStr: string): { success: boolean; count: number; error?: string } {
  if (typeof window === 'undefined') return { success: false, count: 0, error: 'No window' };
  try {
    const data = JSON.parse(jsonStr);
    let count = 0;
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith(STORAGE_PREFIX)) {
        localStorage.setItem(k, JSON.stringify(v));
        count++;
      }
    }
    return { success: true, count };
  } catch (e) {
    return { success: false, count: 0, error: e instanceof Error ? e.message : 'Parse error' };
  }
}
