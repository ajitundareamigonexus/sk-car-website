'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, RotateCcw, Navigation, Plane, AlertCircle, Phone, MessageCircle } from 'lucide-react';
import { saveSearchQuery } from '@/lib/bookingStore';
import { fromCities, toCities } from '@/data/data';
import type { TripType } from '@/lib/types';

const tabs = [
  { id: 'oneway', label: 'One Way', Icon: MapPin },
  { id: 'round', label: 'Round Trip', Icon: RotateCcw },
  { id: 'local', label: 'Local', Icon: Navigation },
  { id: 'airport', label: 'Airport', Icon: Plane },
] as const;

export default function BookingTabs() {
  const router = useRouter();

  const [active, setActive] = useState<TripType>('oneway');
  const [from, setFrom] = useState(fromCities[0]);
  const [to, setTo] = useState(toCities[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Round trip specific
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');

  // Airport specific
  const [airportTripType, setAirportTripType] = useState<'drop' | 'pickup'>('drop');

  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Set default current date and time on client mount (avoids Next.js hydration mismatch)
  useEffect(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    setDate(todayStr);
    setTime(timeStr);
  }, []);

  // Listen for popular route clicks
  useEffect(() => {
    const handleSetRoute = (e: CustomEvent) => {
      const { from: newFrom, to: newTo } = e.detail;
      if (newFrom) setFrom(newFrom);
      if (newTo) setTo(newTo);
      setActive('oneway');
      
      // Scroll to booking tabs exactly
      const element = document.getElementById('booking-tabs-section');
      if (element) {
        const offset = 100; // Account for fixed navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('setRoute', handleSetRoute as EventListener);
    return () => window.removeEventListener('setRoute', handleSetRoute as EventListener);
  }, []);

  const handleSearch = () => {
    setError('');

    if (!date) { setError('Please select a pickup date.'); return; }
    if (!time) { setError('Please select a pickup time.'); return; }

    if (active === 'oneway' || active === 'round') {
      if (from === to) {
        setError('From and To cities cannot be the same.'); return;
      }
    }

    if (active === 'round') {
      if (!returnDate) { setError('Please select a return date.'); return; }
      if (!returnTime) { setError('Please select a return time.'); return; }
      if (returnDate < date) { setError('Return date cannot be before pickup date.'); return; }
    }

    saveSearchQuery({
      from,
      to,
      date,
      time,
      tripType: active,
      returnDate: active === 'round' ? returnDate : undefined,
      returnTime: active === 'round' ? returnTime : undefined,
      airportTripType: active === 'airport' ? airportTripType : undefined
    });
    router.push('/cabs');
  };

  const isRound = active === 'round';
  const isAirport = active === 'airport';
  const isLocal = active === 'local';

  return (
    <div
      id="booking-tabs-section"
      className="mt-12 rounded-3xl border border-card-border bg-surface p-6 relative z-10"
      style={{ boxShadow: 'var(--shadow-lg)' }}
    >
      <h2 className="text-center text-foreground font-bold text-xl mb-6 tracking-wide">
        PUNE PREMIER INTERCITY CABS
      </h2>

      {/* ── Tab strip ── */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 rounded-2xl bg-card border border-border">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActive(id);
              setError('');
            }}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-xl
              text-sm font-semibold transition-all duration-250
              ${active === id
                ? 'bg-primary text-primary-contrast shadow-md scale-[1.02]'
                : 'text-primary hover:text-foreground hover:bg-background'
              }`}
            style={active === id ? { boxShadow: '0 4px 16px var(--glow)' } : {}}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Fields ── */}
      <div className={`grid gap-4 items-end mb-6 ${isRound ? 'sm:grid-cols-2 lg:grid-cols-6' :
          isAirport ? 'sm:grid-cols-2 lg:grid-cols-5' :
            'sm:grid-cols-2 lg:grid-cols-5'
        }`}>

        {isAirport ? (
          <>
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-semibold text-muted mb-2">Trip</label>
              <select
                value={airportTripType}
                onChange={e => setAirportTripType(e.target.value as 'drop' | 'pickup')}
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary"
              >
                <option value="drop">Drop to Airport</option>
                <option value="pickup">Pickup from Airport</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-semibold text-muted mb-2">
                {airportTripType === 'drop' ? 'Pickup City' : 'Drop City'}
              </label>
              <select
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary"
              >
                {fromCities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-semibold text-muted mb-2">
                {airportTripType === 'drop' ? 'Drop Airport' : 'Pickup Airport'}
              </label>
              <select
                value={to}
                onChange={e => setTo(e.target.value)}
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary"
              >
                <option>Mumbai Airport</option>
                <option>Pune Airport</option>
                <option>Nashik Airport</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-semibold text-muted mb-2">From</label>
              <select
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary"
              >
                {fromCities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {!isLocal && (
              <div className="lg:col-span-1">
                <label className="block text-[11px] font-semibold text-muted mb-2">To</label>
                <select
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary"
                >
                  {toCities.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            )}
          </>
        )}

        <div className="lg:col-span-1">
          <label className="block text-[11px] font-semibold text-muted mb-2">Pickup Date</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="lg:col-span-1">
          <label className="block text-[11px] font-semibold text-muted mb-2">Pickup Time</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary"
          />
        </div>

        {isRound && (
          <>
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-semibold text-muted mb-2">Return Date</label>
              <input
                type="date"
                min={date || today}
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-semibold text-muted mb-2">Return Time</label>
              <input
                type="time"
                value={returnTime}
                onChange={e => setReturnTime(e.target.value)}
                className="w-full rounded-xl border border-border bg-background text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </>
        )}

        {/* CTA */}
        <div className={isLocal ? "lg:col-span-2" : "lg:col-span-1"}>
          <button
            onClick={handleSearch}
            className="w-full relative overflow-hidden h-[50px] rounded-xl bg-primary text-primary-contrast font-bold text-sm shimmer-btn transition-all duration-200 hover:scale-105 hover:opacity-95 active:scale-95 flex items-center justify-center gap-2"
            style={{ boxShadow: '0 4px 20px var(--glow)' }}
          >
            Explore Cabs →
          </button>
        </div>
      </div>

      {/* ── Features ── */}
      <div className="flex justify-center gap-6 mt-6 text-xs text-muted font-medium">
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Free Cancellation</span>
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> 24/7 Support</span>
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Best Price</span>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}