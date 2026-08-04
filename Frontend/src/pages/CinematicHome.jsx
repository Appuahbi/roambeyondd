import Hero from '../components/hero/Hero.jsx';
import StatsBar from '../components/sections/StatsBar';
import CategoriesSection from '../components/sections/CategoriesSection';
import FeaturedPackages from '../components/sections/FeaturedPackages';
import DestinationsShowcase from '../components/sections/DestinationsShowcase';
import WhyChooseUs from '../components/sections/WhyChooseUs';
import Testimonials from '../components/sections/Testimonials';
import LatestBlogs from '../components/sections/LatestBlogs';
import CTASection from '../components/sections/CTASection';

export default function CinematicHome() {
  return (
    <>
      <Hero
        brand="ROAMBEYOND"
        tagline="Curated travel packages across India & beyond."
      />
      <StatsBar />
      <CategoriesSection />
      <FeaturedPackages
        title="Featured tours"
        eyebrow="Hand-picked for you"
        subtitle="Our travellers' favourites this season"
      />
      <DestinationsShowcase />
      <WhyChooseUs />
      <Testimonials />
      <LatestBlogs />
      <CTASection />
    </>
  );
}