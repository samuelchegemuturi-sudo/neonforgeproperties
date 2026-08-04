import { createClient } from "@supabase/supabase-js";
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: companies } = await s.from('companies').select('id').eq('name', 'rdada');
  if (!companies || companies.length === 0) return console.log('no company');
  const companyId = companies[0].id;

  const { data: properties } = await s.from('properties').select('id, company_id').eq('company_id', companyId);
  if (!properties || properties.length === 0) return console.log('no properties');
  
  const property = properties[0];

  const { data: profiles } = await s.from('profiles').select('id, email, company_id').eq('company_id', companyId);
  const user = profiles[0];

  console.log("Checking data:");
  console.log("Company ID:", companyId);
  console.log("Property Company ID:", property.company_id);
  console.log("User Company ID:", user.company_id);

  // Evaluate the conditions manually:
  const { data: ur } = await s.from('user_roles').select('role_id').eq('user_id', user.id);
  console.log("User role ID:", ur[0]?.role_id);
  
  if (ur[0]) {
    const { data: rp } = await s.from('role_permissions').select('*').eq('role_id', ur[0].role_id).eq('permission_key', 'unit.edit');
    console.log("Has unit.edit mapping:", rp.length > 0);
  }
}
run();
