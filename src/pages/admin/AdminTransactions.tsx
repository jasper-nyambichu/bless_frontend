import { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { Download } from 'lucide-react';

const allTransactions = [
  { id: 'TXN001', date: '2024-12-15T10:30:00', member: 'janedoe', phone: '0712345678', type: 'Tithe', amount: 5000, receipt: 'QWE123RTY', status: 'Success' },
  { id: 'TXN002', date: '2024-12-14T14:20:00', member: 'petermwangi', phone: '0723456789', type: 'Offering', amount: 2000, receipt: 'ASD456FGH', status: 'Success' },
  { id: 'TXN003', date: '2024-12-13T09:00:00', member: 'marykamau', phone: '0734567890', type: 'Tithe', amount: 3000, receipt: null, status: 'Pending' },
  { id: 'TXN004', date: '2024-12-12T16:45:00', member: 'johnochieng', phone: '0745678901', type: 'Offering', amount: 1500, receipt: null, status: 'Failed' },
  { id: 'TXN005', date: '2024-12-11T11:15:00', member: 'sarahnjeri', phone: '0756789012', type: 'Tithe', amount: 5000, receipt: 'ZXC789VBN', status: 'Success' },
  { id: 'TXN006', date: '2024-12-10T08:30:00', member: 'davidkiprop', phone: '0767890123', type: 'Offering', amount: 3000, receipt: 'MNB012QWE', status: 'Success' },
  { id: 'TXN007', date: '2024-12-09T13:00:00', member: 'janedoe', phone: '0712345678', type: 'Tithe', amount: 5000, receipt: 'POI345UYT', status: 'Success' },
  { id: 'TXN008', date: '2024-12-08T10:00:00', member: 'petermwangi', phone: '0723456789', type: 'Offering', amount: 1000, receipt: null, status: 'Pending' },
];

const AdminTransactions = () => {
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = allTransactions.filter(tx => {
    if (typeFilter !== 'All' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'All' && tx.status !== statusFilter) return false;
    if (fromDate && tx.date < fromDate) return false;
    if (toDate && tx.date > toDate + 'T23:59:59') return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const successTxns = allTransactions.filter(t => t.status === 'Success');
  const totalCollected = successTxns.reduce((s, t) => s + t.amount, 0);
  const totalTithe = successTxns.filter(t => t.type === 'Tithe').reduce((s, t) => s + t.amount, 0);
  const totalOffering = successTxns.filter(t => t.type === 'Offering').reduce((s, t) => s + t.amount, 0);

  const typeBadge = (type: string) => (
    <span className={`px-2 py-0.5 rounded text-xs font-medium text-primary-foreground ${
      type === 'Tithe' ? 'bg-accent' : 'bg-primary'
    }`}>{type}</span>
  );

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Success: 'bg-success/10 text-success',
      Failed: 'bg-destructive/10 text-destructive',
      Pending: 'bg-muted text-muted-foreground',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl font-bold text-primary">All Transactions</h1>
        <button className="flex items-center gap-1.5 px-3 h-9 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground bg-surface px-3 py-1.5 rounded-md border border-border">
          Total Collected: {formatCurrency(totalCollected)}
        </span>
        <span className="text-xs font-medium text-muted-foreground bg-surface px-3 py-1.5 rounded-md border border-border">
          Tithe: {formatCurrency(totalTithe)}
        </span>
        <span className="text-xs font-medium text-muted-foreground bg-surface px-3 py-1.5 rounded-md border border-border">
          Offering: {formatCurrency(totalOffering)}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none">
          <option>All</option>
          <option>Tithe</option>
          <option>Offering</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none">
          <option>All</option>
          <option>Success</option>
          <option>Failed</option>
          <option>Pending</option>
        </select>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none" />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:outline-none" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
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
              <tr key={tx.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted-foreground text-xs">{formatDateTime(tx.date)}</td>
                <td className="px-4 py-3 font-medium text-primary">{tx.member}</td>
                <td className="px-4 py-3 text-muted-foreground">{tx.phone}</td>
                <td className="px-4 py-3">{typeBadge(tx.type)}</td>
                <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(tx.amount)}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.receipt || 'Pending'}</td>
                <td className="px-4 py-3">{statusBadge(tx.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium text-primary border border-border rounded-md hover:bg-muted disabled:opacity-50">Previous</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1.5 text-xs font-medium rounded-md ${page === i + 1 ? 'bg-primary text-primary-foreground' : 'text-primary border border-border hover:bg-muted'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-medium text-primary border border-border rounded-md hover:bg-muted disabled:opacity-50">Next</button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTransactions;
