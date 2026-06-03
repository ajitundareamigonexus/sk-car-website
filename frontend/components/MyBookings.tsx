'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car, CalendarDays, Clock, MapPin, IndianRupee, ArrowRight,
  Search, AlertCircle, XCircle, CheckCircle2, RefreshCw, Home, Phone, Mail, User
} from 'lucide-react';
import { getAllBookings, updateBookingStatus } from '@/lib/bookingStore';
import type { Booking } from '@/lib/types';
import { getMyBookings, cancelBooking } from '@/lib/api';

const STATUS_CFG = {
  confirmed: {
    label: 'Confirmed',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
    border: 'border-teal-400/20',
  },
  completed: {
    label: 'Completed',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
  },
} as const;

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way',
  round: 'Round Trip',
  local: 'Local',
  airport: 'Airport',
};

function fmtDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtTime(t: string) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function MyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Normalizer: converts backend DTO to local nested shape
  const normalizeBooking = (b: any): Booking => {
    if (b.searchQuery && b.contact && b.selectedCab) return b as Booking; // already local shape
    return {
      id: b.id ? String(b.id) : b.bookingId,
      searchQuery: {
        from: b.fromCity,
        to: b.toCity,
        date: b.travelDate,
        time: b.travelTime,
        tripType: b.tripType as any,
        passengers: b.passengers,
      },
      selectedCab: {
        id: String(b.cabId),
        name: b.cabName,
        car: b.cabCar,
        basePrice: b.baseFare,
        seats: b.cabSeats,
        bags: 0,
        rating: b.cabRating || 0,
        fuelType: (b.cabFuelType as any) || 'Petrol',
        ac: b.cabAc ?? true,
        image: ''
      },
      contact: {
        fullName: b.fullName || b.customerName,
        mobile: b.mobile || b.customerMobile,
        email: b.email || b.customerEmail,
        pickupAddress: b.pickupAddress,
        dropAddress: b.dropAddress,
      },
      paymentOption: b.paymentOption as any,
      baseFare: b.baseFare,
      gst: b.gst,
      totalFare: b.totalFare,
      status: b.status.toLowerCase() as any,
      createdAt: b.createdAt,
    };
  };

  useEffect(() => {
    // Commented out API calls to work fully offline
    /*
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
      getMyBookings()
        .then(data => {
          setBookings((data || []).map(normalizeBooking));
        })
        .catch(err => {
          console.error("Failed to load user bookings from backend API, falling back locally:", err);
          setBookings(getAllBookings());
        });
    } else {
      setBookings(getAllBookings());
    }
    */
    setBookings((getAllBookings() || []).map(normalizeBooking));
  }, []);

  const handleConfirmCancel = async (id: string) => {
    // Commented out API calls to work fully offline
    /*
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
      try {
        await cancelBooking(id);
        // Update status locally
        updateBookingStatus(id, 'cancelled');
        // Re-fetch from API
        const data = await getMyBookings();
        setBookings(data || []);
      } catch (err) {
        console.error("Failed to cancel booking via backend API, falling back locally:", err);
        updateBookingStatus(id, 'cancelled');
        setBookings(getAllBookings());
      }
    } else {
      updateBookingStatus(id, 'cancelled');
      setBookings(getAllBookings());
    }
    */
    updateBookingStatus(id, 'cancelled');
    setBookings((getAllBookings() || []).map(normalizeBooking));
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return bookings.filter(b => {
      // Filter by search text (mobile, email, name, booking ID, cities)
      const matchesSearch = !q || [
        b.id,
        b.contact.fullName,
        b.contact.mobile,
        b.contact.email,
        b.searchQuery.from,
        b.searchQuery.to,
        b.selectedCab.name
      ].some(v => String(v).toLowerCase().includes(q));

      // Filter by tab
      const matchesTab = activeTab === 'all' || b.status === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [bookings, searchQuery, activeTab]);

  return (
    <section className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 border border-teal-500/20 bg-teal-500/5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-400">
            Customer Area
          </div>
          <h1 className="text-4xl font-black mb-3">My Cab Bookings</h1>
          <p className="text-muted text-sm max-w-md mx-auto">
            View details, check status, or manage your active and past cab bookings.
          </p>
        </div>

        {/* Dashboard Grid / Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by Mobile, Email, Name or Booking ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-card border border-border rounded-xl pl-11 pr-4 text-sm outline-none focus:border-primary transition-all placeholder:text-muted"
            />
          </div>

          {/* Tab buttons */}
          <div className="flex bg-card border border-border p-1 rounded-xl overflow-x-auto shrink-0">
            {(['all', 'confirmed', 'completed', 'cancelled'] as const).map(tab => {
              const count = bookings.filter(b => tab === 'all' || b.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all shrink-0 ${activeTab === tab
                      ? 'bg-primary text-primary-contrast shadow-sm'
                      : 'text-muted hover:text-foreground'
                    }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-3xl p-8">
            <Car size={48} className="mx-auto mb-4 text-muted opacity-30 animate-pulse" />
            <h3 className="text-lg font-bold text-foreground mb-1">No Bookings Found</h3>
            <p className="text-muted text-sm max-w-sm mx-auto mb-6">
              {bookings.length === 0
                ? "You haven't booked any cabs on this browser yet."
                : "No bookings match your search query."}
            </p>
            <button
              onClick={() => router.push('/#booking-tabs-section')}
              className="inline-flex items-center gap-2 bg-primary text-primary-contrast px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all"
            >
              <Home size={16} />
              Book Your Cab Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(b => {
              const cfg = STATUS_CFG[b.status];
              return (
                <div
                  key={b.id}
                  className="rounded-3xl border border-card-border bg-card overflow-hidden hover:border-primary/20 transition-all shadow-sm"
                >
                  {/* Card Header */}
                  <div className="px-6 py-4 bg-teal-500/5 border-b border-card-border flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-teal-400 font-extrabold text-sm tracking-wider">{b.id}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted">
                      Booked on: {new Date(b.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 grid md:grid-cols-3 gap-6">
                    {/* Column 1: Route & Details */}
                    <div>
                      <h4 className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2">Route Details</h4>
                      <div className="flex items-center gap-2 text-sm font-bold flex-wrap mb-1">
                        <span className="text-foreground">{b.searchQuery.from}</span>
                        <ArrowRight size={13} className="text-muted shrink-0" />
                        <span className="text-foreground">{b.searchQuery.to}</span>
                      </div>
                      <p className="text-xs text-muted">
                        {TRIP_LABELS[b.searchQuery.tripType]} &middot; {b.searchQuery.passengers ?? 1} Passengers
                      </p>

                      <div className="mt-4 space-y-1">
                        <div className="text-xs flex items-center gap-1.5 text-muted">
                          <CalendarDays size={13} className="text-teal-400 shrink-0" />
                          <span>{fmtDate(b.searchQuery.date)}</span>
                        </div>
                        <div className="text-xs flex items-center gap-1.5 text-muted">
                          <Clock size={13} className="text-teal-400 shrink-0" />
                          <span>{fmtTime(b.searchQuery.time)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Cab & Fare */}
                    <div>
                      <h4 className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2">Car &amp; Fare</h4>
                      <div className="flex items-center gap-2 text-sm font-bold mb-1">
                        <Car size={15} className="text-teal-400 shrink-0" />
                        <span>{b.selectedCab.name}</span>
                      </div>
                      <p className="text-xs text-muted">{b.selectedCab.car} or similar</p>

                      <div className="mt-4">
                        <span className="text-xs text-muted block">Total Price (incl. GST)</span>
                        <span className="text-teal-400 text-xl font-black">₹{b.totalFare.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-muted block mt-0.5">
                          {b.paymentOption === 'zero' ? '💵 Pay at Drop' : '💳 Paid Online'}
                        </span>
                      </div>
                    </div>

                    {/* Column 3: Contact & Actions */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2">Booking Contact</h4>
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                          <User size={12} className="text-teal-400 shrink-0" />
                          {b.contact.fullName}
                        </p>
                        <p className="text-xs text-muted flex items-center gap-1.5">
                          <Phone size={11} className="text-teal-400 shrink-0" />
                          {b.contact.mobile}
                        </p>
                      </div>

                      {/* Cancel Button */}
                      {b.status === 'confirmed' && (
                        cancellingId === b.id ? (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-2 animate-fadeIn">
                            <p className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider text-center">Cancel this ride?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  handleConfirmCancel(b.id);
                                  setCancellingId(null);
                                }}
                                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setCancellingId(null)}
                                className="flex-1 py-2 bg-surface hover:bg-neutral-800 text-foreground border border-border rounded-xl text-xs font-bold transition-all active:scale-95"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancellingId(b.id)}
                            className="mt-4 flex items-center justify-center gap-1.5 w-full md:w-auto px-4 py-2.5 border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                          >
                            <XCircle size={14} />
                            Cancel Ride
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Pickup & Drop Addresses */}
                  <div className="px-6 pb-5 grid sm:grid-cols-2 gap-4 border-t border-border pt-4 bg-background/20">
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="text-green-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[9px] text-muted uppercase font-bold tracking-wider">Pickup Address</span>
                        <p className="text-xs font-medium text-foreground mt-0.5">{b.contact.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[9px] text-muted uppercase font-bold tracking-wider">Drop Address</span>
                        <p className="text-xs font-medium text-foreground mt-0.5">{b.contact.dropAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
