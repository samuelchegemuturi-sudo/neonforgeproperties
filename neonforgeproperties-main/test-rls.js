import { createClient } from "@supabase/supabase-js";
const sAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: companies } = await sAdmin.from('companies').select('id').eq('name', 'rdada');
  const companyId = companies[0].id;
  const { data: profiles } = await sAdmin.from('profiles').select('id, email').eq('company_id', companyId);
  const user = profiles[0];

  const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  await client.auth.signInWithPassword({ email: user.email, password: 'TestPassword123!' });

  const { data, error } = await client.rpc('has_permission', { _user_id: user.id, _key: 'unit.edit' });
  console.log("has_permission:", data, error);
}
run();
