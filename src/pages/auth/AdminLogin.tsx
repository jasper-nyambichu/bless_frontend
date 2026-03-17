// src/pages/auth/AdminLogin.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ShieldCheck, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/use-toast'

const AdminLogin = () => {
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [errors,    setErrors]    = useState<Record<string, string>>({})

  const navigate    = useNavigate()
  const { adminLogin, isLoading } = useAuth()
  const { toast }   = useToast()

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email.trim())    e.email    = 'Email is required'
    if (!password.trim()) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return

    try {
      const user = await adminLogin(email, password)
      toast({
        title: `Welcome, ${user?.username ?? 'Administrator'} 🛡️`,
        description: 'Admin session started successfully.',
      })
      navigate('/admin/dashboard')
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Invalid credentials. Please try again.'
      toast({ title: 'Login failed', description: message, variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left brand panel ───────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12"
        style={{ background: 'linear-gradient(175deg, #1a3352 0%, #0f2035 60%, #0a1828 100%)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #a8872e)' }}>✝</div>
          <span className="font-serif text-xl font-bold text-white">BlessPay</span>
        </div>

        {/* Centre content */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
            <ShieldCheck className="h-4 w-4" style={{ color: '#C9A84C' }} />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Administrator Access
            </span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-white leading-tight mb-4">
            Church Admin<br />
            <span style={{ color: '#C9A84C' }}>Control Panel</span>
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Manage members, track collections, view transaction reports and oversee your church's digital giving platform.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4">
            {[
              { icon: '📊', label: 'Real-time collection dashboard' },
              { icon: '👥', label: 'Member management & oversight' },
              { icon: '📋', label: 'Transaction reports & exports' },
              { icon: '🔒', label: 'Role-based admin access' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm flex-shrink-0">
                  {icon}
                </div>
                <span className="text-sm text-white/60">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-xs text-white/25">
          This portal is restricted to authorised church administrators only.
        </p>
      </div>

      {/* ── Right form panel ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #a8872e)' }}>✝</div>
          <span className="font-serif text-xl font-bold text-primary">BlessPay</span>
        </div>

        <div className="w-full max-w-[400px]">

          {/* Admin badge */}
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Admin Portal
              </span>
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-primary mb-1 text-center">
            Administrator Login
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Enter your admin credentials to access the dashboard
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                placeholder="admin@blesspay.com"
                className={`w-full h-11 px-3 rounded-lg border bg-background text-sm focus:outline-none transition-colors ${
                  errors.email
                    ? 'border-destructive focus:border-destructive'
                    : 'border-input focus:border-accent'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                  placeholder="Enter your password"
                  className={`w-full h-11 px-3 pr-10 rounded-lg border bg-background text-sm focus:outline-none transition-colors ${
                    errors.password
                      ? 'border-destructive focus:border-destructive'
                      : 'border-input focus:border-accent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150 mt-2"
            >
              {isLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                : <><Lock className="h-4 w-4" /> Sign In to Admin Panel</>
              }
            </button>
          </form>

          {/* Back to member login */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Not an admin?{' '}
              <a href="/login" className="text-primary font-semibold hover:underline">
                Go to Member Login
              </a>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-4 flex items-start gap-2 bg-card border border-border rounded-lg px-4 py-3">
            <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is a restricted area. Unauthorised access attempts are logged. Admin accounts can only be created by a super administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin