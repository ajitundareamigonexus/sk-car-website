'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, RefreshCw, Lock, Home } from 'lucide-react';
import { getAllBookings, getAllCabs } from '@/lib/bookingStore';
import { isAdmin, logout as authLogout } from '@/lib/authStore';
import type { Booking } from '@/lib/types';
import { getAllBookings as getAllBookingsApi, getCabs } from '@/lib/api';

import AdminBookings from './AdminBookings';
import AdminFleet from './AdminFleet';
import AdminReports from './AdminReports';

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

export default function AdminDashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'fleet' | 'reports'>('bookings');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cabs, setCabs] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isAdmin()) {
      setAuthed(true);
    } else {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      /*
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (token) {
        // Load Bookings
        getAllBookingsApi()
          .then(data => setBookings((data || []).map(normalizeBooking)))
          .catch(err => {
            console.error("Failed to load admin bookings from backend, falling back locally:", err);
            setBookings(getAllBookings());
          });
        // Load Cabs
        getCabs()
          .then(data => setCabs(data || []))
          .catch(err => console.error("Failed to load cabs:", err));
      } else {
        setBookings(getAllBookings());
      }
      */

      // Load Bookings & Cabs offline from localStorage
      setBookings(getAllBookings());
      setCabs(getAllCabs());
    }
  }, [authed, refreshKey]);

  const handleLogout = () => {
    authLogout();
    setAuthed(false);
    router.push('/login');
  };
  if (!authed) {
    return (
      <section className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <ShieldCheck size={28} className="text-teal-400" />
              <span className="text-2xl font-black text-primary">SK CAR RENTAL</span>
            </div>
            <p className="text-muted text-sm uppercase tracking-widest">Admin Portal</p>
          </div>

          <div className="rounded-3xl border border-card-border bg-card p-8 text-center shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-6">
              <Lock size={28} className="text-red-400" />
            </div>

            <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
            <p className="text-muted text-sm mb-6 leading-relaxed">
              You must be logged in as an administrator to view booking statistics, manage trips, and export logs.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login?redirect=/admin')}
                className="w-full h-12 rounded-xl bg-teal-400 text-black font-bold text-sm
                           hover:scale-[1.01] transition-all active:scale-[0.99] cursor-pointer shadow-md"
                style={{ boxShadow: '0 4px 16px rgba(34,211,238,0.3)' }}
              >
                Sign In as Admin
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full h-12 rounded-xl border border-border text-muted font-bold text-sm
                           hover:text-foreground hover:bg-surface/50 transition-all cursor-pointer"
              >
                <Home size={14} className="inline mr-1.5 -mt-0.5" />
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ── Dashboard Content ── */
  return (
    <section className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Top Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={20} className="text-teal-400" />
              <h1 className="text-2xl sm:text-3xl font-black">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="flex items-center gap-2 border border-border px-4 py-2 rounded-xl
                         text-sm font-semibold hover:border-primary hover:text-primary transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="flex gap-4 mb-8 border-b border-card-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'bookings'
              ? 'text-teal-400 border-teal-400'
              : 'text-muted border-transparent hover:text-foreground'
              }`}
          >
            Manage Bookings
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'fleet'
              ? 'text-teal-400 border-teal-400'
              : 'text-muted border-transparent hover:text-foreground'
              }`}
          >
            Manage Fleet (Cars)
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${activeTab === 'reports'
              ? 'text-teal-400 border-teal-400'
              : 'text-muted border-transparent hover:text-foreground'
              }`}
          >
            Reports & Analytics
          </button>
        </div>

        {/* ── Tab Views ── */}
        {activeTab === 'bookings' && (
          <AdminBookings bookings={bookings} setBookings={setBookings} />
        )}

        {activeTab === 'fleet' && (
          <AdminFleet cabs={cabs} setRefreshKey={setRefreshKey} />
        )}

        {activeTab === 'reports' && (
          <AdminReports bookings={bookings} />
        )}

      </div>
    </section>
  );
}
