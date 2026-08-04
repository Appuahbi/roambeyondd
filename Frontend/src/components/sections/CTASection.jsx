import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="section">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 sm:p-12 text-white shadow-lift">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cream-200/20 blur-3xl" />
          <div className="absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cream-200">Custom trips</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold leading-tight">
                Don’t see what you’re looking for?
              </h2>
              <p className="mt-2 text-cream-100/90 max-w-md">
                Tell us where, when and how you like to travel. We’ll build a custom itinerary in 24 hours.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Link to="/contact?type=custom" className="btn bg-white text-brand-800 hover:bg-cream-100">
                <MapPin size={16} /> Plan my trip
              </Link>
              <Link to="/packages" className="btn border border-cream-100/40 text-cream-50 hover:bg-white/10">
                Browse tours <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
