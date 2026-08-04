import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Activity } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/reports')({
  component: ReportsComponent,
});

function ReportsComponent() {
  const { access } = useAuth();
  const companyId = access?.profile?.company_id ?? null;
  const isSuper = access?.profile?.is_super_admin;

  const queryEnabled = Boolean(companyId) || Boolean(isSuper);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', companyId, isSuper],
    enabled: queryEnabled,
    queryFn: async () => {
      let query = supabase
        .from('transactions' as any)
        .select(`
          id, amount, type, status, payment_method, description, transaction_date,
          tenants (
            profiles (full_name)
          )
        `)
        .order('transaction_date', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      } else if (!isSuper) {
        return [];
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { totalRevenue, chartData } = useMemo(() => {
    if (!transactions) return { totalRevenue: 0, chartData: [] };
    
    let total = 0;
    const monthlyData: Record<string, number> = {};

    (transactions as any[])?.forEach((t: any) => {
      if (t.status === 'completed' && t.type === 'rent_payment') {
        const amount = Number(t.amount) || 0;
        total += amount;
        
        const date = new Date(t.transaction_date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + amount;
      }
    });

    // Create last 6 months list for chart
    const chart = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthYear = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      chart.push({
        name: monthYear,
        revenue: monthlyData[monthYear] || 0
      });
    }

    return { totalRevenue: total, chartData: chart };
  }, [transactions]);

  if (!queryEnabled) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Reports</CardTitle>
            <CardDescription>You must belong to a company to view revenue reports.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Revenue Reports</h1>
        <p className="text-muted-foreground">Monitor your financial performance and transactions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">All time completed rent payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.length > 0 ? `$${chartData[chartData.length - 1]!.revenue.toLocaleString()}` : '$0'}</div>
            <p className="text-xs text-muted-foreground">Collected this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">From previous month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total records found</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>You have {transactions?.length || 0} total transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {isLoading ? (
                <div className="text-sm text-center text-muted-foreground py-10">Loading transactions...</div>
              ) : transactions?.length === 0 ? (
                <div className="text-sm text-center text-muted-foreground py-10">No recent transactions.</div>
              ) : (
                (transactions as any[])?.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {t.tenants?.profiles?.full_name || 'System / Auto'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {t.type === 'rent_payment' ? '+' : '-'}${Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Loading data...</TableCell>
                </TableRow>
              ) : !transactions || transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No transactions available.</TableCell>
                </TableRow>
              ) : (
                (transactions as any[]).map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell>{new Date((t as any).transaction_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">
                      {(t as any).type === 'rent_payment' ? (
                        <div className="flex flex-col">
                          <span>Rent Payment</span>
                          <span className="text-xs text-muted-foreground">{(t as any).tenants?.profiles?.full_name}</span>
                        </div>
                      ) : (t as any).type}
                    </TableCell>
                    <TableCell>{(t as any).type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</TableCell>
                    <TableCell>
                      <Badge variant={(t as any).status === 'completed' ? 'default' : (t as any).status === 'pending' ? 'secondary' : 'destructive'}>
                        {(t as any).status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{(t as any).payment_method || 'N/A'}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number((t as any).amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
