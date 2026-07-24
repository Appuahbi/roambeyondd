import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, ChevronDown, Compass, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useLogoutMutation } from '../../services/authService'
import { useDispatch } from 'react-redux'
import { logout as logoutAction } from '../../store/authSlice'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/packages', label: 'Packages' },
  { to: '/categories', label: 'Categories' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, user } = useAuth()
  const [logoutApi] = useLogoutMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => { try { await logoutApi().unwrap() } catch {} dispatch(logoutAction()); setUserMenuOpen(false); navigate('/') }
  const handleSearch = (e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); setSearchQuery('') } }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'border-b border-border/60 bg-white/95 shadow-medium backdrop-blur-md' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Compass className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold text-primary">RoamBeyond</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-cream hover:text-primary'
              }`}>{link.label}</NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button onClick={() => setSearchOpen(!searchOpen)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-cream hover:text-primary">
            <Search className="h-4 w-4" />
          </button>
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-light text-xs font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</div>
                <span className="max-w-[100px] truncate">{user?.name}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-strong">
                    <div className="border-b border-border px-4 py-2"><p className="text-sm font-semibold text-ink">{user?.name}</p><p className="text-xs text-muted">{user?.email}</p></div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-cream"><User className="h-4 w-4" /> My Profile</Link>
                    <Link to="/my-enquiries" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-cream"><Compass className="h-4 w-4" /> My Enquiries</Link>
                    <hr className="my-1 border-border" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error-light"><LogOut className="h-4 w-4" /> Logout</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/8">Log in</NavLink>
              <NavLink to="/register" className="rounded-lg bg-gradient-to-br from-primary to-primary-light px-4 py-2 text-sm font-medium text-white shadow-subtle transition-all hover:shadow-medium">Sign up</NavLink>
            </>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-ink md:hidden">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
            <form onSubmit={handleSearch} className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center rounded-lg border border-primary/30 bg-white ring-2 ring-primary/15 shadow-medium">
                <Search className="ml-3 h-4 w-4 text-muted" />
                <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search blog posts..."
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-light" />
                <button type="submit" className="mr-1.5 rounded-lg bg-gradient-to-br from-primary to-primary-light px-4 py-1.5 text-xs font-medium text-white shadow-subtle hover:shadow-medium">Search</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border md:hidden">
            <div className="space-y-1 px-6 py-3">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-cream'}`}>{link.label}</NavLink>
              ))}
            </div>
            <div className="border-t border-border px-6 py-3">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"><User className="h-4 w-4" /> Profile</Link>
                  <Link to="/my-enquiries" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"><Compass className="h-4 w-4" /> My Enquiries</Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-error hover:bg-error-light"><LogOut className="h-4 w-4" /> Logout</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <NavLink to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg border-2 border-primary px-4 py-2.5 text-center text-sm font-medium text-primary">Log in</NavLink>
                  <NavLink to="/register" onClick={() => setMobileOpen(false)} className="rounded-lg bg-gradient-to-br from-primary to-primary-light px-4 py-2.5 text-center text-sm font-medium text-white">Sign up</NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
