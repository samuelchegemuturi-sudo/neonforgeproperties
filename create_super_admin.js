import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const email = 'admin@neonforgecreation.co.ke';
  const password = 'AdminPassword123!';
  
  // Create user
  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // auto confirm
  });

  if (userError) {
    console.error("Error creating user:", userError);
    process.exit(1);
  }

  console.log("User created successfully:", user.user.id);
  
  // Make them super admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      is_super_admin: true,
      status: 'active',
      full_name: 'Platform Administrator'
    })
    .eq('id', user.user.id);
    
  if (profileError) {
    console.error("Error updating profile:", profileError);
    process.exit(1);
  }
  
  console.log(`Successfully created Super Admin! Email: ${email} Password: ${password}`);
}

main();
