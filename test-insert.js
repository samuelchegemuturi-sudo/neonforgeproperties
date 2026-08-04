import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  // Login as admin@neonforgecreation.co.ke
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@neonforgecreation.co.ke',
    password: 'password123' // assuming default or wait, I don't know the password
  });
  
  if (authError) {
    console.log("Auth error:", authError.message);
    return;
  }
  
  // Try inserting
  const { data, error } = await supabase.from('transactions').insert({
    amount: 100,
    type: 'payment',
    status: 'completed',
    transaction_date: new Date().toISOString(),
    description: 'Test',
    company_id: authData.user.user_metadata?.company_id || 'some-uuid'
  });
  
  console.log("Insert error:", error?.message || "Success");
}

test();
