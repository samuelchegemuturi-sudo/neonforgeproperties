import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function resetPassword() {
  const email = "admin@neonforgeproperties.com";
  const newPassword = "admin@neonforgecreation.co.ke";

  // First get the user by email
  const { data: usersData, error: getUserError } = await supabase.auth.admin.listUsers();
  
  if (getUserError) {
    console.error("Error fetching users:", getUserError.message);
    return;
  }

  const user = usersData.users.find(u => u.email === email);
  
  if (!user) {
    console.error(`User with email ${email} not found!`);
    return;
  }

  // Update the user's password
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true
  });

  if (error) {
    console.error("Failed to update password:", error.message);
  } else {
    console.log(`Successfully reset password for ${email}.`);
    console.log(`New password: ${newPassword}`);
  }
}

resetPassword();
