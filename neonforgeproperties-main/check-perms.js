import { createClient } from "@supabase/supabase-js";
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: profiles } = await s.from('profiles').select('id, email, position, company_id').eq('email', 'rachaelkimani559@gmail.com');
  console.log('Profile:', profiles);
  if (profiles.length) {
    const { data: userRoles } = await s.from('user_roles').select('*').eq('user_id', profiles[0].id);
    console.log('User roles:', userRoles);
  }
}
run();
