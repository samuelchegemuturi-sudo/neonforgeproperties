import { createClient } from "@supabase/supabase-js";
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const query = `
    DROP POLICY IF EXISTS tenants_self_read ON public.tenants;
    CREATE POLICY tenants_self_read ON public.tenants FOR SELECT TO authenticated USING (
      email = auth.jwt() ->> 'email'
    );

    DROP POLICY IF EXISTS leases_self_read ON public.leases;
    CREATE POLICY leases_self_read ON public.leases FOR SELECT TO authenticated USING (
      tenant_id IN (SELECT id FROM public.tenants WHERE email = auth.jwt() ->> 'email')
    );
  `;
  const { data, error } = await s.functions.invoke('run_sql', {
    body: { query }
  });
  console.log("data:", data, "error:", error);
}
run();
