# Roam Beyond — Frontend

The user-facing frontend for the **Roam Beyond** tour platform. Built with
Vite + React + Tailwind CSS, using the existing `Backend/` REST API
(`http://localhost:5000/api`).

## Stack

- **Vite** (dev server + build) with React 18
- **React Router v6** for routing
- **Redux Toolkit** for auth, wishlist & notification state
- **Axios** with a JWT interceptor
- **Tailwind CSS** with a custom **green / cream / white** brand palette
- **Lucide React** icons
- **React Hot Toast** for notifications

## Theme

The palette is defined in `tailwind.config.js`:

- `brand-*` — green scale (50 → 950)
- `cream-*` — warm cream/yellow scale
- `ink-*` — neutral text
- Custom shadows, gradients, keyframes for reveals, marquee and float.

## Run it

```bash
cd Frontend
npm install
npm run dev          # starts on http://localhost:3000
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so
make sure the backend is running first.

## Build

```bash
npm run build
npm run preview
```

## Structure

```
src/
├── api/            axios client + endpoint modules
├── components/
│   ├── layout/     Navbar, Footer, Layout, ProtectedRoute
│   ├── sections/   Hero, FeaturedPackages, DestinationsShowcase,
│   │               CategoriesSection, WhyChooseUs, Testimonials,
│   │               LatestBlogs, CTASection, ItineraryTimeline,
│   │               PackageCard, PackageEnquiryForm
│   └── ui/         Button, Skeleton, Heart, Rating, ImageWithFallback, Badge
├── hooks/          useReveal, useInView
├── pages/          Home, PackagesList, PackageDetail, BlogsList,
│                   BlogDetail, Destinations, Contact, SearchResults,
│                   Login, Register, ForgotPassword, ResetPassword,
│                   Dashboard, Wishlist, Notifications, NotFound
├── store/          Redux slices: auth, wishlist, notifications
└── utils/          format.js (INR, dates), images.js (fallbacks)
```

## Pages & features

- **Home** — slideshow hero with tabbed search, animated stats bar,
  categories, featured tours carousel, destinations grid, why-us, testimonials,
  latest blogs, CTA.
- **Tours list** — search, category radios, destination, price-range filters
  (with quick chips), sort, grid/list view, URL-synced state, pagination,
  mobile drawer.
- **Tour detail** — image gallery + thumbs, sticky tabs (itinerary, inclusions,
  gallery, reviews, FAQ), expandable itinerary timeline, sticky enquiry form,
  related tours, share button, wishlist toggle.
- **Blogs** — list with category filter chips, featured hero article, search.
  Detail page with related tours sidebar and tags.
- **Destinations** — masonry-style colourful grid with hover details.
- **Contact** — general contact form and a `?type=custom` mode that creates a
  trip request via the backend.
- **Search** — `/search?q=` shows matching tours and blogs.
- **Auth** — login, register (with Indian phone validation), forgot password,
  reset password, all wired to the backend.
- **Dashboard** — tabbed layout (profile, wishlist, enquiries, trip requests,
  notifications) with sign-out.
- **Wishlist** — list of saved tours using the backend wishlist endpoints.
- **Notifications** — list with mark-read / read-all.

## Interactivity

- Hero background slideshow (auto-advance, pause on hover).
- Reveal-on-scroll for sections (`useReveal`).
- Carousel for featured tours (drag-free, snap scroll, arrow buttons).
- Testimonial auto-rotate with manual controls and pause on hover.
- Animated count-up on the stats bar when it enters the viewport.
- Active filter chips with one-click removal.
- Mobile drawer with backdrop, search slide-down, user menu.
- Live toasts on every mutation (login, wishlist, enquiry, password change).
- `prefers-reduced-motion` respected globally.

## Notes

- The backend does not expose a `PATCH /auth/me` endpoint, so the Profile
  tab in the dashboard shows the user’s data and lets them change their
  password (which the backend does support) but does not let them edit
  name/phone in-place yet.
- Image fallbacks use a curated Unsplash list in `utils/images.js`. If
  your backend provides image URLs, those are used first; the fallback
  only kicks in if the image is missing or fails to load.
- Localisation is en-IN (currency, number, date formats).
