import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

interface Transaction {
  _id: string;
  createdAt: string;
  user: { username: string; phone: string } | null;
  phone: string;
  type: string;
  amount: number;
  mpesaReceiptNumber: string | null;
  status: string;
}

const typeBadge = (type: string) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium text-primary-foreground capitalize ${
    type?.toLowerCase() === 'tithe' ? 'bg-accent' : 'bg-primary'
  }`}>{type}</span>
);

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    success: 'bg-success/10 text-success',
    failed: 'bg-destructive/10 text-destructive',
    pending: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive/10 text-destructive',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[status.toLowerCase()] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
};

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/transactions');
      setTransactions(data.transactions ?? []);
    } catch (err: any) {
      toast({
        title: 'Failed to load transactions',
        description: err?.response?.data?.message ?? 'Could not fetch transactions.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Member', 'Phone', 'Type', 'Amount', 'Mpesa Receipt', 'Status'];
    const rows = filtered.map(tx => [
      formatDateTime(tx.createdAt),
      tx.user?.username ?? 'Unknown',
      tx.phone,
      tx.type,
      tx.amount,
      tx.mpesaReceiptNumber ?? '',
      tx.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `blesspay-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast({ title: 'CSV exported successfully' });
  };

  // client-side filtering
  const filtered = transactions.filter(tx => {
    if (typeFilter !== 'All' && tx.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (statusFilter !== 'All' && tx.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (fromDate && tx.createdAt < fromDate) return false;
    if (toDate && tx.createdAt > toDate + 'T23:59:59') return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // summary from ALL transactions (not just filtered)
  const successTx = transactions.filter(t => t.status === 'success');
  const totalCollected = successTx.reduce((s, t) => s + t.amount, 0);
  const totalTithe    = successTx.filter(t => t.type === 'tithe').reduce((s, t) => s + t.amount, 0);
  const totalOffering = successTx.filter(t => t.type === 'offering').reduce((s, t) => s + t.amount, 0);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl font-bold text-primary">All Transactions</h1>
        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 px-3 h-9 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground bg-card px-3 py-1.5 rounded-md border border-border">
          Total Collected: {formatCurrency(totalCollected)}
        </span>
        <span className="text-xs font-medium text-muted-foreground bg-card px-3 py-1.5 rounded-md border border-border">
          Tithe: {formatCurrency(totalTithe)}
        </span>
        <span className="text-xs font-medium text-muted-foreground bg-card px-3 py-1.5 rounded-md border border-border">
          Offering: {formatCurrency(totalOffering)}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none">
          <option>All</option>
          <option value="tithe">Tithe</option>
          <option value="offering">Offering</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none">
          <option>All</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none" />
        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none" />
        {(fromDate || toDate || typeFilter !== 'All' || statusFilter !== 'All') && (
          <button
            onClick={() => { setTypeFilter('All'); setStatusFilter('All'); setFromDate(''); setToDate(''); setPage(1); }}
            className="h-9 px-3 text-xs text-muted-foreground border border-border rounded-md hover:bg-muted"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paginated.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">
            {transactions.length === 0 ? 'No transactions yet.' : 'No transactions match your filters.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Member</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Mpesa Receipt</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(tx => (
                <tr key={tx._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDateTime(tx.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-primary">{tx.user?.username ?? 'Unknown'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.phone}</td>
                  <td className="px-4 py-3">{typeBadge(tx.type)}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(tx.amount)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {tx.mpesaReceiptNumber ?? '—'}
                  </td>
                  <td className="px-4 py-3">{statusBadge(tx.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-xs font-medium text-primary border border-border rounded-md hover:bg-muted disabled:opacity-50">
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                page === i + 1 ? 'bg-primary text-primary-foreground' : 'text-primary border border-border hover:bg-muted'
              }`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-medium text-primary border border-border rounded-md hover:bg-muted disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTransactions;