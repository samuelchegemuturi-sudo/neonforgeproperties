import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

async function fix() {
  const env = fs.readFileSync('.env', 'utf-8');
  const urlLine = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_URL='));
  const keyLine = env.split('\n').find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='));
  
  if (!urlLine || !keyLine) throw new Error('Missing env vars');
  
  const url = urlLine.split('=')[1].replace(/["'\r]/g, '').trim();
  const key = keyLine.split('=')[1].replace(/["'\r]/g, '').trim();

  const supabase = createClient(url, key);
  
  // Find all landlord roles
  const { data: landlordRoles } = await supabase.from('roles').select('id').eq('slug', 'landlord');
  
  if (landlordRoles) {
    for (const role of landlordRoles) {
      console.log('Deleting verification from', role.id);
      await supabase.from('role_permissions').delete().eq('role_id', role.id).like('permission_key', 'verification.%');
    }
  }
  console.log('Done!');
}

fix().catch(console.error);
