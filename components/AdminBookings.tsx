'use client';

import { useState, useMemo } from 'react';
import {
  Hash, IndianRupee, Clock, CheckCircle2, XCircle, Search, Download, Car, ArrowRight,
  CalendarDays, Users, Phone, Mail, MapPin, RefreshCw
} from 'lucide-react';
import { cancelBooking, updateBookingStatus as updateBookingStatusApi, getAllBookings as getAllBookingsApi } from '@/lib/api';
import { updateBookingStatus, getAllBookings } from '@/lib/bookingStore';
import type { Booking } from '@/lib/types';

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

function fmt(dateStr: string) {
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

function fmtDT(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

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

interface AdminBookingsProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

export default function AdminBookings({ bookings, setBookings }: AdminBookingsProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Ensure bookings are in the local normalized shape before use
  const bookingsNorm = (bookings || []).map(normalizeBooking);

  const changeStatus = async (id: string, status: Booking['status']) => {
    // Commented out API calls to work fully offline
    /*
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    if (token) {
      try {
        if (status === 'cancelled') {
          await cancelBooking(id);
        } else {
          await updateBookingStatusApi(id, status.toUpperCase());
        }
        updateBookingStatus(id, status);
        const data = await getAllBookingsApi();
        setBookings((data || []).map(normalizeBooking));
      } catch (err) {
        console.error("Failed to update status on backend, updating locally:", err);
        updateBookingStatus(id, status);
        setBookings(getAllBookings());
      }
    } else {
      updateBookingStatus(id, status);
      setBookings(getAllBookings());
    }
    */

    // Perform updates directly on local storage
    updateBookingStatus(id, status);
    setBookings((getAllBookings() || []).map(normalizeBooking));
  };

  const exportCSV = () => {
    const headers = [
      'Booking ID', 'Customer Name', 'Mobile', 'Email',
      'From', 'To', 'Trip Type', 'Travel Date', 'Travel Time',
      'Cab', 'Car Model', 'Passengers',
      'Base Fare', 'GST', 'Total Fare', 'Payment Mode',
      'Pickup Address', 'Drop Address',
      'Status', 'Booked At',
    ];
    const rows = bookingsNorm.map(b => [
      b.id,
      b.contact.fullName,
      b.contact.mobile,
      b.contact.email,
      b.searchQuery.from,
      b.searchQuery.to,
      TRIP_LABELS[b.searchQuery.tripType] ?? b.searchQuery.tripType,
      fmt(b.searchQuery.date),
      fmtTime(b.searchQuery.time),
      b.selectedCab.name,
      b.selectedCab.car,
      b.searchQuery.passengers ?? 1,
      b.baseFare,
      b.gst,
      b.totalFare,
      b.paymentOption === 'zero' ? 'Pay at Drop' : 'Paid Online',
      b.contact.pickupAddress,
      b.contact.dropAddress,
      b.status,
      fmtDT(b.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SK_Bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const total = bookingsNorm.length;
    const confirmed = bookingsNorm.filter(b => b.status === 'confirmed').length;
    const completed = bookingsNorm.filter(b => b.status === 'completed').length;
    const cancelled = bookingsNorm.filter(b => b.status === 'cancelled').length;
    const revenue = bookingsNorm
      .filter(b => b.status !== 'cancelled')
      .reduce((s, b) => s + b.totalFare, 0);
    return { total, confirmed, completed, cancelled, revenue };
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookingsNorm.filter(b => {
      const matchSearch =
        !q ||
        [b.id, b.contact.fullName, b.contact.mobile, b.contact.email,
        b.searchQuery.from, b.searchQuery.to, b.selectedCab.name]
          .some(v => v.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, search, statusFilter]);

  return (
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {([
          { label: 'Total Bookings', value: stats.total, Icon: Hash, color: 'text-teal-400', bg: 'bg-teal-400/10' },
          { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, Icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Confirmed', value: stats.confirmed, Icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Completed', value: stats.completed, Icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Cancelled', value: stats.cancelled, Icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
        ] as const).map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-card-border bg-card p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-muted mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by name, booking ID, mobile, route…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl border border-border bg-background pl-10 pr-4
                       text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-border bg-background px-4 text-sm
                     outline-none focus:border-primary transition-colors min-w-[160px]"
        >
          <option value="all">All Status ({bookingsNorm.length})</option>
          <option value="confirmed">Confirmed ({stats.confirmed})</option>
          <option value="completed">Completed ({stats.completed})</option>
          <option value="cancelled">Cancelled ({stats.cancelled})</option>
        </select>
        <button
          onClick={exportCSV}
          disabled={bookingsNorm.length === 0}
          className="flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 text-teal-400
                     px-4 py-2 rounded-xl text-sm font-semibold h-11
                     hover:bg-teal-400 hover:text-black transition-all cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* ── Results count ── */}
      {search || statusFilter !== 'all' ? (
          <p className="text-xs text-muted mb-4">
          Showing {filtered.length} of {bookingsNorm.length} booking{bookingsNorm.length !== 1 ? 's' : ''}
        </p>
      ) : null}

      {/* ── Booking Cards ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-muted">
          <Car size={52} className="mx-auto mb-4 opacity-25" />
          <p className="text-lg font-semibold">
            {bookingsNorm.length === 0 ? 'No bookings yet' : 'No bookings match your search'}
          </p>
          <p className="text-sm mt-1">
            {bookingsNorm.length === 0
              ? 'Once customers book cabs, they will appear here.'
              : 'Try clearing the search or changing the filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => {
            const cfg = STATUS_CFG[booking.status];
            const sq = booking.searchQuery;
            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-card-border bg-card overflow-hidden transition-all hover:border-primary/30"
              >
                {/* Card Top */}
                <div className="px-5 py-3 bg-teal-500/5 border-b border-card-border flex flex-wrap items-center gap-3">
                  <span className="font-bold text-teal-400 text-sm tracking-wider">{booking.id}</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg?.color || ''} ${cfg?.bg || ''} ${cfg?.border || ''}`}>
                    {cfg?.label || booking.status}
                  </span>
                  {booking.paymentOption === 'full' ? (
                    <span className="text-xs font-semibold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                      💳 Paid Online
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                      💵 Pay at Drop
                    </span>
                  )}
                  <span className="text-xs text-muted ml-auto">
                    Booked on: {fmtDT(booking.createdAt)}
                  </span>
                </div>

                {/* Card Body — 4 columns */}
                <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

                  {/* Route */}
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-2">Route</p>
                    <div className="flex items-center gap-2 font-semibold text-sm flex-wrap">
                      <span className="text-teal-400">{sq.from}</span>
                      <ArrowRight size={13} className="text-muted shrink-0" />
                      <span className="text-teal-400">{sq.to}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {TRIP_LABELS[sq.tripType] ?? sq.tripType}
                      {sq.passengers ? ` · ${sq.passengers} passenger${sq.passengers > 1 ? 's' : ''}` : ''}
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-2">Travel Date &amp; Time</p>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <CalendarDays size={13} className="text-teal-400" />
                      {fmt(sq.date)}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted mt-1">
                      <Clock size={13} className="text-teal-400" />
                      {fmtTime(sq.time)}
                    </div>
                    {sq.returnDate && (
                      <p className="text-xs text-muted mt-1">
                        Return: {fmt(sq.returnDate)} {fmtTime(sq.returnTime ?? '')}
                      </p>
                    )}
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-2">Customer Details</p>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <Users size={13} className="text-teal-400" />
                      {booking.contact.fullName}
                    </p>
                    <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                      <Phone size={11} className="text-teal-400" />
                      {booking.contact.mobile}
                    </p>
                    <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                      <Mail size={11} className="text-teal-400" />
                      {booking.contact.email}
                    </p>
                  </div>

                  {/* Cab & Fare */}
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-2">Cab &amp; Fare</p>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <Car size={13} className="text-teal-400" />
                      {booking.selectedCab.name}
                    </p>
                    <p className="text-xs text-muted">{booking.selectedCab.car} or similar</p>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-teal-400 font-black text-lg">
                        ₹{booking.totalFare.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-muted">incl. GST</span>
                    </div>
                  </div>
                </div>

                {/* Pickup / Drop addresses */}
                <div className="px-5 pb-4 grid sm:grid-cols-2 gap-3">
                  <div className="bg-background/60 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <MapPin size={13} className="text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Pickup Address</p>
                      <p className="text-xs font-medium mt-0.5">{booking.contact.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="bg-background/60 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <MapPin size={13} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Drop Address</p>
                      <p className="text-xs font-medium mt-0.5">{booking.contact.dropAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons (only for confirmed) */}
                {booking.status === 'confirmed' && (
                  <div className="px-5 pb-4 flex gap-2 flex-wrap border-t border-card-border pt-3">
                    <button
                      onClick={() => changeStatus(booking.id, 'completed')}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                                 bg-blue-400/10 text-blue-400 border border-blue-400/20
                                 hover:bg-blue-400 hover:text-white transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => changeStatus(booking.id, 'cancelled')}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                                 bg-red-400/10 text-red-400 border border-red-400/20
                                 hover:bg-red-400 hover:text-white transition-all cursor-pointer"
                    >
                      <XCircle size={13} />
                      Cancel Booking
                    </button>
                  </div>
                )}
                {booking.status === 'cancelled' && (
                  <div className="px-5 pb-4 border-t border-card-border pt-3">
                    <button
                      onClick={() => changeStatus(booking.id, 'confirmed')}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                                 bg-teal-400/10 text-teal-400 border border-teal-400/20
                                 hover:bg-teal-400 hover:text-black transition-all cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      Restore Booking
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
