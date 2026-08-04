import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_authenticated/backup')({
  component: BackupComponent,
});

function BackupComponent() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Backup</CardTitle>
          <CardDescription>This feature is coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This module is currently under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
