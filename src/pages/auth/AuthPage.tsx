import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cross, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Register state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!loginUsername.trim()) errors.username = 'Username is required';
    if (!loginPassword.trim()) errors.password = 'Password is required';
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const user = await login(loginUsername, loginPassword);
      toast({ title: `Welcome back, ${user?.username ?? loginUsername}!`, description: 'You have successfully logged in.' });
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Invalid credentials. Please try again.';
      toast({ title: 'Login failed', description: message, variant: 'destructive' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!regUsername.trim()) errors.username = 'Username is required';
    if (!regEmail.trim()) errors.email = 'Email is required';
    if (!regPhone.trim()) errors.phone = 'Phone number is required';
    if (!regPassword.trim()) errors.password = 'Password is required';
    if (regPassword.length < 6) errors.password = 'Password must be at least 6 characters';
    setRegErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const user = await register({ username: regUsername, email: regEmail, phone: regPhone, password: regPassword });
      toast({ title: `Account created!`, description: `Welcome to BlessPay, ${user?.username ?? regUsername} 🙏` });
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Registration failed. Please try again.';
      toast({ title: 'Registration failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Cross className="h-6 w-6 text-accent" />
          <h1 className="font-serif text-3xl font-bold text-primary">BlessPay</h1>
        </div>
        <p className="text-sm text-muted-foreground">Faithful Giving, Made Simple</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[440px] bg-card border border-border rounded-lg p-10">
        {/* Tabs */}
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 pb-3 text-sm font-semibold ${
              activeTab === 'login'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 pb-3 text-sm font-semibold ${
              activeTab === 'register'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin}>
            <h2 className="font-serif text-2xl font-bold text-primary mb-6">Welcome Back</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none"
                placeholder="Enter your username"
              />
              {loginErrors.username && <p className="text-xs text-destructive mt-1">{loginErrors.username}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginErrors.password && <p className="text-xs text-destructive mt-1">{loginErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
            </button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Admin?{' '}
              <Link to="/admin/login" className="text-primary font-medium hover:underline">
                Login here
              </Link>
            </p>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister}>
            <h2 className="font-serif text-2xl font-bold text-primary mb-6">Create Your Account</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input
                type="text"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none"
                placeholder="e.g. johndoe"
              />
              {regErrors.username && <p className="text-xs text-destructive mt-1">{regErrors.username}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <input
                type="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none"
                placeholder="john@example.com"
              />
              {regErrors.email && <p className="text-xs text-destructive mt-1">{regErrors.email}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none"
                placeholder="e.g. 0712345678"
              />
              {regErrors.phone && <p className="text-xs text-destructive mt-1">{regErrors.phone}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showRegPass ? 'text' : 'password'}
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPass(!showRegPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {regErrors.password && <p className="text-xs text-destructive mt-1">{regErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
