import { AdminLayout } from '../../components/layout/AdminLayout';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Users, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Members', value: '248', icon: Users, accent: false },
  { label: 'Total Collections', value: formatCurrency(1250000), icon: DollarSign, accent: true },
  { label: 'Total Tithe', value: formatCurrency(850000), icon: TrendingUp, accent: false },
  { label: 'Total Offering', value: formatCurrency(400000), icon: CreditCard, accent: false },
];

const recentMembers = [
  { username: 'janedoe', email: 'jane@mail.com', status: 'Active', joined: '2024-12-10' },
  { username: 'petermwangi', email: 'peter@mail.com', status: 'Active', joined: '2024-12-08' },
  { username: 'marykamau', email: 'mary@mail.com', status: 'Suspended', joined: '2024-12-05' },
  { username: 'johnochieng', email: 'john@mail.com', status: 'Active', joined: '2024-12-01' },
];

const recentTransactions = [
  { member: 'janedoe', type: 'Tithe', amount: 5000, status: 'Success' },
  { member: 'petermwangi', type: 'Offering', amount: 2000, status: 'Success' },
  { member: 'marykamau', type: 'Tithe', amount: 3000, status: 'Pending' },
  { member: 'johnochieng', type: 'Offering', amount: 1500, status: 'Failed' },
];

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Active: 'bg-success/10 text-success',
    Suspended: 'bg-destructive/10 text-destructive',
    Success: 'bg-success/10 text-success',
    Failed: 'bg-destructive/10 text-destructive',
    Pending: 'bg-muted text-muted-foreground',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>{status}</span>;
};

const typeBadge = (type: string) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium text-primary-foreground ${
    type === 'Tithe' ? 'bg-accent' : 'bg-primary'
  }`}>{type}</span>
);

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <h1 className="font-serif text-2xl font-bold text-primary mb-8">Admin Dashboard</h1>

      {/* Stats */}
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

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-primary">Recent Members</h2>
            <Link to="/admin/members" className="text-xs font-medium text-primary hover:underline">View All</Link>
          </div>
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
                <tr key={m.username} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-medium text-primary">{m.username}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-2.5">{statusBadge(m.status)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{formatDate(m.joined)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-primary">Recent Transactions</h2>
            <Link to="/admin/transactions" className="text-xs font-medium text-primary hover:underline">View All</Link>
          </div>
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
              {recentTransactions.map((tx, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-medium text-primary">{tx.member}</td>
                  <td className="px-4 py-2.5">{typeBadge(tx.type)}</td>
                  <td className="px-4 py-2.5 font-semibold text-primary">{formatCurrency(tx.amount)}</td>
                  <td className="px-4 py-2.5">{statusBadge(tx.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
