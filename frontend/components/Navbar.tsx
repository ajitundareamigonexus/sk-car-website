'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Sun, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { getCurrentUser, logout, type User } from '@/lib/authStore';

const navLinks = [
  { href: '/#home', label: 'Home' },
  { href: '/#about', label: 'About' },
  { href: '/#gallery', label: 'Book Cab' },
  { href: '/my-bookings', label: 'My Bookings' },
  { href: '/admin', label: 'Admin Panel' },
  { href: '/#contact', label: 'Contact' },
];

export default function Navbar() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);

  /* ── read saved theme and auth on mount ── */
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initial = saved ?? 'light';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');

    setUser(getCurrentUser());

    // Listen for dynamic auth events
    const handleAuth = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener('authChange', handleAuth);
    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('authChange', handleAuth);
      window.removeEventListener('storage', handleAuth);
    };
  }, []);

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setMenuOpen(false);
    router.push('/');
  };

  // Filter links dynamically based on role
  const activeLinks = navLinks.filter(link => {
    if (link.href === '/admin') {
      return user?.role === 'admin';
    }
    if (link.href === '/my-bookings') {
      return user && user?.role !== 'admin';
    }
    return true;
  });

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${scrolled
          ? 'bg-surface/95 backdrop-blur-xl shadow-md border-b border-border'
          : 'bg-transparent border-b border-transparent text-white'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/#home" className="flex flex-col group">
          <span
            className="text-xl font-black text-primary
                       transition-all duration-300 group-hover:tracking-[0.45em]"
          >
            SK CAR RENTAL
          </span>
          <span className="text-[11px] text-muted tracking-widest">Travel Unlimited</span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden xl:flex gap-8 text-sm font-medium">
          {activeLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative text-muted hover:text-primary transition-colors duration-200
                         after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0
                         after:bg-primary after:rounded-full after:transition-all after:duration-300
                         hover:after:w-full"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-3">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-border bg-surface
                       flex items-center justify-center text-muted
                       hover:border-primary hover:text-primary
                       transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Dynamic Login / Profile Greeting Section */}
          {user ? (
            <div className="hidden md:flex items-center gap-3 bg-card border border-card-border px-4 py-1.5 rounded-full shadow-sm text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-teal-400">
                <UserIcon size={12} />
                {user.fullName}
              </span>
              <div className="w-px h-3.5 bg-border" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-muted hover:text-red-400 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={12} />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex text-muted hover:text-primary transition-colors text-sm font-semibold mr-1"
            >
              Sign In
            </Link>
          )}

          {/* CTA */}
          <Link
            href="/#booking-tabs-section"
            className="hidden sm:inline-flex items-center justify-center
                       rounded-full bg-primary text-primary-contrast
                       px-5 py-2 text-sm font-semibold
                       relative overflow-hidden shimmer-btn
                       transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            style={{ boxShadow: '0 4px 20px var(--glow)' }}
          >
            Book Now
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="xl:hidden w-10 h-10 rounded-full border border-border bg-surface
                       flex items-center justify-center text-muted
                       hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={`xl:hidden overflow-hidden transition-all duration-300
          ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-surface border-t border-border px-6 py-4 flex flex-col gap-4">

          {/* User Status in Mobile Menu */}
          {user && (
            <div className="flex items-center justify-between bg-card border border-card-border px-4 py-2.5 rounded-2xl text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-teal-400">
                <UserIcon size={13} />
                {user.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-400 hover:opacity-80 transition-opacity font-bold"
              >
                <LogOut size={13} />
                Log Out
              </button>
            </div>
          )}

          {activeLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-muted hover:text-primary transition-colors py-1 text-sm font-medium"
            >
              {label}
            </Link>
          ))}

          {!user && (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-muted hover:text-primary transition-colors py-1 text-sm font-medium border-t border-border pt-2"
            >
              Sign In / Register
            </Link>
          )}

          <Link
            href="/#booking-tabs-section"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-primary
                       text-primary-contrast px-5 py-2 text-sm font-semibold w-fit"
          >
            Book Now
          </Link>
        </div>
      </div>
    </header>
  );
}