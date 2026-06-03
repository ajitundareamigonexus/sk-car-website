'use client';

import { useEffect, useState } from 'react';
import { Users, Briefcase, Snowflake, Star, ArrowRight, CalendarDays, Clock, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getSearchQuery, saveSelectedCab, saveSearchQuery, getAllCabs } from '@/lib/bookingStore';
import { GST_RATE, calculateBasePrice } from '@/data/data';
import type { SearchQuery, Cab } from '@/lib/types';

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way',
  round: 'Round Trip',
  local: 'Local',
  airport: 'Airport',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatTime(timeStr: string) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function CabListingPage() {
  const router = useRouter();
  const [search, setSearch] = useState<SearchQuery | null>(null);
  const [passengers, setPassengers] = useState(4);
  const [cabs, setCabs] = useState<Cab[]>([]);

  useEffect(() => {
    const query = getSearchQuery();
    setSearch(query);
    if (query?.passengers) {
      setPassengers(query.passengers);
    }

    // Commented out API calls to work fully offline
    /*
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030/api";
    fetch(`${apiBase}/cabs`)
      .then(res => {
        if (!res.ok) throw new Error("Backend response error");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCabs(data);
        } else {
          setCabs(staticCabs);
        }
      })
      .catch(err => {
        console.warn("Failed to fetch cabs from backend, using default fleet:", err);
        setCabs(staticCabs);
      });
    */

    setCabs(getAllCabs());
  }, []);

  const updatePassengers = (val: number) => {
    const newVal = Math.max(1, Math.min(20, val));
    setPassengers(newVal);
    const query = getSearchQuery();
    if (query) {
      const updated = { ...query, passengers: newVal };
      setSearch(updated);
      saveSearchQuery(updated);
    }
  };

  const handleBookNow = (cabId: string) => {
    const cab = cabs.find(c => c.id === cabId);
    if (!cab) return;

    // Calculate dynamic price based on selected route
    const dynamicPrice = calculateBasePrice(
      cab.id,
      search?.from || 'Mumbai',
      search?.to || 'Pune',
      search?.tripType || 'oneway'
    );

    const updatedCab = {
      ...cab,
      basePrice: dynamicPrice,
    };

    saveSelectedCab(updatedCab);
    router.push('/booking');
  };

  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-28 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* ── Top Bar ── */}
        <div className="mb-10 rounded-3xl border border-teal-500/20 bg-teal-500/10 p-6">
          <div className="flex flex-wrap gap-6 items-center justify-between">

            {search ? (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-teal-400 font-bold text-base">{search.from}</span>
                <ArrowRight size={16} className="text-muted" />
                <span className="text-teal-400 font-bold text-base">{search.to}</span>

                <span className="bg-surface px-3 py-1 rounded-full text-xs font-semibold border border-border">
                  {TRIP_LABELS[search.tripType] ?? search.tripType}
                </span>

                <span className="flex items-center gap-1 text-muted">
                  <CalendarDays size={14} />
                  {formatDate(search.date)}
                </span>

                <span className="flex items-center gap-1 text-muted">
                  <Clock size={14} />
                  {formatTime(search.time)}
                </span>

                {/* Passengers count selector in top bar */}
                <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-full border border-border text-muted">
                  <Users size={14} className="text-teal-400" />
                  <span className="text-xs font-medium">Passengers:</span>
                  <div className="flex items-center gap-1.5 ml-1">
                    <button
                      onClick={() => updatePassengers(passengers - 1)}
                      className="w-5 h-5 flex items-center justify-center rounded bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-black font-bold text-xs transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-foreground min-w-[12px] text-center">{passengers}</span>
                    <button
                      onClick={() => updatePassengers(passengers + 1)}
                      className="w-5 h-5 flex items-center justify-center rounded bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-black font-bold text-xs transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted text-sm">No search query found. Go back and search.</div>
            )}

            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 border border-teal-400 text-teal-400 px-5 py-2 rounded-xl hover:bg-teal-400 hover:text-black transition-all text-sm font-semibold"
            >
              <Edit2 size={14} />
              Modify
            </button>
          </div>
        </div>

        {/* ── Cab Cards ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cabs.map((cab) => {
            const dynamicPrice = calculateBasePrice(
              cab.id,
              search?.from || 'Mumbai',
              search?.to || 'Pune',
              search?.tripType || 'oneway'
            );
            const gst = Math.round(dynamicPrice * GST_RATE);
            const total = dynamicPrice + gst;

            return (
              <div
                key={cab.id}
                className="rounded-3xl overflow-hidden border border-card-border bg-card card-hover flex flex-col"
              >
                {/* Top */}
                <div className="bg-teal-500/10 px-4 py-2.5 border-b border-teal-500/10">
                  <h3 className="text-teal-400 font-semibold text-xs truncate">
                    {search
                      ? `${search.from} To ${search.to}`
                      : 'Outstation Cab'}
                  </h3>
                </div>

                {/* Image */}
                <div className="p-4 bg-surface flex items-center justify-center relative w-full h-36">
                  <Image
                    src={cab.image}
                    alt={cab.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>

                {/* Content */}
                <div className="px-4 pb-4 pt-1 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div>
                        <h2 className="text-lg font-bold tracking-tight text-foreground">{cab.name}</h2>
                        <p className="text-muted text-xs">{cab.car} or similar</p>
                      </div>

                      <div className="bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full text-teal-400 text-xs flex items-center gap-1 shrink-0">
                        {cab.rating} <Star size={11} fill="currentColor" />
                      </div>
                    </div>

                    {/* Feature Pills */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="border border-border rounded-xl h-16 flex flex-col items-center justify-center gap-0.5 bg-background/50">
                        <span className="text-[8px] text-muted uppercase font-bold tracking-wider">Seats</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              updatePassengers(passengers - 1);
                            }}
                            className="w-4 h-4 rounded bg-teal-500/10 hover:bg-teal-500 hover:text-black flex items-center justify-center text-teal-400 transition-colors text-[10px] font-bold"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-bold text-foreground min-w-[8px] text-center">{passengers}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              updatePassengers(passengers + 1);
                            }}
                            className="w-4 h-4 rounded bg-teal-500/10 hover:bg-teal-500 hover:text-black flex items-center justify-center text-teal-400 transition-colors text-[10px] font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[8px] text-muted-foreground font-semibold">Max {cab.seats}</span>
                      </div>

                      <div className="border border-border rounded-xl h-16 flex flex-col items-center justify-center bg-background/50">
                        <Briefcase size={13} className="text-teal-400 mb-0.5" />
                        <span className="text-[11px] font-bold text-foreground">{cab.bags} Bags</span>
                      </div>

                      <div className="border border-border rounded-xl h-16 flex flex-col items-center justify-center bg-background/50">
                        <Snowflake size={13} className="text-teal-400 mb-0.5" />
                        <span className="text-[11px] font-bold text-foreground">AC</span>
                      </div>

                      <div className="border border-border rounded-xl h-16 flex flex-col items-center justify-center bg-background/50">
                        <span className="text-teal-400 text-[10px] font-black uppercase mb-0.5">{cab.fuelType}</span>
                        <span className="text-[11px] font-bold text-muted-foreground">Fuel</span>
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div className="flex items-center gap-2 text-[10px] text-muted mb-4 border-t border-border/50 pt-3">
                      <span>✔ Driver Allowance</span>
                      <span className="text-border/60">•</span>
                      <span>✔ Base Fare &amp; Fuel</span>
                    </div>
                  </div>

                  {/* Price + Book */}
                  <div className="flex items-end justify-between border-t border-border/40 pt-3">
                    <div>
                      <span className="text-2xl font-black text-teal-400">
                        ₹{dynamicPrice.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-muted mt-0.5">excl. 5% GST</p>
                      {passengers > cab.seats && (
                        <p className="text-red-400 text-[9px] font-bold uppercase tracking-wider mt-1 flex items-center gap-1 animate-pulse">
                          ⚠️ Needs SUV/Bus
                        </p>
                      )}
                    </div>

                    <button
                      disabled={passengers > cab.seats}
                      onClick={() => handleBookNow(cab.id)}
                      className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-xs ${passengers > cab.seats
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                        : 'bg-teal-400 text-black hover:opacity-90 active:scale-95'
                        }`}
                    >
                      {passengers > cab.seats ? 'Seats Full' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}