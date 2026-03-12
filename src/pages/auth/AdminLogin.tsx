import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2, Cross } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { adminLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    if (!password.trim()) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await adminLogin(email, password);
      toast({ title: 'Welcome, Admin', description: 'You have successfully logged in.' });
      navigate('/admin');
    } 
 catch (err: any) {
  const message = err?.response?.data?.message ?? 'Invalid credentials.';
  toast({ title: 'Login failed', description: message, variant: 'destructive' });
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
      </div>

      {/* Card */}
      <div className="w-full max-w-[440px] bg-card border border-border rounded-lg p-10 border-t-4 border-t-accent">
        <div className="flex justify-center mb-4">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-primary text-center mb-1">Admin Access</h2>
        <p className="text-sm text-muted-foreground text-center italic mb-8">Authorized personnel only</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none"
              placeholder="admin@blesspay.com"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login as Admin'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Member?{' '}
          <Link to="/auth" className="text-primary font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
