import { useEffect, useState } from 'react';
import { MemberLayout } from '../../components/layout/MemberLayout';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import {
  Landmark, HandCoins, Coins, Receipt,
  CheckCircle2, Clock4, XOctagon, ArrowUpRight,
  CreditCard, ChevronRight, Sparkles, Loader2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

interface Tx {
  _id: string;
  createdAt: string;
  type: string;
  amount: number;
  status: string;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { icon: typeof CheckCircle2; cls: string }> = {
    success:   { icon: CheckCircle2, cls: 'bg-success/10 text-success' },
    failed:    { icon: XOctagon,     cls: 'bg-destructive/10 text-destructive' },
    cancelled: { icon: XOctagon,     cls: 'bg-destructive/10 text-destructive' },
    pending:   { icon: Clock4,       cls: 'bg-accent/10 text-accent-foreground' },
  };
  const { icon: Icon, cls } = map[status.toLowerCase()] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}>
      <Icon className="h-3 w-3" />{status}
    </span>
  );
};

const StatCard = ({
  label, value, icon: Icon, variant = 'default', sub, loading,
}: {
  label: string; value: string; icon: React.ElementType;
  variant?: 'default' | 'accent' | 'gold'; sub?: string; loading?: boolean;
}) => {
  const gold = variant === 'gold';
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-150 hover:-translate-y-0.5 ${gold ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card border border-border shadow-sm'}`}>
      <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full ${gold ? 'bg-primary-foreground/5' : 'bg-accent/5'}`} />
      <div className={`mb-3 inline-flex items-center justify-center h-10 w-10 rounded-xl ${gold ? 'bg-primary-foreground/10' : variant === 'accent' ? 'bg-accent/10' : 'bg-primary/10'}`}>
        <Icon className={`h-5 w-5 ${gold ? 'text-accent' : variant === 'accent' ? 'text-accent' : 'text-primary'}`} />
      </div>
      <p className={`text-xs font-medium mb-1 ${gold ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{label}</p>
      {loading
        ? <div className="h-8 w-28 rounded-md bg-current opacity-10 animate-pulse mt-1" />
        : <p className={`font-serif text-2xl font-bold ${gold ? 'text-primary-foreground' : 'text-foreground'}`}>{value}</p>
      }
      <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${gold ? 'text-primary-foreground/40' : 'text-muted-foreground'}`}>
        <ArrowUpRight className="h-3 w-3" />{sub ?? 'Updated today'}
      </div>
    </div>
  );
};

const BreakdownBar = ({ label, amount, total, emoji, variant }: {
  label: string; amount: number; total: number;
  emoji: string; variant: 'accent' | 'primary' | 'success';
}) => {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  const bar = variant === 'accent' ? 'bg-accent' : variant === 'success' ? 'bg-success' : 'bg-primary';
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">{emoji}</span>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className={`h-full rounded-full ${bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const [loading,  setLoading]  = useState(true);
  const [txs,      setTxs]      = useState<Tx[]>([]);
  const [dashData, setDashData] = useState<{ totalGiven: number; totalTithe: number; totalOffering: number } | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [dashRes, txRes] = await Promise.all([
        api.get('/user/dashboard'),
        api.get('/transactions'),
      ]);
      setDashData(dashRes.data.summary);
      setAllTxs(txRes.data.transactions ?? []);
    } catch (err: any) {
      toast({ title: 'Failed to load dashboard', description: err?.response?.data?.message ?? 'Please refresh.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const [allTxs, setAllTxs] = useState<Tx[]>([]);

  const totalGiven    = dashData?.totalGiven    ?? 0;
  const titheTotal    = dashData?.totalTithe    ?? 0;
  const offeringTotal = dashData?.totalOffering ?? 0;
  const successCount  = allTxs.filter(t => t.status === 'success').length;
  const recentTxs     = [...allTxs].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <MemberLayout>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-primary">{getGreeting()}, {user?.username} 🙏</h1>
        <p className="text-sm text-muted-foreground mt-1">Your Giving Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Given"    value={formatCurrency(totalGiven)}    icon={Coins}     variant="gold"   loading={loading} />
        <StatCard label="Total Tithe"    value={formatCurrency(titheTotal)}    icon={Landmark}  loading={loading} />
        <StatCard label="Total Offering" value={formatCurrency(offeringTotal)} icon={HandCoins} variant="accent" loading={loading} />
        <StatCard label="Successful"     value={String(successCount)}          icon={Receipt}   loading={loading} />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Transactions */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-border">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</p>
              <h2 className="font-serif text-lg font-semibold text-foreground">Transactions</h2>
            </div>
            <Link to="/transactions" className="inline-flex items-center gap-1 text-xs font-semibold text-success hover:text-success/80 transition-colors px-2 py-1 rounded-md hover:bg-success/5">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : recentTxs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <CreditCard className="h-10 w-10 text-muted mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No transactions yet. Make your first giving today.</p>
              <button onClick={() => navigate('/payment')} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Make a Payment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTxs.map(tx => (
                <div key={tx._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/50 transition-colors">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm shrink-0 ${tx.type === 'tithe' ? 'bg-accent/10' : 'bg-primary/10'}`}>
                    {tx.type === 'tithe' ? '🙏' : '💝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(tx.amount)}</p>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Breakdown */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Breakdown</p>
            <h2 className="font-serif text-lg font-semibold text-foreground">Giving Categories</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <>
              <BreakdownBar label="Tithe"      amount={titheTotal}    total={totalGiven || 1}     emoji="🙏" variant="accent"  />
              <BreakdownBar label="Offering"   amount={offeringTotal} total={totalGiven || 1}     emoji="💝" variant="primary" />
              <BreakdownBar label="Successful" amount={successCount}  total={allTxs.length || 1}  emoji="✅" variant="success" />
            </>
          )}
          <button
            onClick={() => navigate('/payment')}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150"
          >
            <CreditCard className="h-4 w-4" /> Make a New Payment
          </button>
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-accent" />
          <h2 className="font-serif text-lg font-semibold text-foreground">Giving Summary</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Transactions', value: String(allTxs.length)       },
              { label: 'Total Tithe',        value: formatCurrency(titheTotal)   },
              { label: 'Total Offering',     value: formatCurrency(offeringTotal)},
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                <p className="font-serif text-xl font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
};

export default Dashboard;