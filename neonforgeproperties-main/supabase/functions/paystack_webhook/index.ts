import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as crypto from "node:crypto";

console.log("Paystack Webhook starting...");

export default {
  async fetch(req: Request) {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    try {
      const signature = req.headers.get('x-paystack-signature');
      if (!signature) {
        return new Response('Missing signature', { status: 401 });
      }

      const text = await req.text();
      
      // Get Paystack Secret Key from platform_settings
      const { data: settings, error: settingsError } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'pg_paystack_secret_key')
        .single();

      if (settingsError || !settings?.value) {
        console.error('Failed to retrieve Paystack secret key', settingsError);
        return new Response('Server configuration error', { status: 500 });
      }

      const secretKey = String(settings.value);

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha512', secretKey)
        .update(text)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Invalid signature');
        return new Response('Invalid signature', { status: 401 });
      }

      const event = JSON.parse(text);

      if (event.event === 'charge.success') {
        // Find company ID from metadata
        const customFields = event.data?.metadata?.custom_fields || [];
        const companyIdField = customFields.find((f: any) => f.variable_name === 'company_id');
        
        if (companyIdField && companyIdField.value) {
          const companyId = companyIdField.value;
          console.log(`Activating company: ${companyId}`);

          // Update company activation status
          const { error: updateError } = await supabase
            .from('companies')
            .update({ activation_status: 'active' })
            .eq('id', companyId);
            
          if (updateError) {
            console.error('Failed to update company activation status:', updateError);
          }
          
          // Generate licence
          const { error: rpcError } = await supabase.rpc('generate_licence', {
            _company_id: companyId
          });
          
          if (rpcError) {
            console.error('Failed to generate licence:', rpcError);
          }
          
          // Initialize subscription (30 day trial)
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 30);
          
          const { error: subError } = await supabase
            .from('platform_subscriptions')
            .insert({
              company_id: companyId,
              status: 'trialing',
              trial_ends_at: trialEnd.toISOString(),
              current_period_end: trialEnd.toISOString()
            });
            
          if (subError && subError.code !== '23505') { // Ignore unique constraint violation
            console.error('Failed to initialize subscription:', subError);
          }
          
          // Send activation email
          try {
            // We need the user's email. We can get it from the event metadata or query the profiles table.
            const email = event.data?.customer?.email || event.data?.metadata?.email;
            if (email) {
              await supabase.functions.invoke('send_email', {
                body: {
                  to: email,
                  subject: 'Account Activated - Welcome to Makao!',
                  htmlContent: '<h1>Welcome to Makao!</h1><p>Your account has been successfully activated. You can now start adding properties and units to your dashboard.</p>'
                }
              });
            }
          } catch (emailError) {
            console.error('Failed to send activation email:', emailError);
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
  }
};
