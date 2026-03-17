// src/pages/auth/AuthPage.tsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/use-toast'

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const navigate = useNavigate()
  const { login, register, isLoading } = useAuth()
  const { toast } = useToast()

  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [loginErrors,   setLoginErrors]   = useState<Record<string, string>>({})

  const [regUsername, setRegUsername] = useState('')
  const [regEmail,    setRegEmail]    = useState('')
  const [regPhone,    setRegPhone]    = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showRegPass, setShowRegPass] = useState(false)
  const [regErrors,   setRegErrors]   = useState<Record<string, string>>({})

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}
    if (!loginUsername.trim()) errors.username = 'Username is required'
    if (!loginPassword.trim()) errors.password = 'Password is required'
    setLoginErrors(errors)
    if (Object.keys(errors).length > 0) return
    try {
      const user = await login(loginUsername, loginPassword)
      toast({ title: `Welcome back, ${user?.username ?? loginUsername}! 🙏`, description: 'You have successfully logged in.' })
      navigate('/dashboard')
    } catch (err: any) {
      toast({ title: 'Login failed', description: err?.response?.data?.message ?? 'Invalid credentials. Please try again.', variant: 'destructive' })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}
    if (!regUsername.trim()) errors.username = 'Username is required'
    if (!regEmail.trim())    errors.email    = 'Email is required'
    if (!regPhone.trim())    errors.phone    = 'Phone number is required'
    if (!regPassword.trim()) errors.password = 'Password is required'
    if (regPassword.length < 6) errors.password = 'Password must be at least 6 characters'
    setRegErrors(errors)
    if (Object.keys(errors).length > 0) return
    try {
      const user = await register({ username: regUsername, email: regEmail, phone: regPhone, password: regPassword })
      toast({ title: 'Account created!', description: `Welcome to BlessPay, ${user?.username ?? regUsername} 🙏` })
      navigate('/dashboard')
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err?.response?.data?.message ?? 'Please try again.', variant: 'destructive' })
    }
  }

  const inputCls = (hasError?: boolean) =>
    `w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-0 focus:outline-none transition-colors ${
      hasError ? 'border-destructive focus:border-destructive' : 'border-input focus:border-accent'
    }`

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #a8872e)' }}>✝</div>
          <h1 className="font-serif text-3xl font-bold text-primary">BlessPay</h1>
        </div>
        <p className="text-sm text-muted-foreground">Faithful Giving, Made Simple</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[440px] bg-card border border-border rounded-xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['login', 'register'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-accent bg-accent/5'
                  : 'text-muted-foreground hover:text-primary'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">

          {/* LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <h2 className="font-serif text-2xl font-bold text-primary mb-1">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mb-6">Sign in to your member account</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
                <input type="text" value={loginUsername} placeholder="Enter your username"
                  onChange={e => { setLoginUsername(e.target.value); setLoginErrors(p => ({ ...p, username: '' })) }}
                  className={inputCls(!!loginErrors.username)} />
                {loginErrors.username && <p className="text-xs text-destructive mt-1">{loginErrors.username}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input type={showLoginPass ? 'text' : 'password'} value={loginPassword} placeholder="Enter your password"
                    onChange={e => { setLoginPassword(e.target.value); setLoginErrors(p => ({ ...p, password: '' })) }}
                    className={inputCls(!!loginErrors.password) + ' pr-10'} />
                  <button type="button" onClick={() => setShowLoginPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginErrors.password && <p className="text-xs text-destructive mt-1">{loginErrors.password}</p>}
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-accent hover:text-accent-foreground disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
              </button>
            </form>
          )}

          {/* REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister}>
              <h2 className="font-serif text-2xl font-bold text-primary mb-1">Create Account</h2>
              <p className="text-sm text-muted-foreground mb-6">Join your church on BlessPay</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
                <input type="text" value={regUsername} placeholder="e.g. johndoe"
                  onChange={e => { setRegUsername(e.target.value); setRegErrors(p => ({ ...p, username: '' })) }}
                  className={inputCls(!!regErrors.username)} />
                {regErrors.username && <p className="text-xs text-destructive mt-1">{regErrors.username}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                <input type="email" value={regEmail} placeholder="john@example.com"
                  onChange={e => { setRegEmail(e.target.value); setRegErrors(p => ({ ...p, email: '' })) }}
                  className={inputCls(!!regErrors.email)} />
                {regErrors.email && <p className="text-xs text-destructive mt-1">{regErrors.email}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                <input type="tel" value={regPhone} placeholder="e.g. 0712345678"
                  onChange={e => { setRegPhone(e.target.value); setRegErrors(p => ({ ...p, phone: '' })) }}
                  className={inputCls(!!regErrors.phone)} />
                {regErrors.phone && <p className="text-xs text-destructive mt-1">{regErrors.phone}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input type={showRegPass ? 'text' : 'password'} value={regPassword} placeholder="At least 6 characters"
                    onChange={e => { setRegPassword(e.target.value); setRegErrors(p => ({ ...p, password: '' })) }}
                    className={inputCls(!!regErrors.password) + ' pr-10'} />
                  <button type="button" onClick={() => setShowRegPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {regErrors.password && <p className="text-xs text-destructive mt-1">{regErrors.password}</p>}
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-accent hover:text-accent-foreground disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
              </button>
            </form>
          )}

          {/* Admin link — clearly separated, not a tab */}
          <div className="mt-6 pt-5 border-t border-border">
            <Link to="/admin/login"
              className="flex items-center justify-center gap-2 w-full h-9 rounded-md border border-border text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-all duration-150 group">
              <ShieldCheck className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
              Church Administrator? Login here
            </Link>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        By signing in you agree to BlessPay's terms of service.
      </p>
    </div>
  )
}

export default AuthPage