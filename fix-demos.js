import { createClient } from "@supabase/supabase-js";
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: companies } = await s.from('companies').select('id, name, activation_status').eq('is_demo', true).eq('activation_status', 'active');
  let count = 0;
  for (const c of companies) {
    // Check if they have a licence
    const { data: licence } = await s.from('licences').select('code').eq('company_id', c.id).maybeSingle();
    if (!licence) {
      console.log('Fixing demo company without licence:', c.name);
      await s.from('companies').update({ activation_status: 'pending' }).eq('id', c.id);
      count++;
    }
  }
  console.log(`Fixed ${count} demo companies.`);
}
run();
