import { useEffect, useState } from 'react';
import { ShieldCheck, IndianRupee, HeartHandshake, Compass, Clock, Award } from 'lucide-react';
import { SectionHeader } from './CategoriesSection';
import { siteContentApi } from '../../api/endpoints';

const ICON_MAP = {
  'Best Price Guarantee': IndianRupee,
  'Verified Stays': ShieldCheck,
  'Verified stays': ShieldCheck,
  'Transparent pricing': IndianRupee,
  '24/7 Support': Clock,
  '24/7 on-trip support': Clock,
  'Easy Cancellation': Compass,
  'Flexible bookings': Compass,
  'Local Expert Guides': HeartHandshake,
  'Local experts': HeartHandshake,
  'Secure Payments': Award,
  'Top-rated': Award,
};

const FALLBACK = [
  { icon: ShieldCheck, title: 'Verified stays', text: 'Every hotel and homestay personally inspected by our team.' },
  { icon: IndianRupee, title: 'Transparent pricing', text: 'No hidden fees — what you see is what you pay.' },
  { icon: HeartHandshake, title: '24/7 on-trip support', text: 'A real person on call, every hour of your journey.' },
  { icon: Compass, title: 'Local experts', text: 'Drivers, guides and curators who actually know the place.' },
  { icon: Clock, title: 'Flexible bookings', text: 'Plans change — reschedule with easy, fair policies.' },
  { icon: Award, title: 'Top-rated', text: '4.8/5 average across 8,000+ verified reviews.' },
];

export default function WhyChooseUs() {
  const [points, setPoints] = useState(FALLBACK);

  useEffect(() => {
    siteContentApi.get('why-us')
      .then((r) => {
        const features = r?.data?.features;
        if (features?.length) {
          setPoints(features.map((f) => ({
            icon: ICON_MAP[f.title] || ShieldCheck,
            title: f.title,
            text: f.description,
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <div className="section">
        <SectionHeader
          eyebrow="Why Roam Beyond"
          title="The Roam Beyond difference"
          subtitle="Six small things that make a big difference on the road."
        />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {points.map((p) => (
            <div key={p.title} className="card p-6 hover:border-brand-200 transition">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <p.icon size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{p.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
