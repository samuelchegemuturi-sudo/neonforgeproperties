import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useServerFn } from "@tanstack/react-start";
import { sendEmailFn } from "@/lib/platform.functions";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, Wrench, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/maintenance')({
  component: MaintenanceComponent,
});

function MaintenanceComponent() {
  const { access, user } = useAuth();
  const sendEmail = useServerFn(sendEmailFn);
  const companyId = access?.profile?.company_id ?? null;
  const isSuper = access?.profile?.is_super_admin;
  const queryClient = useQueryClient();
  
  const [open, setOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolvingReq, setResolvingReq] = useState<any>(null);
  const [repairCost, setRepairCost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [propertyId, setPropertyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const queryEnabled = Boolean(companyId) || Boolean(isSuper);

  const { data: properties } = useQuery({
    queryKey: ['properties', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const { data, error } = await supabase.from('properties').select('id, name').eq('company_id', companyId!);
      if (error) throw error;
      return data;
    }
  });

  const { data: employees } = useQuery({
    queryKey: ['employees', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, email').eq('company_id', companyId!);
      if (error) throw error;
      return data;
    }
  });

  const { data: units } = useQuery({
    queryKey: ['units', propertyId],
    enabled: Boolean(propertyId),
    queryFn: async () => {
      const { data, error } = await supabase.from('units').select('id, unit_number').eq('property_id', propertyId);
      if (error) throw error;
      return data;
    }
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ['maintenance_requests', companyId, isSuper],
    enabled: queryEnabled,
    queryFn: async () => {
      let query = supabase
        .from('maintenance_requests' as any)
        .select(`
          id, title, status, priority, created_at, cost,
          properties (name),
          units (unit_number),
          reported_by (email, full_name),
          assigned_to (id, email, full_name)
        `)
        .order('created_at', { ascending: false });
      
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

  const createRequest = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error("No company associated.");
      const { data, error } = await supabase.from('maintenance_requests' as any).insert({
        company_id: companyId,
        title,
        description,
        priority,
        property_id: propertyId || null,
        unit_id: unitId || null,
        assigned_to: assignedTo === 'unassigned' ? null : (assignedTo || null),
        reported_by: access?.profile?.id
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      toast.success("Maintenance request submitted");
      
      if (assignedTo) {
        const assignedEmployee = employees?.find(e => e.id === assignedTo);
        if (assignedEmployee?.email) {
          await sendEmail({
            data: {
              to: assignedEmployee.email,
              subject: 'New Maintenance Work Order Assigned',
              htmlContent: `
                <h1>New Work Order: ${title}</h1>
                <p>Hello ${assignedEmployee.full_name},</p>
                <p>A new maintenance request has been assigned to you.</p>
                <p><strong>Priority:</strong> <span style="text-transform: capitalize;">${priority}</span></p>
                <p><strong>Description:</strong> ${description}</p>
                <p>Please log in to the Neon Forge Properties platform to view and update the status.</p>
              `
            }
          });
        }
      }

      setOpen(false);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setPropertyId('');
      setUnitId('');
      setAssignedTo('');
      void queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, cost, reqInfo }: { id: string, status: string, cost?: number | undefined, reqInfo?: any }) => {
      const updateData: any = { status };
      if (cost !== undefined) updateData.cost = cost;
      
      const { error } = await supabase.from('maintenance_requests' as any).update(updateData).eq('id', id);
      if (error) throw error;
      return { id, status, reqInfo };
    },
    onSuccess: async ({ status, reqInfo }) => {
      toast.success("Status updated");
      void queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
      
      if (status === 'completed' && reqInfo?.reported_by?.email) {
        await sendEmail({
          data: {
            to: reqInfo.reported_by.email,
            subject: `Maintenance Request Resolved: ${reqInfo.title}`,
            htmlContent: `
              <h1>Issue Resolved</h1>
              <p>Hello ${reqInfo.reported_by.full_name},</p>
              <p>Your maintenance request <strong>"${reqInfo.title}"</strong> has been marked as <strong>Resolved</strong>.</p>
              <p>If you have any further issues, please don't hesitate to reach out.</p>
            `
          }
        });
      }
    }
  });

  const filteredRequests = (requests as any[])?.filter((r: any) => r.title.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];

  if (!queryEnabled) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance</CardTitle>
            <CardDescription>You must belong to a company to manage maintenance requests.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">Manage and track property work orders.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Work Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Work Order</DialogTitle>
              <DialogDescription>Submit a new maintenance request.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Leaking Faucet" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property</label>
                  <Select value={propertyId} onValueChange={setPropertyId}>
                    <SelectTrigger><SelectValue placeholder="Select Property" /></SelectTrigger>
                    <SelectContent>
                      {properties?.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit (Optional)</label>
                  <Select value={unitId} onValueChange={setUnitId} disabled={!propertyId}>
                    <SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger>
                    <SelectContent>
                      {units?.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.unit_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign To</label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {employees?.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details about the issue..." className="min-h-[100px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => createRequest.mutate()} disabled={createRequest.isPending || !title.trim()}>
                {createRequest.isPending ? "Submitting..." : "Submit Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="flex-1">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search work orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Cost (KES)</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Date Reported</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">Loading requests...</TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center flex flex-col items-center justify-center gap-2">
                    <Wrench className="h-8 w-8 text-muted-foreground" />
                    <p>No maintenance requests found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                (filteredRequests as any[]).map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.title}</TableCell>
                    <TableCell>
                      {req.properties?.name}
                      {req.units?.unit_number && ` - Unit ${req.units?.unit_number}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={req.status === 'completed' ? 'default' : req.status === 'pending' ? 'secondary' : 'default'}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={req.priority === 'high' ? 'destructive' : req.priority === 'medium' ? 'default' : 'secondary'}>
                        {req.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {req.cost ? Number(req.cost).toLocaleString() : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {req.assigned_to ? req.assigned_to.full_name || req.assigned_to.email : <span className="text-muted-foreground italic">Unassigned</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status !== 'completed' && (
                        <Button variant="outline" size="sm" onClick={() => {
                          setResolvingReq(req);
                          setRepairCost('');
                          setResolveOpen(true);
                        }}>
                          Mark Complete
                        </Button>
                      )}
                      {req.status === 'completed' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: req.id, status: 'pending', reqInfo: req })}>
                          Reopen
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-500" /> Resolve Work Order
            </DialogTitle>
            <DialogDescription>
              Marking this work order as complete will notify the reporter. You can also log any repair costs associated with this fix.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Repair Cost (Optional)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1500"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Log any expenses incurred during this repair for accounting.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (resolvingReq) {
                updateStatus.mutate({ 
                  id: resolvingReq.id, 
                  status: 'completed', 
                  cost: repairCost ? Number(repairCost) : undefined, 
                  reqInfo: resolvingReq 
                });
                setResolveOpen(false);
              }
            }} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? "Saving..." : "Mark Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
