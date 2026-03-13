import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { formatCurrency } from '../../utils/formatCurrency';
import { BarChart3, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

interface BreakdownItem {
  _id: string;       // 'tithe' | 'offering'
  totalAmount: number;
  count: number;
}

interface MonthlyItem {
  month: string;     // e.g. "2026-03"
  tithe: number;
  offering: number;
}

interface ReportData {
  totalCollected: number;
  breakdown: BreakdownItem[];
  monthly: MonthlyItem[];
  totalMembers: number;
  activeGivers: number;
}

// format "2026-03" → "Mar"
const formatMonth = (m: string) => {
  const [year, month] = m.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'short' });
};

const Reports = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const [reportRes, membersRes, transactionsRes] = await Promise.all([
        api.get('/admin/report'),
        api.get('/admin/members'),
        api.get('/admin/transactions'),
      ]);

      const breakdown: BreakdownItem[] = reportRes.data.breakdown ?? [];
      const allMembers = membersRes.data.members ?? [];
      const allTransactions = transactionsRes.data.transactions ?? [];

      // build monthly data from transactions
      const monthlyMap: Record<string, { tithe: number; offering: number }> = {};
      allTransactions
        .filter((tx: any) => tx.status === 'success')
        .forEach((tx: any) => {
          const key = tx.createdAt.slice(0, 7); // "2026-03"
          if (!monthlyMap[key]) monthlyMap[key] = { tithe: 0, offering: 0 };
          if (tx.type === 'tithe') monthlyMap[key].tithe += tx.amount;
          else monthlyMap[key].offering += tx.amount;
        });

      const monthly: MonthlyItem[] = Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6) // last 6 months
        .map(([month, values]) => ({ month, ...values }));

      // count unique givers
      const giverIds = new Set(
        allTransactions
          .filter((tx: any) => tx.status === 'success')
          .map((tx: any) => tx.user?._id ?? tx.user)
      );

      setReport({
        totalCollected: reportRes.data.totalCollected ?? 0,
        breakdown,
        monthly,
        totalMembers: allMembers.length,
        activeGivers: giverIds.size,
      });

    } catch (err: any) {
      toast({
        title: 'Failed to load reports',
        description: err?.response?.data?.message ?? 'Could not fetch report data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!report) return <AdminLayout><p className="text-muted-foreground">No data available.</p></AdminLayout>;

  const titheData    = report.breakdown.find(b => b._id === 'tithe');
  const offeringData = report.breakdown.find(b => b._id === 'offering');
  const monthlyAvg   = report.monthly.length > 0
    ? report.monthly.reduce((s, m) => s + m.tithe + m.offering, 0) / report.monthly.length
    : 0;
  const maxAmount = Math.max(...report.monthly.map(d => d.tithe + d.offering), 1);

  return (
    <AdminLayout>
      <h1 className="font-serif text-2xl font-bold text-primary mb-8">Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="h-5 w-5 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">Total Collected</span>
          </div>
          <p className="text-xl font-bold text-accent">{formatCurrency(report.totalCollected)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Monthly Average</span>
          </div>
          <p className="text-xl font-bold text-primary">{formatCurrency(monthlyAvg)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Active Givers</span>
          </div>
          <p className="text-xl font-bold text-primary">{report.activeGivers}</p>
          <p className="text-xs text-muted-foreground mt-1">of {report.totalMembers} members</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Transactions</span>
          </div>
          <p className="text-xl font-bold text-primary">
            {(titheData?.count ?? 0) + (offeringData?.count ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">successful payments</p>
        </div>
      </div>

      {/* Tithe vs Offering breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Tithe Collected</p>
          <p className="text-2xl font-bold text-accent">{formatCurrency(titheData?.totalAmount ?? 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">{titheData?.count ?? 0} transactions</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Offering Collected</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(offeringData?.totalAmount ?? 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">{offeringData?.count ?? 0} transactions</p>
        </div>
      </div>

      {/* Bar Chart + Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold text-primary">Monthly Collections</h2>
        </div>

        {report.monthly.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No monthly data yet.</p>
        ) : (
          <>
            {/* Legend */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-accent" />
                <span className="text-xs text-muted-foreground">Tithe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-xs text-muted-foreground">Offering</span>
              </div>
            </div>

            {/* Bars */}
            <div className="flex items-end gap-4 h-48 mb-8">
              {report.monthly.map(d => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end h-40 gap-0.5">
                    <div
                      className="w-full bg-accent rounded-t-sm transition-all"
                      style={{ height: `${(d.tithe / maxAmount) * 100}%` }}
                      title={`Tithe: ${formatCurrency(d.tithe)}`}
                    />
                    <div
                      className="w-full bg-primary rounded-b-sm transition-all"
                      style={{ height: `${(d.offering / maxAmount) * 100}%` }}
                      title={`Offering: ${formatCurrency(d.offering)}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{formatMonth(d.month)}</span>
                </div>
              ))}
            </div>

            {/* Monthly Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Month</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Tithe</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Offering</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {report.monthly.map(d => (
                    <tr key={d.month} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5 font-medium text-primary">{formatMonth(d.month)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatCurrency(d.tithe)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatCurrency(d.offering)}</td>
                      <td className="px-4 py-2.5 font-semibold text-primary">{formatCurrency(d.tithe + d.offering)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Reports;