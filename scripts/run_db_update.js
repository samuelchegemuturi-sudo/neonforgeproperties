import { createClient } from "@supabase/supabase-js";

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const query = `
    ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS enabled_modules JSONB DEFAULT '[]'::jsonb;
    NOTIFY pgrst, 'reload schema';
  `;
  const { data, error } = await s.functions.invoke('run_sql', {
    body: { query }
  });
  console.log("data:", data, "error:", error);
}
run();
