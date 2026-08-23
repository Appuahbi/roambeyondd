import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <>
      <Hero
        brand={t('brand')}
        tagline={t('hero.tagline')}
      />
      <StatsBar />
      <CategoriesSection />
      <FeaturedPackages
        title={t('home.featuredTitle')}
        eyebrow={t('home.featuredEyebrow')}
        subtitle={t('home.featuredSubtitle')}
      />
      <DestinationsShowcase />
      <WhyChooseUs />
      <Testimonials />
      <LatestBlogs />
      <CTASection />
    </>
  );
}