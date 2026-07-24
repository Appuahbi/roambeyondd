import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, LogOut, Compass, Mail, Phone, Shield, CheckCircle, Send } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useChangePasswordMutation, useLogoutMutation } from '../services/authService'
import { useDispatch } from 'react-redux'
import { logout as logoutAction } from '../store/authSlice'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import AnimatedSection from '../components/ui/AnimatedSection'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logoutApi] = useLogoutMutation()
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation()
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwError, setPwError] = useState('')

  if (!isAuthenticated) { navigate('/login'); return null }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError('Passwords do not match')
      return
    }
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }).unwrap()
      toast.success('Password updated successfully!')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwError(err?.data?.message || 'Failed to change password')
    }
  }

  const handleLogout = async () => {
    try { await logoutApi().unwrap() } catch {}
    dispatch(logoutAction())
    navigate('/')
  }

  return (
    <div className="bg-cream">
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <AnimatedSection>
            <h1 className="font-display text-3xl font-bold text-ink">My Profile</h1>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        {/* Profile card */}
        <AnimatedSection>
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-3xl font-bold text-white sm:mb-0">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-semibold text-ink">{user?.name}</h2>
                  {user?.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-amber-800">
                      <Mail className="h-3 w-3" /> Unverified
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <p className="flex items-center gap-2 text-sm text-muted"><Mail className="h-4 w-4" /> {user?.email}</p>
                  <p className="flex items-center gap-2 text-sm text-muted"><Phone className="h-4 w-4" /> {user?.phone}</p>
                </div>
                {!user?.isVerified && (
                  <p className="mt-3 text-xs text-muted">
                    Please verify your email to access all features. Check your inbox or{' '}
                    <button className="font-medium text-primary hover:underline">resend verification email</button>
                  </p>
                )}
              </div>
              <div className="mt-4 flex gap-2 sm:mt-0">
                <Link to="/my-enquiries" className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white">
                  <Compass className="h-4 w-4" /> My Enquiries
                </Link>
                <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border-2 border-error px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error hover:text-white">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Change password */}
        <AnimatedSection delay={0.1}>
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-4 font-display text-lg font-semibold text-ink flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input label="Current Password" type="password" required value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
              <Input label="New Password" type="password" required minLength={8} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
              <Input label="Confirm New Password" type="password" required value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
              {pwError && <p className="text-sm text-error">{pwError}</p>}
              <Button type="submit" loading={changingPassword}>Update Password</Button>
            </form>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
