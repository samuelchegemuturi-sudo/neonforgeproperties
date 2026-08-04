import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
  const { data, error } = await supabase.rpc('run_sql', {
    sql_query: `
      SELECT pol.polname, pol.polcmd, pol.polqual, pol.polwithcheck 
      FROM pg_policy pol 
      JOIN pg_class cls ON pol.polrelid = cls.oid 
      WHERE cls.relname = 'properties';
    `
  });

  if (error) {
    console.error("RPC Error (might not exist):", error.message);
  } else {
    console.log("Properties RLS Policies:");
    console.log(data);
  }
}
checkRLS();
