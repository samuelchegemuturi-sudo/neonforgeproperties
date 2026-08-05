import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommissions } from '@/hooks/use-finance';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export const Route = createFileRoute('/_authenticated/commissions')({
  component: CommissionsComponent,
});

function CommissionsComponent() {
  const { data: commissions = [], isLoading } = useCommissions();
  const [search, setSearch] = useState('');

  const { access } = useAuth();
  const isClient = access?.roles?.some(r => r.slug === 'client_landlord');

  const filteredCommissions = commissions.filter(c => {
    const propertyName = c.transactions?.leases?.units?.properties?.name || '';
    return propertyName.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Commissions</h1>
        <p className="text-muted-foreground">Track property management commissions earned.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Commission Records</CardTitle>
            <CardDescription>Earnings based on successful rent collections and leases.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by property..." 
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Date Created</th>
                  <th className="p-3 font-medium">Property</th>
                  <th className="p-3 font-medium">Description</th>
                  <th className="p-3 font-medium text-right">Amount</th>
                  <th className="p-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">Loading commissions...</td>
                  </tr>
                ) : filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">No commission records found.</td>
                  </tr>
                ) : (
                  filteredCommissions.map(comm => (
                    <tr key={comm.id} className="hover:bg-muted/30">
                      <td className="p-3 whitespace-nowrap">{format(new Date(comm.created_at), 'dd MMM yyyy')}</td>
                      <td className="p-3 font-medium">{comm.transactions?.leases?.units?.properties?.name || 'N/A'}</td>
                      <td className="p-3 text-muted-foreground">{comm.description || '-'}</td>
                      <td className="p-3 text-right font-medium text-success">
                        + KSH {Number(isClient ? comm.owner_amount : comm.agency_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={comm.status === 'paid' ? 'default' : 'secondary'}>
                          {comm.status}
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
