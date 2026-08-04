import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search } from 'lucide-react';
import { format } from "date-fns";
import { useServerFn } from "@tanstack/react-start";
import { sendEmailFn } from "@/lib/platform.functions";
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/support')({
  component: SupportComponent,
});

function SupportComponent() {
  const { access, user } = useAuth();
  const sendEmail = useServerFn(sendEmailFn);
  const companyId = access?.profile?.company_id ?? null;
  const isSuper = access?.profile?.is_super_admin;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('normal');

  const queryEnabled = Boolean(companyId) || Boolean(isSuper);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support_tickets', companyId, isSuper],
    enabled: queryEnabled,
    queryFn: async () => {
      let query = supabase.from('support_tickets').select('id, subject, status, priority, created_at, body').order('created_at', { ascending: false });
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

  const createTicket = useMutation({
    mutationFn: async () => {
      if (!companyId && !isSuper) throw new Error("No company associated.");
      const { error } = await supabase.from('support_tickets').insert({
        company_id: companyId,
        subject: subject,
        body: body,
        priority: priority,
        created_by: access?.profile?.id ?? null
      });
      if (error) throw error;
      return { subject, body };
    },
    onSuccess: async () => {
      toast.success("Support ticket created successfully");
      
      await sendEmail({
        data: {
          to: 'support@neonforgeproperties.com',
          subject: `New Support Ticket from ${access?.company?.name || 'Company'}`,
          htmlContent: `
            <h1>New Support Ticket</h1>
            <p><strong>Company:</strong> ${access?.company?.name || 'Unknown'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Priority:</strong> <span style="text-transform: capitalize;">${priority}</span></p>
            <p><strong>Details:</strong></p>
            <p>${body}</p>
          `
        }
      });

      setOpen(false);
      setSubject('');
      setBody('');
      setPriority('normal');
      void queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      void queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
    }
  });

  const filteredTickets = tickets?.filter(t => t.subject.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];

  if (!queryEnabled) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>You must belong to a company to view support tickets.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Manage and track your support requests.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>Submit a new issue to our support team.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of the issue" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Details</label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Please provide as much detail as possible..." className="min-h-[100px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => createTicket.mutate()} disabled={createTicket.isPending || !subject.trim()}>
                {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="flex-1">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tickets..."
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
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Loading tickets...</TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No tickets found.</TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{ticket.subject}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">{ticket.body}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ticket.status === 'closed' ? 'secondary' : ticket.status === 'in_progress' ? 'default' : 'outline'}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ticket.priority === 'urgent' || ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {isSuper && ticket.status !== 'closed' && (
                        <Button variant="ghost" size="sm" onClick={() => updateStatus.mutate({ id: ticket.id, status: 'closed' })}>
                          Close
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
    </div>
  );
}
