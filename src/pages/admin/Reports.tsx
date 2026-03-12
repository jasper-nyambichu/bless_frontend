import { AdminLayout } from '../../components/layout/AdminLayout';
import { formatCurrency } from '../../utils/formatCurrency';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

const monthlyData = [
  { month: 'Jul', tithe: 120000, offering: 45000 },
  { month: 'Aug', tithe: 135000, offering: 52000 },
  { month: 'Sep', tithe: 128000, offering: 48000 },
  { month: 'Oct', tithe: 142000, offering: 55000 },
  { month: 'Nov', tithe: 150000, offering: 60000 },
  { month: 'Dec', tithe: 165000, offering: 68000 },
];

const maxAmount = Math.max(...monthlyData.map(d => d.tithe + d.offering));

const Reports = () => {
  return (
    <AdminLayout>
      <h1 className="font-serif text-2xl font-bold text-primary mb-8">Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">Monthly Average</span>
          </div>
          <p className="text-xl font-bold text-primary">{formatCurrency(186667)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Active Givers</span>
          </div>
          <p className="text-xl font-bold text-primary">187</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="h-5 w-5 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">6-Month Total</span>
          </div>
          <p className="text-xl font-bold text-accent">{formatCurrency(1168000)}</p>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold text-primary">Monthly Collections</h2>
        </div>

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
        <div className="flex items-end gap-4 h-48">
          {monthlyData.map(d => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '160px' }}>
                <div className="w-full flex flex-col justify-end h-full gap-0.5">
                  <div
                    className="w-full bg-accent rounded-t-sm"
                    style={{ height: `${(d.tithe / maxAmount) * 100}%` }}
                    title={`Tithe: ${formatCurrency(d.tithe)}`}
                  />
                  <div
                    className="w-full bg-primary rounded-b-sm"
                    style={{ height: `${(d.offering / maxAmount) * 100}%` }}
                    title={`Offering: ${formatCurrency(d.offering)}`}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground mt-1">{d.month}</span>
            </div>
          ))}
        </div>

        {/* Monthly Breakdown Table */}
        <div className="mt-8 overflow-x-auto">
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
              {monthlyData.map(d => (
                <tr key={d.month} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-medium text-primary">{d.month}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatCurrency(d.tithe)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatCurrency(d.offering)}</td>
                  <td className="px-4 py-2.5 font-semibold text-primary">{formatCurrency(d.tithe + d.offering)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
