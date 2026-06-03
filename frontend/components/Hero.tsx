'use client';

import { useEffect, useState } from 'react';
import BookingTabs from './BookingTabs';
import Image from 'next/image';

const heroImages = [
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1920',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1920',
  'https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=1920',
];

const stats = [
  {
    value: 5000,
    suffix: '+',
    label: 'Happy Customers',
  },
  {
    value: 50,
    suffix: '+',
    label: 'Cities Covered',
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Support',
  },
  {
    value: 4.9,
    suffix: '★',
    label: 'Avg Rating',
  },
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  const [counts, setCounts] = useState(
    stats.map(() => 0)
  );

  /* Background Slider */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        prev === heroImages.length - 1
          ? 0
          : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  /* Counter Animation */
  useEffect(() => {
    const intervals = stats.map((stat, index) => {
      let start = 0;

      const end = stat.value;

      const duration = 2000;

      const increment = end / 60;

      return setInterval(() => {
        start += increment;

        if (start >= end) {
          start = end;
          clearInterval(intervals[index]);
        }

        setCounts((prev) => {
          const updated = [...prev];

          updated[index] =
            end % 1 !== 0
              ? parseFloat(start.toFixed(1))
              : Math.floor(start);

          return updated;
        });
      }, duration / 60);
    });

    return () =>
      intervals.forEach((interval) =>
        clearInterval(interval)
      );
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden px-4 sm:px-6 pb-20 pt-28 md:pt-32"
    >
      {/* Background Slider */}
      <div className="absolute inset-0">

        {heroImages.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt="travel"
            fill
            priority={index === 0}
            className={`object-cover transition-opacity duration-1000 ${currentImage === index
              ? 'opacity-100'
              : 'opacity-0'
              }`}
            sizes="100vw"
          />
        ))}

        {/* Light Premium Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Soft Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

        {/* Extra Teal Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_40%)]" />
      </div>

      {/* Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">

        <div
          className="absolute -top-40 left-1/3 w-[700px] h-[700px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(34,211,238,0.20) 0%, transparent 70%)',
          }}
        />

        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto">

        {/* Left Content */}
        <div className="max-w-4xl">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 mb-6
                       border border-teal-500/20 bg-black/20 backdrop-blur-xl
                       rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase"
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />

            <span className="text-teal-400">
              SK Car Rental
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 text-white">
            Safe, premium cab travel{' '}
            <span className="text-teal-400">
              SK CAR RENTAL
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-200 text-base sm:text-lg leading-8 mb-10 max-w-2xl">
            Book the best routes for airport transfers,
            hill station trips and long-distance journeys
            with trusted cars and experienced drivers.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">

            <a
              href="#booking-tabs-section"
              className="inline-flex items-center justify-center
                         bg-teal-400 text-black px-8 py-4 rounded-full
                         font-semibold text-base
                         transition-all duration-300 hover:scale-105"
              style={{
                boxShadow:
                  '0 0 30px rgba(34,211,238,0.5)',
              }}
            >
              Book Now →
            </a>

            <a
              href="#popular-routes"
              className="inline-flex items-center justify-center
                         border border-teal-400/30 text-white
                         px-8 py-4 rounded-full
                         font-semibold text-base
                         transition-all duration-300
                         hover:bg-teal-400 hover:text-black"
            >
              View Routes
            </a>
          </div>
        </div>

        {/* CENTER STATS */}
        <div className="flex justify-center lg:justify-end mb-14">

          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8
                       bg-black/30 backdrop-blur-xl
                       border border-teal-500/10
                       rounded-3xl
                       px-6 md:px-10
                       py-6
                       w-full max-w-5xl"
          >

            {stats.map((item, index) => (
              <div
                key={item.label}
                className="text-center"
              >

                <span className="block text-3xl md:text-4xl font-black text-teal-400">
                  {counts[index]}
                  {item.suffix}
                </span>

                <span className="text-[11px] md:text-xs text-gray-300 uppercase tracking-[2px] mt-2 block">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}