'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  getSearchQuery,
  getSelectedCab,
  saveBooking,
  clearCurrentSearch,
} from '@/lib/bookingStore';
import { getCurrentUser, type User } from '@/lib/authStore';
import { GST_RATE } from '@/data/data';
import type { SearchQuery, Cab, BookingContact, PaymentOption } from '@/lib/types';
import { createBooking } from '@/lib/api';

const TRIP_LABELS: Record<string, string> = {
  oneway: 'One Way',
  round: 'Round Trip',
  local: 'Local',
  airport: 'Airport',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatTime(timeStr: string) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

const inputCls =
  'w-full h-14 rounded-xl bg-background border border-border px-4 outline-none ' +
  'focus:border-primary transition-colors duration-200 text-sm placeholder:text-muted';

const errInputCls =
  'w-full h-14 rounded-xl bg-background border border-red-500 px-4 outline-none ' +
  'focus:border-red-400 transition-colors duration-200 text-sm placeholder:text-muted';

export default function BookingPage() {
  const router = useRouter();

  const [search, setSearch] = useState<SearchQuery | null>(null);
  const [cab, setCab] = useState<Cab | null>(null);
  const [payment, setPayment] = useState<PaymentOption>('zero');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);

  const [form, setForm] = useState<BookingContact>({
    fullName: '',
    mobile: '',
    email: '',
    gstNumber: '',
    pickupAddress: '',
    dropAddress: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingContact, string>>>({});
  const [globalError, setGlobalError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // useEffect(() => {
  //   setSearch(getSearchQuery());
  //   setCab(getSelectedCab());

  //   // Load active session to auto-fill
  //   const activeUser = getCurrentUser();
  //   if (activeUser) {
  //     setUser(activeUser);
  //     // Only auto-fill if it's a standard user (admins shouldn't auto-fill admin details for customer bookings)
  //     if (activeUser.role !== 'admin') {
  //       setForm(prev => ({
  //         ...prev,
  //         fullName: activeUser.fullName || '',
  //         email: activeUser.email || '',
  //         mobile: activeUser.mobile || '',
  //       }));
  //     }
  //   }
  // }, []);
  useEffect(() => {
    const activeUser = getCurrentUser();

    if (!activeUser) {
      router.replace('/login?redirect=/booking');
      return;
    }

    setUser(activeUser);

    setSearch(getSearchQuery());
    setCab(getSelectedCab());

    if (activeUser.role !== 'admin') {
      setForm(prev => ({
        ...prev,
        fullName: activeUser.fullName || '',
        email: activeUser.email || '',
        mobile: activeUser.mobile || '',
      }));
    }

    setCheckingAuth(false);
  }, [router]);

  /* ── Derived prices ── */
  const baseFare = cab?.basePrice ?? 0;
  const gst = Math.round(baseFare * GST_RATE);
  const total = baseFare + gst;

  /* ── Form helpers ── */
  const set = (field: keyof BookingContact) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BookingContact, string>> = {};

    if (!form.fullName.trim())
      newErrors.fullName = 'Full name is required';

    if (!/^[6-9]\d{9}$/.test(form.mobile))
      newErrors.mobile = 'Enter a valid 10-digit mobile number';

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.pickupAddress.trim())
      newErrors.pickupAddress = 'Pickup address is required';

    if (!form.dropAddress.trim())
      newErrors.dropAddress = 'Drop address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    setGlobalError('');

    const currentUser = getCurrentUser();

    if (!currentUser) {
      setGlobalError('Please login first to book a cab.');

      setTimeout(() => {
        router.push('/login?redirect=/booking');
      }, 1500);

      return;
    }


    if (!search || !cab) {
      setGlobalError('Missing booking details. Please go back and search again.');
      return;
    }

    if (!validate()) return;

    setSubmitting(true);

    try {
      const payload = {
        cabId: cab.id,
        fromCity: search.from,
        toCity: search.to,
        travelDate: search.date,
        travelTime: search.time,
        tripType: search.tripType,
        passengers: search.passengers || 1,
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email,
        pickupAddress: form.pickupAddress,
        dropAddress: form.dropAddress,
        paymentOption: payment,
      };

      // Commented out API calls to work fully offline
      /*
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      let savedBooking = null;

      if (token) {
        try {
          savedBooking = await createBooking(payload);
        } catch (err: any) {
          console.error("Failed to post booking to Spring Boot API, falling back locally:", err);
        }
      }

      if (savedBooking) {
        saveBooking({
          ...savedBooking,

          searchQuery: search,
          selectedCab: cab,
          contact: form,

          paymentOption: payment,
          baseFare,
          gst,
          totalFare: total,
        });
      } else {
        saveBooking({
          searchQuery: search,
          selectedCab: cab,
          contact: form,

          paymentOption: payment,
          baseFare,
          gst,
          totalFare: total,
        });
      }
      */

      saveBooking({
        searchQuery: search,
        selectedCab: cab,
        contact: form,

        paymentOption: payment,
        baseFare,
        gst,
        totalFare: total,
      });

      clearCurrentSearch();
      router.push('/booking/confirmation');
    } catch (err: any) {
      console.error(err);
      setGlobalError('Failed to confirm booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }
  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_380px] gap-8">

        {/* ════ LEFT ════ */}
        <div className="space-y-8">

          {/* Booking Review */}
          <div className="rounded-3xl border border-teal-500/20 overflow-hidden">
            <div className="bg-teal-500 text-black px-6 py-5 font-bold text-xl">
              Review Your Booking
            </div>

            <div className="p-6 bg-card">
              {search && cab ? (
                <>
                  {/* Route */}
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <span className="text-green-400 font-semibold text-lg">{search.from}</span>
                    <ArrowRight size={18} className="text-muted" />
                    <span className="text-red-400 font-semibold text-lg">{search.to}</span>
                    <span className="ml-auto border border-teal-500/20 px-3 py-1 rounded-full text-teal-400 text-sm">
                      {TRIP_LABELS[search.tripType]}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted mb-5 items-center">
                    <span className="font-medium text-foreground">{cab.name} ({cab.car})</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      {formatDate(search.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(search.time)}
                    </span>
                    {search.passengers && (
                      <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {search.passengers} Passengers
                      </span>
                    )}
                  </div>

                  {/* Fare */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-muted">Estimated Fare</span>
                    <div className="text-right">
                      <div className="text-3xl font-black text-teal-400">
                        ₹{baseFare.toLocaleString('en-IN')}
                      </div>
                      <div className="text-sm text-muted">
                        ₹{total.toLocaleString('en-IN')} incl. GST
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted text-sm py-4 text-center">
                  No booking details found.{' '}
                  <button
                    onClick={() => router.push('/')}
                    className="text-teal-400 underline"
                  >
                    Go back to search
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Pickup Form */}
          <div className="rounded-3xl border border-border overflow-hidden bg-card">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold mb-1">Contact &amp; Pickup Details</h2>
              <p className="text-muted text-sm">
                We&apos;ll use these for your booking confirmation and trip updates.
              </p>
            </div>

            {user ? (
              <div className="mx-6 mt-6 px-4 py-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Logged in as <strong>{user.fullName}</strong>. We have prefilled your contact details!</span>
              </div>
            ) : (
              <div className="mx-6 mt-6 px-4 py-3 bg-yellow-500/5 border border-yellow-500/10 text-muted text-xs rounded-xl flex items-center justify-between gap-2">
                <span>Want to save time and track this booking?</span>
                <Link href={`/login?redirect=/booking`} className="text-teal-400 font-bold hover:underline shrink-0">
                  Sign In Now &rarr;
                </Link>
              </div>
            )}

            <div className="p-6 grid md:grid-cols-2 gap-5">

              {/* Full Name */}
              <div>
                <label className="block mb-2 text-sm font-medium">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={set('fullName')}
                  className={errors.fullName ? errInputCls : inputCls}
                />
                {errors.fullName && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block mb-2 text-sm font-medium">Mobile No. *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.mobile}
                  onChange={set('mobile')}
                  maxLength={10}
                  className={errors.mobile ? errInputCls : inputCls}
                />
                {errors.mobile && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.mobile}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium"> Email ID (Optional)</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={set('email')}
                  className={errors.email ? errInputCls : inputCls}
                />
              </div>

              {/* GST */}
              <div>
                <label className="block mb-2 text-sm font-medium">GST Number (Optional)</label>
                <input
                  type="text"
                  placeholder="15-digit GST number"
                  value={form.gstNumber}
                  onChange={set('gstNumber')}
                  maxLength={15}
                  className={inputCls}
                />
              </div>

              {/* Pickup Address */}
              <div>
                <label className="block mb-2 text-sm font-medium">Pickup Address *</label>
                <input
                  type="text"
                  placeholder="Building, area, landmark"
                  value={form.pickupAddress}
                  onChange={set('pickupAddress')}
                  className={errors.pickupAddress ? errInputCls : inputCls}
                />
                {errors.pickupAddress && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.pickupAddress}
                  </p>
                )}
              </div>

              {/* Drop Address */}
              <div>
                <label className="block mb-2 text-sm font-medium">Drop Address *</label>
                <input
                  type="text"
                  placeholder="Building, area, landmark"
                  value={form.dropAddress}
                  onChange={set('dropAddress')}
                  className={errors.dropAddress ? errInputCls : inputCls}
                />
                {errors.dropAddress && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.dropAddress}
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ════ RIGHT ════ */}
        <div className="space-y-6">

          {/* Payment Options */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold">Payment Options</h2>
            </div>

            <div className="p-6 space-y-4">

              {/* Book at Zero */}
              <button
                onClick={() => setPayment('zero')}
                className={`w-full rounded-2xl p-5 border-2 text-left transition-all duration-200
                  ${payment === 'zero'
                    ? 'border-teal-400 bg-teal-400/5'
                    : 'border-border hover:border-teal-400/40'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Book at Zero</h3>
                    <p className="text-muted text-sm">Pay later — pay the driver directly</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-teal-400">₹0</span>
                    {payment === 'zero' && (
                      <CheckCircle2 size={20} className="text-teal-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Full Pay */}
              <button
                onClick={() => setPayment('full')}
                className={`w-full rounded-2xl p-5 border-2 text-left transition-all duration-200
                  ${payment === 'full'
                    ? 'border-teal-400 bg-teal-400/5'
                    : 'border-border hover:border-teal-400/40'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Full Pay</h3>
                    <p className="text-muted text-sm">Pay full amount now online</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-teal-400">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                    {payment === 'full' && (
                      <CheckCircle2 size={20} className="text-teal-400" />
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Fare Breakdown */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold">Fare Breakdown</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Base Fare</span>
                <span>₹{baseFare.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted">GST (5%)</span>
                <span>₹{gst.toLocaleString('en-IN')}</span>
              </div>

              <div className="border-t border-border pt-4 flex justify-between text-xl font-bold">
                <span>Total Fare</span>
                <span className="text-teal-400">₹{total.toLocaleString('en-IN')}</span>
              </div>

              {/* Global error */}
              {globalError && (
                <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {globalError}
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full h-14 rounded-2xl bg-teal-400 text-black font-bold text-lg
                           hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><Loader2 size={20} className="animate-spin" /> Processing…</>
                  : 'Confirm Booking'
                }
              </button>

              <p className="text-center text-xs text-muted">
                By confirming you agree to our Terms &amp; Conditions
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}