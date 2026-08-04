const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://vfluyamqkkrodhjjjjiu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbHV5YW1xa2tyb2Roampqaml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTcxNDk3MCwiZXhwIjoyMTAxMjkwOTcwfQ.WA03Z1za1DKfQf7hrMAZN0iHoJnWJrxHTRkV-G3Rwxk');

const tmpl = [
  {slug:'landlord',prefix:['dashboard','property','unit','tenant','finance','maintenance','employees','roles','verification','listing','reports','settings','audit']},
  {slug:'property_manager',prefix:['dashboard','property','unit','tenant','maintenance','listing','reports']},
  {slug:'accountant',prefix:['dashboard','finance','reports','tenant']},
  {slug:'caretaker',prefix:['dashboard','maintenance','unit']},
  {slug:'receptionist',prefix:['dashboard','tenant','listing']},
  {slug:'maintenance_technician',prefix:['dashboard','maintenance']}
];

async function run() {
  const { data: perms } = await supabaseAdmin.from('permissions').select('key');
  const { data: roles } = await supabaseAdmin.from('roles').select('id, slug').not('company_id', 'is', null);
  
  let toInsert = [];
  for (const role of roles) {
    const t = tmpl.find(x => x.slug === role.slug);
    if (!t) continue;
    
    for (const p of perms) {
      if (t.prefix.includes(p.key.split('.')[0])) {
        // Only insert if it doesn't already exist or we just use upsert
        toInsert.push({ role_id: role.id, permission_key: p.key });
      }
    }
  }
  
  // Upsert in batches of 1000
  for (let i = 0; i < toInsert.length; i += 1000) {
    const batch = toInsert.slice(i, i + 1000);
    const { error } = await supabaseAdmin.from('role_permissions').upsert(batch, { onConflict: 'role_id,permission_key' });
    if (error) console.error(error);
  }
  console.log('Fixed', toInsert.length, 'permissions!');
}
run();
