import { useState, useEffect } from 'react';
import { MemberLayout } from '../../components/layout/MemberLayout';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { Cross, Download, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

interface Transaction {
  _id: string;
  createdAt: string;
  type: string;
  amount: number;
  phone: string;
  status: string;
  mpesaReceiptNumber: string | null;
  checkoutRequestId: string | null;
}

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

const typeBadge = (type: string) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium text-primary-foreground capitalize ${
    type?.toLowerCase() === 'tithe' ? 'bg-accent' : 'bg-primary'
  }`}>{type}</span>
);

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 5;
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/transactions');
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

  const handleDownloadReceipt = async (tx: Transaction) => {
    try {
      setDownloadingId(tx._id);
      const response = await api.get(`/transactions/${tx._id}/receipt`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${tx.mpesaReceiptNumber ?? tx._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Receipt downloaded successfully' });
    } catch (err: any) {
      toast({
        title: 'Download failed',
        description: err?.response?.data?.message ?? 'Could not download receipt.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // client-side filtering
  const filtered = transactions.filter(tx => {
    if (typeFilter !== 'All' && tx.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (statusFilter !== 'All' && tx.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // summary stats from successful transactions only
  const successTx = transactions.filter(t => t.status === 'success');
  const totalTithe    = successTx.filter(t => t.type === 'tithe').reduce((s, t) => s + t.amount, 0);
  const totalOffering = successTx.filter(t => t.type === 'offering').reduce((s, t) => s + t.amount, 0);

  return (
    <MemberLayout>
      <h1 className="font-serif text-2xl font-bold text-primary mb-4">Transaction History</h1>

      {/* Summary chips */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground bg-card px-3 py-1.5 rounded-md border border-border">
          Total: {transactions.length} transactions
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
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none"
        >
          <option>All</option>
          <option value="tithe">Tithe</option>
          <option value="offering">Offering</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none"
        >
          <option>All</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center">
            <Cross className="h-10 w-10 text-accent mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {transactions.length === 0
                ? 'No transactions yet. Make your first offering.'
                : 'No transactions match your filters.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Date & Time</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Mpesa Receipt</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(tx => (
                <tr key={tx._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDateTime(tx.createdAt)}</td>
                  <td className="px-4 py-3">{typeBadge(tx.type)}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(tx.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.phone}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {tx.mpesaReceiptNumber ?? '—'}
                  </td>
                  <td className="px-4 py-3">{statusBadge(tx.status)}</td>
                  <td className="px-4 py-3">
                    {tx.status === 'success' && tx.mpesaReceiptNumber ? (
                      <button
                        onClick={() => handleDownloadReceipt(tx)}
                        disabled={downloadingId === tx._id}
                        className="flex items-center gap-1 text-xs text-accent font-medium hover:underline disabled:opacity-50"
                      >
                        {downloadingId === tx._id
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Download className="h-3 w-3" />}
                        Download
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
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
    </MemberLayout>
  );
};

export default Transactions;