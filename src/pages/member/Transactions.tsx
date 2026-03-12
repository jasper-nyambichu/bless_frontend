import { useState } from 'react';
import { MemberLayout } from '../../components/layout/MemberLayout';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { Cross, Download } from 'lucide-react';

const allTransactions = [
  { id: 'TXN001', date: '2024-12-15T10:30:00', type: 'Tithe', amount: 5000, phone: '0712345678', status: 'Success', receipt: 'RCP001' },
  { id: 'TXN002', date: '2024-12-10T14:20:00', type: 'Offering', amount: 2000, phone: '0712345678', status: 'Success', receipt: 'RCP002' },
  { id: 'TXN003', date: '2024-12-05T09:00:00', type: 'Tithe', amount: 5000, phone: '0712345678', status: 'Pending', receipt: null },
  { id: 'TXN004', date: '2024-11-28T16:45:00', type: 'Offering', amount: 1500, phone: '0712345678', status: 'Failed', receipt: null },
  { id: 'TXN005', date: '2024-11-20T11:15:00', type: 'Tithe', amount: 5000, phone: '0712345678', status: 'Success', receipt: 'RCP003' },
  { id: 'TXN006', date: '2024-11-15T08:30:00', type: 'Offering', amount: 3000, phone: '0712345678', status: 'Success', receipt: 'RCP004' },
  { id: 'TXN007', date: '2024-11-10T13:00:00', type: 'Tithe', amount: 5000, phone: '0712345678', status: 'Success', receipt: 'RCP005' },
];

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
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

const Transactions = () => {
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = allTransactions.filter(tx => {
    if (typeFilter !== 'All' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'All' && tx.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const totalTithe = allTransactions.filter(t => t.type === 'Tithe' && t.status === 'Success').reduce((s, t) => s + t.amount, 0);
  const totalOffering = allTransactions.filter(t => t.type === 'Offering' && t.status === 'Success').reduce((s, t) => s + t.amount, 0);

  return (
    <MemberLayout>
      <h1 className="font-serif text-2xl font-bold text-primary mb-4">Transaction History</h1>

      {/* Summary */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground bg-surface px-3 py-1.5 rounded-md border border-border">
          Total: {allTransactions.length} transactions
        </span>
        <span className="text-xs font-medium text-muted-foreground bg-surface px-3 py-1.5 rounded-md border border-border">
          Tithe: {formatCurrency(totalTithe)}
        </span>
        <span className="text-xs font-medium text-muted-foreground bg-surface px-3 py-1.5 rounded-md border border-border">
          Offering: {formatCurrency(totalOffering)}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none"
        >
          <option>All</option>
          <option>Tithe</option>
          <option>Offering</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none"
        >
          <option>All</option>
          <option>Success</option>
          <option>Failed</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        {paginated.length === 0 ? (
          <div className="py-16 text-center">
            <Cross className="h-10 w-10 text-accent mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No transactions yet. Make your first offering.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Date & Time</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Transaction ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(tx => (
                <tr key={tx.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDateTime(tx.date)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.id}</td>
                  <td className="px-4 py-3">{typeBadge(tx.type)}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(tx.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.phone}</td>
                  <td className="px-4 py-3">{statusBadge(tx.status)}</td>
                  <td className="px-4 py-3">
                    {tx.status === 'Success' && tx.receipt ? (
                      <button className="flex items-center gap-1 text-xs text-accent font-medium hover:underline">
                        <Download className="h-3 w-3" /> Download
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
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-medium text-primary border border-border rounded-md hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                page === i + 1 ? 'bg-primary text-primary-foreground' : 'text-primary border border-border hover:bg-muted'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-medium text-primary border border-border rounded-md hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </MemberLayout>
  );
};

export default Transactions;
