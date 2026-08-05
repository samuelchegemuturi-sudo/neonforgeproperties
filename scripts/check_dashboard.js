import { createClient } from "@supabase/supabase-js";
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await s.from("platform_settings").select("*");
  console.log("Settings:", JSON.stringify(data, null, 2));
}
check();
