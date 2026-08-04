import { createClient } from "@supabase/supabase-js";
const sAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await sAdmin.from('platform_settings')
    .update({ value: '<REDACTED>' })
    .eq('key', 'brevo_api_key');
  console.log("Updated Brevo Key:", data, error);
}
run();
