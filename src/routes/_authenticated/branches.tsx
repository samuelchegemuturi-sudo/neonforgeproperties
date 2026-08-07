import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/branches')({
  component: BranchesComponent,
});

function BranchesComponent() {
  const { access, can } = useAuth();
  const companyId = access?.profile?.company_id;
  const queryClient = useQueryClient();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches' as any)
        .select('*')
        .eq('company_id', companyId)
        .order('name');
      if (error) throw error;
      return data as unknown as { id: string; name: string }[];
    }
  });

  const createBranch = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('branches' as any)
        .insert({ company_id: companyId, name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Branch created');
      setNewBranchName('');
      setIsCreating(false);
      void queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const deleteBranch = useMutation({
    mutationFn: async (id: string) => {
      // First update properties to remove branch_id
      await supabase.from('properties').update({ branch_id: null }).eq('branch_id', id);
      const { error } = await supabase.from('branches' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Branch deleted');
      void queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  if (!companyId) return null;

  const filteredBranches = branches?.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branches / Regions</h1>
          <p className="text-muted-foreground">Manage your property portfolios, regions, or branches.</p>
        </div>
        {can('property.manage') && (
          <Button onClick={() => setIsCreating(!isCreating)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Branch
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardContent className="pt-6 flex gap-4">
            <Input 
              placeholder="e.g. Nairobi Region" 
              value={newBranchName} 
              onChange={e => setNewBranchName(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && createBranch.mutate(newBranchName)}
            />
            <Button onClick={() => createBranch.mutate(newBranchName)} disabled={!newBranchName.trim() || createBranch.isPending}>
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Existing Branches</CardTitle>
            <CardDescription>Group properties to filter reports and dashboard metrics.</CardDescription>
          </div>
          <div className="w-64">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>
              ) : filteredBranches.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No branches found.</TableCell></TableRow>
              ) : (
                filteredBranches.map(branch => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell className="text-right">
                      {can('property.manage') && (
                        <Button variant="ghost" className="text-destructive hover:text-destructive" size="sm" onClick={() => {
                          if (confirm('Are you sure? Any properties assigned to this branch will become unassigned.')) {
                            deleteBranch.mutate(branch.id);
                          }
                        }}>
                          Delete
                        </Button>
                      )}
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
