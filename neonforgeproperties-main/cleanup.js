import { createClient } from "@supabase/supabase-js";
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: profiles } = await s.from('profiles').select('id');
  const { data: users } = await s.auth.admin.listUsers();
  const userIds = new Set(users.users.map(u => u.id));
  let count = 0;
  for (const p of profiles) {
    if (!userIds.has(p.id)) {
      console.log('Deleting orphaned profile:', p.id);
      await s.from('profiles').delete().eq('id', p.id);
      count++;
    }
  }
  console.log(`Deleted ${count} orphaned profiles.`);
}
run();
