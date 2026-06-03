import BookingTabs from "./BookingTabs";
import Link from "next/link";

const cars = [
  {
    name: 'Swift Dzire',
    desc: 'Comfortable and budget-friendly sedan for city and outstation travel.',
    badge: 'Most Popular',
    image: '/images/maruti_dzire.png',
    price: '₹12/km',
  },
  {
    name: 'Ertiga',
    desc: 'Spacious MPV perfect for family trips and group journeys.',
    badge: 'Best Value',
    image: '/images/maruti_ertiga.png',
    price: '₹15/km',
  },
  {
    name: 'Toyota Innova Crysta',
    desc: 'Premium family car with luxury comfort and extra luggage space.',
    badge: 'Family Pick',
    image: '/images/innova_crysta.png',
    price: '₹18/km',
  },
  {
    name: 'Fortuner',
    desc: 'Luxury SUV for premium business trips and VIP travel.',
    badge: 'Premium',
    image: '/images/toyota_fortuner.png',
    price: '₹25/km',
  },
];

export default function Fleet() {
  return (
    <section id="gallery" className="py-10 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase
                           tracking-widest bg-primary-light text-primary border border-card-border mb-5">
            Our Fleet
          </span>
          <h2 className="text-5xl font-bold text-foreground mb-4">
            Choose Your Perfect Ride
          </h2>
          <p className="text-muted max-w-xl mx-auto text-lg leading-7">
            From budget sedans to luxury SUVs — we have the right car for every journey.
          </p>
        </div>
        <BookingTabs />
        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
          {cars.map((car, i) => (
            <div
              key={i}
              className={`group rounded-3xl overflow-hidden border border-card-border bg-card
                          card-hover animate-scale-in delay-${(i + 1) * 100}`}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              {/* Image with zoom + gradient overlay */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {/* Badge */}
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold
                                  bg-primary text-primary-contrast">
                  {car.badge}
                </span>
                {/* Price */}
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold
                                  bg-black/60 text-white backdrop-blur-sm">
                  From {car.price}
                </span>
              </div>

              {/* Body */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">{car.name}</h3>
                <p className="text-muted text-sm mb-5 leading-6">{car.desc}</p>
                <Link
                  href="/cabs"
                  className="w-full inline-flex items-center justify-center relative overflow-hidden bg-primary text-primary-contrast
                               py-3 rounded-xl font-semibold text-sm shimmer-btn
                               transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ boxShadow: '0 4px 16px var(--glow)' }}
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}