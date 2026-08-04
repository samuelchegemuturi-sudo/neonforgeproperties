import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listUsers() {
  const { data: usersData, error: getUserError } = await supabase.auth.admin.listUsers();
  
  if (getUserError) {
    console.error("Error fetching users:", getUserError.message);
    return;
  }

  console.log("Auth Users:");
  usersData.users.forEach(u => console.log(u.email));
}

listUsers();
