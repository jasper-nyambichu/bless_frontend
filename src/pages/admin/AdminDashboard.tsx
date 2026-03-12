import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Users, DollarSign, TrendingUp, CreditCard, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

// ── Types ────────────────────────────────────────────────────────────────────
interface Member {
  _id: string;
  username: string;
  email: string;
  status: string;
  createdAt: string;
}

interface Transaction {
  _id: string;
  user: { username: string } | null;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface ReportBreakdown {
  _id: string;       // 'tithe' | 'offering'
  totalAmount: number;
  count: number;
}

interface DashboardStats {
  totalMembers: number;
  totalCollected: number;
  totalTithe: number;
  totalOffering: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusBadge = (status: string) => {
  const s = status.toLowerCase();
  const styles: Record<string, string> = {
    active:    'bg-success/10 text-success',
    suspended: 'bg-destructive/10 text-destructive',
    success:   'bg-success/10 text-success',
    failed:    'bg-destructive/10 text-destructive',
    pending:   'bg-muted text-muted-foreground',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[s] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
};

const typeBadge = (type: string) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium text-primary-foreground capitalize ${
    type?.toLowerCase() === 'tithe' ? 'bg-accent' : 'bg-primary'
  }`}>
    {type}
  </span>
);

// ── Component ─────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalCollected: 0,
    totalTithe: 0,
    totalOffering: 0,
  });
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        // fire all three requests in parallel
        const [membersRes, transactionsRes, reportRes] = await Promise.all([
          api.get('/admin/members'),
          api.get('/admin/transactions'),
          api.get('/admin/report'),
        ]);

        // members
        const allMembers: Member[] = membersRes.data.members ?? [];
        const sorted = [...allMembers].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentMembers(sorted.slice(0, 5));

        // transactions — most recent 5
        const allTx: Transaction[] = transactionsRes.data.transactions ?? [];
        setRecentTransactions(allTx.slice(0, 5));

        // report breakdown
        const breakdown: ReportBreakdown[] = reportRes.data.breakdown ?? [];
        const titheData    = breakdown.find(b => b._id === 'tithe');
        const offeringData = breakdown.find(b => b._id === 'offering');

        setStats({
          totalMembers:   allMembers.length,
          totalCollected: reportRes.data.totalCollected ?? 0,
          totalTithe:     titheData?.totalAmount ?? 0,
          totalOffering:  offeringData?.totalAmount ?? 0,
        });

      } catch (err: any) {
        toast({
          title: 'Failed to load dashboard',
          description: err?.response?.data?.message ?? 'Could not fetch data from server.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const statCards = [
    { label: 'Total Members',     value: stats.totalMembers.toString(),        icon: Users,      accent: false },
    { label: 'Total Collections', value: formatCurrency(stats.totalCollected),  icon: DollarSign, accent: true  },
    { label: 'Total Tithe',       value: formatCurrency(stats.totalTithe),      icon: TrendingUp, accent: false },
    { label: 'Total Offering',    value: formatCurrency(stats.totalOffering),   icon: CreditCard, accent: false },
  ];

  return (
    <AdminLayout>
      <h1 className="font-serif text-2xl font-bold text-primary mb-8">Admin Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(stat => (
              <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon className={`h-5 w-5 ${stat.accent ? 'text-accent' : 'text-primary'}`} />
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-xl font-bold ${stat.accent ? 'text-accent' : 'text-primary'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Members */}
            <div className="bg-card border border-border rounded-lg">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-serif text-base font-semibold text-primary">Recent Members</h2>
                <Link to="/admin/members" className="text-xs font-medium text-primary hover:underline">
                  View All
                </Link>
              </div>

              {recentMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No members yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Username</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Email</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMembers.map(m => (
                      <tr key={m._id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 font-medium text-primary">{m.username}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{m.email}</td>
                        <td className="px-4 py-2.5">{statusBadge(m.status)}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{formatDate(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-card border border-border rounded-lg">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-serif text-base font-semibold text-primary">Recent Transactions</h2>
                <Link to="/admin/transactions" className="text-xs font-medium text-primary hover:underline">
                  View All
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Member</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Type</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map(tx => (
                      <tr key={tx._id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 font-medium text-primary">
                          {tx.user?.username ?? 'Unknown'}
                        </td>
                        <td className="px-4 py-2.5">{typeBadge(tx.type)}</td>
                        <td className="px-4 py-2.5 font-semibold text-primary">{formatCurrency(tx.amount)}</td>
                        <td className="px-4 py-2.5">{statusBadge(tx.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;