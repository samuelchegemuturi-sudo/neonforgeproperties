import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions, useRecordTransaction } from '@/hooks/use-finance';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Search, Plus } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/transactions')({
  component: TransactionsComponent,
});

function TransactionsComponent() {
  const { data: transactions = [], isLoading } = useTransactions();
  const recordTransaction = useRecordTransaction();
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.tenant?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.property?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">View and manage all financial transactions.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>A list of recent payments, refunds, and charges.</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Record a manual payment to send a receipt to the tenant.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  recordTransaction.mutate({
                    transaction: {
                      amount: Number(fd.get("amount")),
                      description: fd.get("description") as string,
                      type: "payment",
                      status: "completed",
                      transaction_date: new Date().toISOString(),
                    },
                    tenantInfo: {
                      email: fd.get("email") as string,
                      name: fd.get("name") as string,
                    }
                  });
                }} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Tenant Name</Label>
                    <Input name="name" required placeholder="John Doe" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tenant Email (for receipt)</Label>
                    <Input name="email" type="email" required placeholder="john@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Amount (KSH)</Label>
                    <Input name="amount" type="number" required placeholder="10000" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input name="description" required placeholder="Rent Payment for August" />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={recordTransaction.isPending}>
                      {recordTransaction.isPending ? "Recording..." : "Save Transaction"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Tenant / Property</th>
                  <th className="p-3 font-medium">Description</th>
                  <th className="p-3 font-medium text-right">Amount</th>
                  <th className="p-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">Loading transactions...</td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">No transactions found.</td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-muted/30">
                      <td className="p-3 whitespace-nowrap">{format(new Date(tx.transaction_date), 'dd MMM yyyy')}</td>
                      <td className="p-3 capitalize">{tx.type.replace('_', ' ')}</td>
                      <td className="p-3">
                        <div className="font-medium">{tx.tenant?.full_name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{tx.property?.name}</div>
                      </td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate" title={tx.description || ''}>
                        {tx.description || '-'}
                      </td>
                      <td className="p-3 text-right font-medium">
                        KSH {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={tx.status === 'completed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
