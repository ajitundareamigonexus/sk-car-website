'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, ArrowRight, CalendarDays, Clock,
  User, Phone, Mail, MapPin, Car, Home,
} from 'lucide-react';
import { getLatestBooking } from '@/lib/bookingStore';
import type { Booking } from '@/lib/types';

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way',
  round: 'Round Trip',
  local: 'Local',
  airport: 'Airport',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-teal-400" />
      </div>
      <div>
        <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setBooking(getLatestBooking());
    // Trigger entrance animation after mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (
    !booking ||
    !booking.searchQuery ||
    !booking.selectedCab ||
    !booking.contact
  ) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold">
            Booking data not found
          </h2>

          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-teal-400 text-black px-6 py-3 rounded-xl"
          >
            Go Home
          </button>
        </div>
      </section>
    );
  }

  const { searchQuery: sq, selectedCab: cab, contact, baseFare, gst, totalFare, paymentOption } = booking;

  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-24">
      <div className="max-w-3xl mx-auto">

        {/* ── Success Banner ── */}
        <div
          className={`text-center mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
        >
          {/* Animated checkmark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-28 h-28 rounded-full bg-teal-400/10 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-teal-400/15 border-2 border-teal-400/30
                            flex items-center justify-center">
              <CheckCircle2 size={44} className="text-teal-400" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-muted">
            Your cab is booked. We&apos;ll reach out shortly with driver details.
          </p>

          {/* Booking ID badge */}
          <div className="mt-4 inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-5 py-2">
            <span className="text-xs text-muted uppercase tracking-widest">Booking ID</span>
            <span className="text-teal-400 font-bold tracking-wider">{booking.id}</span>
          </div>
        </div>

        {/* ── Summary Card ── */}
        <div
          className={`rounded-3xl border border-card-border bg-card overflow-hidden mb-6 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
        >
          {/* Card Header */}
          <div className="bg-teal-500/10 px-6 py-4 border-b border-teal-500/10 flex flex-wrap items-center gap-3">
            <span className="text-teal-400 font-bold text-lg">{sq.from}</span>
            <ArrowRight size={16} className="text-muted" />
            <span className="text-teal-400 font-bold text-lg">{sq.to}</span>
            <span className="ml-auto bg-surface border border-border text-xs font-semibold px-3 py-1 rounded-full">
              {TRIP_LABELS[sq.tripType]}
            </span>
          </div>

          <div className="p-6 grid sm:grid-cols-2 gap-6">

            {/* Left col — Trip info */}
            <div className="space-y-4">
              <InfoRow icon={Car} label="Vehicle" value={`${cab.name} (${cab.car})${sq.passengers ? ` — ${sq.passengers} Passengers` : ''}`} />
              <InfoRow icon={CalendarDays} label="Pickup Date" value={formatDate(sq.date)} />
              <InfoRow icon={Clock} label="Pickup Time" value={formatTime(sq.time)} />
              <InfoRow icon={MapPin} label="Pickup" value={contact.pickupAddress} />
              <InfoRow icon={MapPin} label="Drop" value={contact.dropAddress} />
            </div>

            {/* Right col — Contact info */}
            <div className="space-y-4">
              <InfoRow icon={User} label="Passenger" value={contact.fullName} />
              <InfoRow icon={Phone} label="Mobile" value={contact.mobile} />
              <InfoRow icon={Mail} label="Email" value={contact.email} />
              {contact.gstNumber && (
                <InfoRow icon={CheckCircle2} label="GST Number" value={contact.gstNumber} />
              )}
            </div>
          </div>
        </div>

        {/* ── Fare Card ── */}
        <div
          className={`rounded-3xl border border-card-border bg-card p-6 mb-8 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
        >
          <h2 className="text-lg font-bold mb-4">Fare Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Base Fare</span>
              <span>₹{baseFare.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">GST (5%)</span>
              <span>₹{gst.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-teal-400">₹{totalFare.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-muted pt-1">
              <span>Payment Mode</span>
              <span className="capitalize font-medium">
                {paymentOption === 'zero' ? 'Pay at drop (₹0 now)' : 'Full payment done'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div
          className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
        >
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl
                       bg-teal-400 text-black font-bold text-base hover:scale-[1.02] transition-all"
          >
            <Home size={18} />
            Back to Home
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.print();
              }
            }}
            className="flex-1 h-14 rounded-2xl border-2 border-teal-400 text-teal-400
                       font-bold text-base hover:bg-teal-400/10 transition-all"
          >
            Print / Save Receipt
          </button>
        </div>

      </div>
    </section>
  );
}
