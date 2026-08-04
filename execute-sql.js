import { createClient } from "@supabase/supabase-js";
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const query = `
    SELECT cls.relname, pol.polname, pg_get_expr(pol.polqual, pol.polrelid) as polqual
    FROM pg_policy pol 
    JOIN pg_class cls ON pol.polrelid = cls.oid 
    WHERE cls.relname IN ('units', 'tenants', 'companies');
  `;
  const { data, error } = await s.functions.invoke('run_sql', {
    body: { query }
  });
  console.log("data:", data, "error:", error);
}
run();
