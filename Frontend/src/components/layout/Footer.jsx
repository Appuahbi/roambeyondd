import { Link } from 'react-router-dom'
import { Compass, Mail, Phone, MapPin } from 'lucide-react'

function InstagramIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
}
function FacebookIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
}
function TwitterIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
}
function YoutubeIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
}

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <Compass className="h-6 w-6 text-secondary-light" />
              <span className="font-display text-lg font-bold">RoamBeyond</span>
            </Link>
            <p className="mb-4 max-w-sm text-sm leading-relaxed text-white/60">
              India's trusted tour operator offering handcrafted travel experiences across 50+ destinations.
            </p>
            <div className="flex gap-3">
              {[InstagramIcon, FacebookIcon, TwitterIcon, YoutubeIcon].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-all hover:bg-primary hover:text-white hover:shadow-medium">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">Explore</h4>
            <ul className="space-y-2.5">
              {[{ to: '/packages', label: 'Tour Packages' }, { to: '/categories', label: 'Categories' }, { to: '/destinations', label: 'Destinations' }, { to: '/blog', label: 'Travel Blog' }, { to: '/about', label: 'About Us' }].map((link) => (
                <li key={link.to}><Link to={link.to} className="text-sm text-white/60 transition-colors hover:text-white">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">Tour Types</h4>
            <ul className="space-y-2.5">
              {['Domestic Tours', 'Trekking Expeditions', 'Group Tours', 'Honeymoon Packages', 'Corporate Tours'].map((type) => (
                <li key={type}><Link to={`/packages?category=${encodeURIComponent(type)}`} className="text-sm text-white/60 transition-colors hover:text-white">{type}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary-light" /><span className="text-sm text-white/60">Delhi, India</span></li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-secondary-light" /><span className="text-sm text-white/60">+91 98765 43210</span></li>
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-secondary-light" /><span className="text-sm text-white/60">hello@roambeyond.com</span></li>
            </ul>
            <div className="mt-4">
              <Link to="/contact" className="inline-flex rounded-lg bg-gradient-to-br from-primary to-primary-light px-4 py-2 text-sm font-medium text-white shadow-subtle transition-all hover:shadow-medium">Get in Touch</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} RoamBeyond. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-white/40">
            <Link to="/about" className="hover:text-white/60">Privacy Policy</Link>
            <Link to="/about" className="hover:text-white/60">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white/60">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
