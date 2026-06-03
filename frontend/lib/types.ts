// ─── Trip Types ───────────────────────────────────────────────────────────────
export type TripType = 'oneway' | 'round' | 'local' | 'airport';

// ─── Search Query ─────────────────────────────────────────────────────────────
export interface SearchQuery {
  from: string;
  to: string;
  date: string;      // ISO date string  e.g. "2026-05-28"
  time: string;      // "HH:MM"
  returnDate?: string;
  returnTime?: string;
  airportTripType?: 'drop' | 'pickup';
  tripType: TripType;
  passengers?: number;
}

// ─── Cab ──────────────────────────────────────────────────────────────────────
export interface Cab {
  id: string;
  name: string;
  image: string;
  basePrice: number; // in ₹ (without GST)
  car: string;       // e.g. "Aura, Dzire"
  seats: number;
  bags: number;
  rating: number;
  fuelType: 'CNG' | 'Diesel' | 'Petrol' | 'Electric';
  ac: boolean;
}

// ─── Booking Contact ──────────────────────────────────────────────────────────
export interface BookingContact {
  fullName: string;
  mobile: string;
  email: string;
  gstNumber?: string;
  pickupAddress: string;
  dropAddress: string;
}

// ─── Payment Option ───────────────────────────────────────────────────────────
export type PaymentOption = 'zero' | 'full';

// ─── Booking (Saved) ──────────────────────────────────────────────────────────
export interface Booking {
  id: string;            // e.g. "SK-20260528-1234"
  searchQuery: SearchQuery;
  selectedCab: Cab;
  contact: BookingContact;
  paymentOption: PaymentOption;
  baseFare: number;
  gst: number;
  totalFare: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;     // ISO timestamp
}
