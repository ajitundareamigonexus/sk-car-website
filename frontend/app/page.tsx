import Hero from '../components/Hero';
import Features from '../components/Features';
import Fleet from '../components/Fleet';
import Testimonials from '../components/Testimonials';
import PopularRoutes from '../components/PopularRoutes';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Fleet />
      <PopularRoutes />
      <Testimonials />
    </>
  );
}