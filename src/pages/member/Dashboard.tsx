import { MemberLayout } from '../../components/layout/MemberLayout';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { DollarSign, TrendingUp, Hash, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockTransactions = [
  { id: 'TXN001', date: '2024-12-15', type: 'Tithe' as const, amount: 5000, status: 'Success' as const },
  { id: 'TXN002', date: '2024-12-10', type: 'Offering' as const, amount: 2000, status: 'Success' as const },
  { id: 'TXN003', date: '2024-12-05', type: 'Tithe' as const, amount: 5000, status: 'Pending' as const },
  { id: 'TXN004', date: '2024-11-28', type: 'Offering' as const, amount: 1500, status: 'Failed' as const },
  { id: 'TXN005', date: '2024-11-20', type: 'Tithe' as const, amount: 5000, status: 'Success' as const },
];

const stats = [
  { label: 'Total Tithe Given', value: formatCurrency(15000), icon: DollarSign, accent: false },
  { label: 'Total Offering Given', value: formatCurrency(3500), icon: CreditCard, accent: false },
  { label: 'Total Given', value: formatCurrency(18500), icon: TrendingUp, accent: true },
  { label: 'Transactions', value: '12', icon: Hash, accent: false },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Success: 'bg-success/10 text-success',
    Failed: 'bg-destructive/10 text-destructive',
    Pending: 'bg-muted text-muted-foreground',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>{status}</span>;
};

const typeBadge = (type: string) => {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
      type === 'Tithe' ? 'bg-accent/15 text-accent-foreground' : 'bg-primary/10 text-primary'
    }`}>
      {type}
    </span>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <MemberLayout>
      {/* Greeting */}
      <h1 className="font-serif text-2xl font-bold text-primary mb-1">
        {getGreeting()}, {user?.username} 🙏
      </h1>
      <div className="w-12 h-0.5 bg-accent mb-8" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className={`h-5 w-5 ${stat.accent ? 'text-accent' : 'text-primary'}`} />
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-xl font-bold ${stat.accent ? 'text-accent' : 'text-primary'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-serif text-lg font-semibold text-primary">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map(tx => (
                <tr key={tx.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-3 text-muted-foreground">{formatDate(tx.date)}</td>
                  <td className="px-6 py-3">{typeBadge(tx.type)}</td>
                  <td className="px-6 py-3 font-semibold text-primary">{formatCurrency(tx.amount)}</td>
                  <td className="px-6 py-3">{statusBadge(tx.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-border">
          <Link to="/transactions" className="text-sm font-medium text-primary hover:underline">
            View All Transactions →
          </Link>
        </div>
      </div>
    </MemberLayout>
  );
};

export default Dashboard;
