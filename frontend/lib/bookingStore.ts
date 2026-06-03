import type { Booking, Cab, SearchQuery } from './types';

const KEYS = {
  SEARCH:   'sk_search_query',
  CAB:      'sk_selected_cab',
  BOOKINGS: 'sk_bookings',
  CABS:     'sk_cabs',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateBookingId(): string {
  const now  = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SK-${date}-${rand}`;
}

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('localStorage write failed for key:', key);
  }
}

// ─── Search Query ─────────────────────────────────────────────────────────────
export function saveSearchQuery(query: SearchQuery): void {
  safeSet(KEYS.SEARCH, query);
}

export function getSearchQuery(): SearchQuery | null {
  return safeGet<SearchQuery>(KEYS.SEARCH);
}

// ─── Selected Cab ─────────────────────────────────────────────────────────────
export function saveSelectedCab(cab: Cab): void {
  safeSet(KEYS.CAB, cab);
}

export function getSelectedCab(): Cab | null {
  return safeGet<Cab>(KEYS.CAB);
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export function getAllBookings(): Booking[] {
  return safeGet<Booking[]>(KEYS.BOOKINGS) ?? [];
}

export function saveBooking(
  data: Omit<Booking, 'id' | 'createdAt' | 'status'>
): Booking {
  const booking: Booking = {
    ...data,
    id:        generateBookingId(),
    status:    'confirmed',
    createdAt: new Date().toISOString(),
  };

  const existing = getAllBookings();
  safeSet(KEYS.BOOKINGS, [booking, ...existing]);
  return booking;
}

export function getLatestBooking(): Booking | null {
  const all = getAllBookings();
  return all.length > 0 ? all[0] : null;
}

// ─── Update Booking Status (admin) ───────────────────────────────────────────
export function updateBookingStatus(id: string, status: Booking['status']): void {
  const all = getAllBookings();
  const updated = all.map(b => (b.id === id ? { ...b, status } : b));
  safeSet(KEYS.BOOKINGS, updated);
}

// ─── Clear current search session ────────────────────────────────────────────
export function clearCurrentSearch(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.SEARCH);
  localStorage.removeItem(KEYS.CAB);
}

// ─── Cabs Local Storage Management ────────────────────────────────────────────
export function getAllCabs(): Cab[] {
  const local = safeGet<Cab[]>(KEYS.CABS);
  if (!local || local.length === 0) {
    if (typeof window !== 'undefined') {
      const defaultCabs = require('@/data/data').cabs;
      safeSet(KEYS.CABS, defaultCabs);
      return defaultCabs;
    }
    return [];
  }
  return local;
}

export function saveCab(cabData: Omit<Cab, 'id'>): Cab {
  const cabs = getAllCabs();
  const newCab: Cab = {
    ...cabData,
    id: `cab-${Date.now()}`,
    image: cabData.image || '/images/hyundai_aura.png',
  };
  safeSet(KEYS.CABS, [...cabs, newCab]);
  return newCab;
}

export function updateLocalCab(id: string, cabData: Partial<Cab>): Cab | null {
  const cabs = getAllCabs();
  let updatedCab: Cab | null = null;
  const updatedCabs = cabs.map(c => {
    if (String(c.id) === String(id)) {
      updatedCab = { ...c, ...cabData };
      return updatedCab;
    }
    return c;
  });
  safeSet(KEYS.CABS, updatedCabs);
  return updatedCab;
}

export function deleteLocalCab(id: string | number): void {
  const cabs = getAllCabs();
  const filtered = cabs.filter(c => String(c.id) !== String(id));
  safeSet(KEYS.CABS, filtered);
}
