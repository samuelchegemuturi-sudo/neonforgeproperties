import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const email = "tenant@test.com";
    const password = "password123";

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
    });
    
    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log("User already exists! Log in with:", email, password);
            return;
        }
        console.error("Auth Error:", authError);
        return;
    }

    const userId = authData.user.id;
    console.log("Created Auth user.");

    // 2. Fetch the first company
    const { data: companies, error: compError } = await supabase.from('companies').select('id').limit(1);
    let companyId = companies?.[0]?.id;
    if (!companyId) {
        const { data: newComp } = await supabase.from('companies').insert({ name: 'Test Company' }).select().single();
        companyId = newComp.id;
    }

    // 3. Create tenant
    const { data: tenantData, error: tenantError } = await supabase.from('tenants').insert({
        company_id: companyId,
        full_name: 'Test Tenant',
        email: email,
        phone: '1234567890',
        status: 'active'
    }).select().single();

    if (tenantError) {
        console.error("Tenant Error:", tenantError);
        return;
    }
    console.log("Created Tenant record.");

    // 4. Fetch or create property and unit
    const { data: props } = await supabase.from('properties').select('id').eq('status', 'active').limit(1);
    let propertyId = props?.[0]?.id;
    if (!propertyId) {
       const { data: newProp } = await supabase.from('properties').insert({ company_id: companyId, name: 'Test Property', status: 'active', verification_status: 'verified' }).select().single();
       propertyId = newProp.id;
    }

    const { data: unitTypes } = await supabase.from('unit_types').select('id').limit(1);
    let unitTypeId = unitTypes?.[0]?.id;
    if (!unitTypeId) {
        const { data: newUnitType } = await supabase.from('unit_types').insert({ company_id: companyId, name: '1BR' }).select().single();
        unitTypeId = newUnitType.id;
    }

    const { data: units } = await supabase.from('units').select('id').limit(1);
    let unitId = units?.[0]?.id;
    if (!unitId) {
        const { data: newUnit } = await supabase.from('units').insert({
            company_id: companyId,
            property_id: propertyId,
            unit_type_id: unitTypeId,
            unit_number: '101A',
            status: 'vacant',
            rent: 1000
        }).select().single();
        unitId = newUnit.id;
    }

    // 5. Create a lease
    const { error: leaseError } = await supabase.from('leases').insert({
        company_id: companyId,
        tenant_id: tenantData.id,
        unit_id: unitId,
        property_id: propertyId,
        rent: 1000,
        status: 'active'
    });

    if (leaseError) {
        console.error("Lease Error:", leaseError);
        return;
    }
    console.log("Created active lease.");

    console.log("Success! You can now log in with:");
    console.log("Email:", email);
    console.log("Password:", password);
}
run();
