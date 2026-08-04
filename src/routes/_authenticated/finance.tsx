import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions, useInvoices, useCommissions } from '@/hooks/use-finance';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, ArrowDownUp, Percent } from 'lucide-react';
import { format, subMonths } from 'date-fns';

export const Route = createFileRoute('/_authenticated/finance')({
  component: FinanceComponent,
});

function FinanceComponent() {
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: invoices = [] } = useInvoices();
  const { data: commissions = [] } = useCommissions();

  // Basic KPI calculations
  const totalCollected = transactions
    .filter(t => t.status === 'completed' && t.type === 'payment')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const outstandingArrears = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'void')
    .reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

  const totalCommissions = commissions
    .filter(c => c.status === 'paid')
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  // Group transactions by month for the chart
  const last6Months = Array.from({ length: 6 }).map((_, i) => format(subMonths(new Date(), i), 'MMM yyyy')).reverse();
  
  const chartData = last6Months.map(month => {
    const monthTx = transactions.filter(t => 
      t.status === 'completed' && 
      t.type === 'payment' &&
      format(new Date(t.transaction_date), 'MMM yyyy') === month
    );
    return {
      name: month,
      revenue: monthTx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
    };
  });

  if (txLoading) {
    return <div className="p-6">Loading finance data...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance Overview</h1>
        <p className="text-muted-foreground">Monitor revenue, outstanding arrears, and commissions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSH {totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Total successful payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Arrears</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">KSH {outstandingArrears.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Unpaid invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Earned</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">KSH {totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Paid agency commissions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue History</CardTitle>
          <CardDescription>Payment collection over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `KSH ${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  formatter={(value: number) => [`KSH ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

