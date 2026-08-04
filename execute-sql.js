import { createClient } from "@supabase/supabase-js";
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const query = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'licences';
  `;
  const { data, error } = await s.functions.invoke('run_sql', {
    body: { query }
  });
  console.log("data:", data, "error:", error);
}
run();
