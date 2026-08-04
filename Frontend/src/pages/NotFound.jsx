import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[72vh] grid place-items-center px-4 bg-cream-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-soft opacity-60 pointer-events-none" aria-hidden="true" />
      <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="relative text-center max-w-md animate-fade-up">
        <div className="mx-auto grid place-items-center h-20 w-20 rounded-full bg-brand-soft-gradient border border-brand-200 text-brand-700 shadow-soft">
          <Compass size={36} className="animate-float" />
        </div>
        <p className="eyebrow justify-center mt-6">Lost somewhere</p>
        <h1 className="mt-2 font-display text-6xl font-semibold tracking-tight text-ink-900">404</h1>
        <p className="mt-2 text-ink-700">Looks like this path wasn’t on the map.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link to="/" className="btn-primary"><Home size={14} /> Take me home</Link>
          <button onClick={() => history.back()} className="btn-secondary"><ArrowLeft size={14} /> Go back</button>
        </div>
      </div>
    </div>
  );
}
