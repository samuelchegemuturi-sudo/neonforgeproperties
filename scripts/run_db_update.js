import { createClient } from "@supabase/supabase-js";

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const query = `
    ALTER TABLE public.maintenance_requests ADD COLUMN IF NOT EXISTS cost numeric(12,2) DEFAULT 0.00;
    ALTER TABLE public.maintenance_requests ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.profiles(id);
    
    CREATE TABLE IF NOT EXISTS public.branches (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id uuid REFERENCES public.companies(id) NOT NULL,
      name text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
    
    DO $$ BEGIN
      CREATE POLICY branches_read ON public.branches FOR SELECT TO authenticated USING (company_id = public.current_company_id() OR public.is_super_admin(auth.uid()));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE POLICY branches_all ON public.branches FOR ALL TO authenticated USING (company_id = public.current_company_id() OR public.is_super_admin(auth.uid()));
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id);
  `;
  const { data, error } = await s.functions.invoke('run_sql', {
    body: { query }
  });
  console.log("data:", data, "error:", error);
}
run();
