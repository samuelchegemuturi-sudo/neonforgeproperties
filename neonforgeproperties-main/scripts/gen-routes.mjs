import fs from 'fs';
import path from 'path';

const routes = [
  'analytics', 'activity', 'listings', 'map', 'employees',
  'finance', 'transactions', 'commissions', 'disbursements',
  'refunds', 'reports', 'support', 'maintenance', 'audit',
  'payment-gateways', 'sms', 'email', 'storage', 'integrations', 'backup'
];

const template = (name) => `import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_authenticated/${name}')({
  component: ${name.charAt(0).toUpperCase() + name.slice(1).replace(/-./g, x=>x[1].toUpperCase())}Component,
});

function ${name.charAt(0).toUpperCase() + name.slice(1).replace(/-./g, x=>x[1].toUpperCase())}Component() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>${name.charAt(0).toUpperCase() + name.slice(1).replace(/-./g, x=>" " + x[1].toUpperCase())}</CardTitle>
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
`;

routes.forEach(route => {
  const filePath = path.join(process.cwd(), 'src', 'routes', '_authenticated', `${route}.tsx`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template(route));
    console.log(`Created ${route}.tsx`);
  }
});
