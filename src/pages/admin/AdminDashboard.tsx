import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import {
  Users, Landmark, HandCoins, Coins,
  CheckCircle2, Clock4, XOctagon, ArrowUpRight,
  ChevronRight, ShieldCheck, BarChart3,
  Receipt, Loader2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

interface Member {
  _id: string; username: string; email: string;
  phone: string; status: string; createdAt: string;
}
interface Tx {
  _id: string; createdAt: string; type: string;
  amount: number; status: string;
  user: { username: string } | null;
}
interface BreakdownItem { _id: string; totalAmount: number; count: number }

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { icon: typeof CheckCircle2; cls: string }> = {
    success:   { icon: CheckCircle2, cls: 'bg-success/10 text-success' },
    active:    { icon: CheckCircle2, cls: 'bg-success/10 text-success' },
    failed:    { icon: XOctagon,     cls: 'bg-destructive/10 text-destructive' },
    suspended: { icon: XOctagon,     cls: 'bg-destructive/10 text-destructive' },
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

const getInitials = (name: string) => name ? name.slice(0, 2).toUpperCase() : '??';

const AdminDashboard = () => {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [loading,   setLoading]   = useState(true);
  const [members,   setMembers]   = useState<Member[]>([]);
  const [txs,       setTxs]       = useState<Tx[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [totalColl, setTotalColl] = useState(0);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [mRes, tRes, rRes] = await Promise.all([
        api.get('/admin/members'),
        api.get('/admin/transactions'),
        api.get('/admin/report'),
      ]);
      setMembers(mRes.data.members      ?? []);
      setTxs    (tRes.data.transactions ?? []);
      setBreakdown(rRes.data.breakdown  ?? []);
      setTotalColl(rRes.data.totalCollected ?? 0);
    } catch (err: any) {
      toast({ title: 'Failed to load dashboard', description: err?.response?.data?.message ?? 'Please refresh.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  /* derived */
  const titheTotal    = breakdown.find(b => b._id === 'tithe')?.totalAmount    ?? 0;
  const offeringTotal = breakdown.find(b => b._id === 'offering')?.totalAmount ?? 0;
  const activeMembers = members.filter(m => m.status !== 'suspended').length;
  const successTxs    = txs.filter(t => t.status === 'success');
  const successTxCount= successTxs.length;
  const giverIds      = new Set(successTxs.map(t => (t.user as any)?._id ?? t.user));

  const recentTxs = [...txs]
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
  const recentMembers = [...members]
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-primary">Welcome back, Administrator 🛡️</h1>
        <p className="text-sm text-muted-foreground mt-1">Church Financial Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Collections" value={formatCurrency(totalColl)}    icon={Coins}     variant="gold"   sub="All successful payments" loading={loading} />
        <StatCard label="Total Members"     value={String(members.length)}        icon={Users}     sub={`${activeMembers} active`}                loading={loading} />
        <StatCard label="Total Tithe"       value={formatCurrency(titheTotal)}    icon={Landmark}  variant="accent"                               loading={loading} />
        <StatCard label="Total Offering"    value={formatCurrency(offeringTotal)} icon={HandCoins}                                                loading={loading} />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-border">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latest Activity</p>
              <h2 className="font-serif text-lg font-semibold text-foreground">Recent Transactions</h2>
            </div>
            <Link to="/admin/transactions" className="inline-flex items-center gap-1 text-xs font-semibold text-success hover:text-success/80 transition-colors px-2 py-1 rounded-md hover:bg-success/5">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : recentTxs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Receipt className="h-10 w-10 text-muted mb-3" />
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTxs.map((tx, i) => (
                <div key={tx._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/50 transition-colors">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm shrink-0 ${tx.type === 'tithe' ? 'bg-accent/10' : 'bg-primary/10'}`}>
                    {tx.type === 'tithe' ? '🙏' : '💝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{tx.user?.username ?? 'Member'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{tx.type} · {formatDate(tx.createdAt)}</p>
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

        {/* Right Column */}
        <div className="space-y-6">

          {/* Recent Members */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Joiners</p>
                <h2 className="font-serif text-base font-semibold text-foreground">Recent Members</h2>
              </div>
              <Link to="/admin/members" className="inline-flex items-center gap-1 text-xs font-semibold text-success hover:text-success/80 transition-colors px-2 py-1 rounded-md hover:bg-success/5">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : recentMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No members yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentMembers.map(m => (
                  <div key={m._id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {getInitials(m.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{m.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.phone}</p>
                    </div>
                    <StatusBadge status={m.status ?? 'active'} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collection Breakdown */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-serif text-base font-semibold text-foreground mb-4">Collection Breakdown</h3>
            {loading ? (
              <div className="flex items-center justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              [
                { label: 'Tithe',         amount: titheTotal,    total: totalColl || 1,        emoji: '🙏', barClass: 'bg-accent'   },
                { label: 'Offering',      amount: offeringTotal, total: totalColl || 1,        emoji: '💝', barClass: 'bg-primary'  },
                { label: 'Active Givers', amount: giverIds.size, total: members.length || 1,   emoji: '👥', barClass: 'bg-success'  },
              ].map(({ label, amount, total, emoji, barClass }) => {
                const pct = Math.round((amount / total) * 100);
                return (
                  <div key={label} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{emoji}</span>
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className={`h-full rounded-full ${barClass} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: Users,    label: 'Manage Members',  sub: `${members.length} total`,  to: '/admin/members',      hover: 'hover:border-success hover:bg-success/5'  },
              { icon: Receipt,  label: 'All Transactions', sub: `${txs.length} records`,   to: '/admin/transactions',  hover: 'hover:border-accent hover:bg-accent/5'    },
              { icon: BarChart3,label: 'View Reports',     sub: 'Analytics & export',       to: '/admin/reports',       hover: 'hover:border-primary hover:bg-primary/5'  },
            ].map(({ icon: Icon, label, sub, to, hover }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className={`w-full flex items-center gap-3 border border-border rounded-xl p-3 text-left transition-all duration-150 ${hover}`}
              >
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Church Health */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="h-5 w-5 text-success" />
            <h3 className="font-serif text-lg font-semibold text-foreground">Church Health</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="space-y-4">
                {[
                  { label: 'Active Members',      value: activeMembers,  total: members.length || 1 },
                  { label: 'Successful Payments', value: successTxCount, total: txs.length     || 1 },
                  { label: 'Giving Participation', value: giverIds.size, total: members.length || 1 },
                ].map(({ label, value, total }) => {
                  const pct = Math.round((value / total) * 100);
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-xs font-bold text-primary">{pct}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary chips */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: 'Members', value: String(members.length)       },
                  { label: 'Tithe',   value: formatCurrency(titheTotal)   },
                  { label: 'Offering',value: formatCurrency(offeringTotal) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;