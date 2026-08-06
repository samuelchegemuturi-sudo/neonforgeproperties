import { createClient } from "@supabase/supabase-js";

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await s
    .from('properties')
    .select(`
      id,
      name,
      status,
      verification_status
    `);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data length:", data.length);
    console.log("Data:", JSON.stringify(data, null, 2));
  }
}

run();
