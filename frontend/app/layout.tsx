import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingButtons from '@/components/FloatingButtons';

export const metadata: Metadata = {
  title: {
    template: '%s | SK Car Rental',
    default: 'SK Car Rental - Premium Cab & Car Rental Services',
  },
  description: 'Book premium, safe, and reliable cab rental services across Mumbai, Pune, Nashik and major cities. Best rates for airport transfers, one-way trips, outstation, and local rides.',
  keywords: ['car rental', 'cab booking', 'mumbai to pune cab', 'pune to mumbai cab', 'outstation cab', 'airport taxi mumbai', 'airport taxi pune', 'sk car rental'],
  authors: [{ name: 'SK Car Rental' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SK Car Rental - Premium Cab & Car Rental Services',
    description: 'Book premium, safe, and reliable cab rental services across Mumbai, Pune, Nashik and major cities.',
    url: 'http://localhost:3000',
    siteName: 'SK Car Rental',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SK Car Rental Premium Fleet',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SK Car Rental - Premium Cab & Car Rental Services',
    description: 'Book premium, safe, and reliable cab rental services across Mumbai, Pune, Nashik and major cities.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground overflow-x-hidden">
        <Navbar />
        {children}
        <Footer />
        <FloatingButtons />
      </body>
    </html>
  );
}