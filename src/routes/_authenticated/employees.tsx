import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Plus, UserCog, Copy, CheckCircle2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { companyCreateEmployee, adminCreateOfficer, adminResetTemporaryPassword, sendEmailFn, adminDeleteUser } from '@/lib/platform.functions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const Route = createFileRoute('/_authenticated/employees')({
  head: () => ({
    meta: [
      { title: "Employees — Neon Forge Properties" },
      { name: "description", content: "Manage your company's employees and staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmployeesPage,
});

type EmployeeRow = {
  id: string;
  full_name: string;
  email: string;
  position: string;
  status: string;
  role_name?: string;
};

function EmployeesPage() {
  const { access, can } = useAuth();
  const companyId = access?.profile?.company_id ?? null;
  const isSuper = access?.profile?.is_super_admin;
  const queryClient = useQueryClient();
  const editable = can('employees.create') || isSuper;
  
  const queryEnabled = Boolean(companyId) || Boolean(isSuper);

  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; temporaryPassword: string } | null>(null);

  const { data: roles } = useQuery({
    queryKey: ['roles', companyId, isSuper],
    enabled: queryEnabled,
    queryFn: async () => {
      let query = supabase.from('roles').select('id, name, slug').order('name');
      if (companyId) {
        query = query.eq('company_id', companyId);
      } else {
        query = query.is('company_id', null).in('slug', ['platform_verification_officer', 'platform_support_officer']);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', companyId, isSuper],
    enabled: queryEnabled,
    queryFn: async () => {
      let profilesQuery = supabase.from('profiles').select('id, full_name, email, position, status, is_super_admin').order('full_name');
      if (companyId) {
        profilesQuery = profilesQuery.eq('company_id', companyId);
      } else {
        profilesQuery = profilesQuery.is('company_id', null);
      }

      const { data: profiles, error } = await profilesQuery;
      if (error) throw error;

      // Fetch their roles
      let rolesQuery = supabase.from('user_roles').select('user_id, role_id, roles(name)');
      if (companyId) {
        rolesQuery = rolesQuery.eq('company_id', companyId);
      } else {
        rolesQuery = rolesQuery.is('company_id', null);
      }
      
      const { data: userRoles, error: rolesError } = await rolesQuery;
      if (rolesError) throw rolesError;

      const rolesMap = new Map(userRoles.map((ur) => [ur.user_id, (ur.roles as any)?.name]));

      return profiles
        .filter(p => p.position !== 'Landlord' && p.position !== 'Tenant' && p.is_super_admin !== true)
        .map((p) => ({
          ...p,
          role_name: rolesMap.get(p.id) || 'No Role',
        })) as EmployeeRow[];
    },
  });

  const sendEmail = useServerFn(sendEmailFn);
  const createFn = useServerFn(companyCreateEmployee);
  const createOfficerFn = useServerFn(adminCreateOfficer);
  const createEmployee = useMutation({
    mutationFn: (input: { full_name: string; email: string; position: string; role_id: string; roleSlug?: string }) => {
      if (!companyId && isSuper && input.roleSlug) {
        return createOfficerFn({ data: { email: input.email, full_name: input.full_name, roleSlug: input.roleSlug }});
      }
      return createFn({ data: input });
    },
    onSuccess: async (result, variables) => {
      setCredentials({ email: result.email, temporaryPassword: result.temporaryPassword });
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['employees', companyId, isSuper] });
      toast.success("Employee created successfully");

      try {
        const emailRes = await sendEmail({
          data: {
            to: result.email,
            subject: 'Welcome to Neon Forge Properties - Your Employee Account',
            htmlContent: `
              <h1>Welcome to Neon Forge Properties!</h1>
              <p>Hello ${variables.full_name},</p>
              <p>You have been added as an employee. You can log in using this email address and the following temporary password:</p>
              <p><strong>${result.temporaryPassword}</strong></p>
              <p>Please log in and change your password immediately.</p>
            `
          }
        });
        if (emailRes.success) {
          toast.success("Welcome email sent to " + result.email);
        } else {
          toast.error("Welcome email failed: " + emailRes.error);
        }
      } catch (err: any) {
        toast.error("Welcome email fetch failed: " + err.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetPasswordFn = useServerFn(adminResetTemporaryPassword);
  const resetPassword = useMutation({
    mutationFn: (email: string) => resetPasswordFn({ data: { email } }),
    onSuccess: async (result, email) => {
      setCredentials({ email, temporaryPassword: result.temporaryPassword });
      toast.success("Temporary password generated");
      
      try {
        const emailRes = await sendEmail({
          data: {
            to: email,
            subject: 'Your Password Has Been Reset',
            htmlContent: `
              <h1>Password Reset</h1>
              <p>Your temporary password is: <strong>${result.temporaryPassword}</strong></p>
              <p>Please log in and change your password immediately.</p>
            `
          }
        });
        if (emailRes.success) {
          toast.success("Email sent to " + email);
        } else {
          toast.error("Email failed: " + emailRes.error);
        }
      } catch (err: any) {
        toast.error("Email fetch failed: " + err.message);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteUserFn = useServerFn(adminDeleteUser);
  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      await deleteUserFn({ data: { targetUserId: id } });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees', companyId, isSuper] });
      toast.success("Employee deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!companyId && !isSuper) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>You must belong to a company to manage employees.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage your team members and assign roles.</p>
        </div>
        
        {editable && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
                <DialogDescription>
                  Create a new employee account. They will be assigned a temporary password.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const selectedRole = roles?.find(r => r.id === fd.get("role_id"));
                  createEmployee.mutate({
                    full_name: fd.get("full_name") as string,
                    email: fd.get("email") as string,
                    position: fd.get("position") as string,
                    role_id: fd.get("role_id") as string,
                    ...(selectedRole?.slug ? { roleSlug: selectedRole.slug } : {}),
                  });
                }}
                className="grid gap-4 py-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" name="full_name" required placeholder="John Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">Position / Job Title</Label>
                  <Input id="position" name="position" required placeholder="Property Manager" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role_id">Role</Label>
                  <Select name="role_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={createEmployee.isPending}>
                    {createEmployee.isPending && <UserCog className="mr-2 size-4 animate-spin" />}
                    Create Employee
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={!!credentials} onOpenChange={(o) => !o && setCredentials(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-500" /> Employee Created
            </DialogTitle>
            <DialogDescription>
              Please copy these credentials and send them to the employee securely. They will be prompted to change their password on first login.
            </DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <Label>Login Email</Label>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  {credentials.email}
                </code>
              </div>
              <div className="grid gap-1.5">
                <Label>Temporary Password</Label>
                <div className="flex items-center gap-2">
                  <code className="relative flex-1 rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                    {credentials.temporaryPassword}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(credentials.temporaryPassword);
                      toast.success("Password copied to clipboard");
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCredentials(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : !employees?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="pl-6 font-medium">{emp.full_name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.email || '—'}</TableCell>
                    <TableCell>{emp.position || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{emp.role_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {can("support.reset_password") && emp.email && (
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Reset Password"
                            onClick={() => {
                              if (confirm("Generate a new temporary password for this employee?")) {
                                resetPassword.mutate(emp.email);
                              }
                            }}
                            disabled={resetPassword.isPending}
                          >
                            <UserCog className="size-4 text-blue-500" />
                          </Button>
                        )}
                        {can("employees.delete") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            title="Delete Employee"
                            onClick={() => {
                              if (confirm("Are you sure you want to permanently delete this employee?")) {
                                deleteEmployee.mutate(emp.id);
                              }
                            }}
                            disabled={deleteEmployee.isPending}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
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
