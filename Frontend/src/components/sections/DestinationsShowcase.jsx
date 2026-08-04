import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { destinationApi } from '../../api/endpoints';
import { SectionHeader } from './CategoriesSection';
import { useReveal } from '../../hooks/useReveal';
import DestinationCard from './DestinationCard';

export default function DestinationsShowcase() {
  const [dests, setDests] = useState([]);
  const [ref, shown] = useReveal();

  useEffect(() => {
    destinationApi
      .list()
      .then((r) => {
        if (Array.isArray(r?.data) && r.data.length) {
          setDests(r.data);
        }
      })
      .catch(() => {});
  }, []);

  const [feature, ...rest] = dests;

  return (
    <section ref={ref} className="py-20 sm:py-24 bg-white relative">
      <div className="section">
        <div className="mb-12">
          <SectionHeader
            eyebrow="Top Destinations"
            title="Dream Escapes Across India"
            subtitle="Hand-picked spots for your next adventure. Pick a location, and we’ll handle the rest."
            center={false}
          />
        </div>

        {dests.length > 0 ? (
          <div className={clsx('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 auto-rows-[9rem] sm:auto-rows-[11rem] lg:auto-rows-[12.5rem]', shown ? 'animate-fade-up' : 'opacity-0')}>
            {feature && (
              <DestinationCard
                dest={feature}
                feature
                className="col-span-2 row-span-2"
              />
            )}

            {rest.slice(0, 7).map((d) => (
              <DestinationCard
                key={d.name}
                dest={d}
                className="col-span-1 row-span-1"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-500 text-center py-10">Destinations loading…</p>
        )}

        {dests.length > 0 && (
          <div className="mt-10 text-center">
            <Link to="/destinations" className="btn-secondary">
              View all destinations <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
