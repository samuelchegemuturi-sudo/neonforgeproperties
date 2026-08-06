import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as crypto from "node:crypto";

console.log("Paystack Webhook starting...");

/**
 * MAKAO — Paystack Webhook Handler
 *
 * Handles the following events:
 *  - charge.success           → Activation fee paid; activates company + sends welcome email
 *  - subscription.create      → Paystack recurring subscription started; set status = 'active'
 *  - subscription.disable     → Subscription cancelled; set status = 'canceled'
 *  - invoice.payment_failed   → Renewal payment failed; set status = 'past_due'
 *  - invoice.update (paid)    → Renewal paid; extend current_period_end by 30 days
 */

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
      const eventType: string = event.event;

      console.log(`Processing Paystack event: ${eventType}`);

      // ── A. Activation fee paid ───────────────────────────────────────────
      if (eventType === 'charge.success') {
        const customFields = event.data?.metadata?.custom_fields || [];
        const companyIdField = customFields.find((f: any) => f.variable_name === 'company_id');
        
        if (companyIdField?.value) {
          const companyId = companyIdField.value;
          console.log(`Activating company: ${companyId}`);

          await supabase
            .from('companies')
            .update({ activation_status: 'active' })
            .eq('id', companyId);
          
          await supabase.rpc('generate_licence', { _company_id: companyId });
          
          // Initialize 30-day trial subscription (only if not yet created)
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 30);
          
          const { error: subError } = await supabase
            .from('platform_subscriptions')
            .insert({
              company_id: companyId,
              status: 'trialing',
              trial_ends_at: trialEnd.toISOString(),
              current_period_start: new Date().toISOString(),
              current_period_end: trialEnd.toISOString(),
            });
            
          if (subError && subError.code !== '23505') {
            console.error('Failed to initialize subscription:', subError);
          }
          
          // Send welcome email
          try {
            const email = event.data?.customer?.email || event.data?.metadata?.email;
            if (email) {
              await supabase.functions.invoke('send_email', {
                body: {
                  to: email,
                  subject: '🎉 Account Activated – Welcome to MAKAO!',
                  htmlContent: `
                    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0f172a;color:#f8fafc;border-radius:16px;">
                      <h1 style="color:#6366f1;margin-bottom:8px;">Welcome to MAKAO!</h1>
                      <p style="color:#94a3b8;font-size:16px;line-height:1.6;">
                        Your account has been <strong style="color:#22c55e;">successfully activated</strong>. 
                        You now have full access to the MAKAO property management platform.
                      </p>
                      <ul style="color:#cbd5e1;line-height:2;">
                        <li>✅ Add your properties and units</li>
                        <li>✅ Create tenant leases</li>
                        <li>✅ Generate KRA-compliant eTIMS invoices</li>
                        <li>✅ Track maintenance and support tickets</li>
                      </ul>
                      <p style="color:#64748b;font-size:12px;margin-top:32px;">
                        Sent by MAKAO · Powered by Neon Forge Creation · admin@neonforgecreation.co.ke
                      </p>
                    </div>
                  `,
                }
              });
            }
          } catch (emailError) {
            console.error('Failed to send activation email:', emailError);
          }
        }
      }

      // ── B. Recurring subscription created ──────────────────────────────────
      else if (eventType === 'subscription.create') {
        const email = event.data?.customer?.email;
        const paystackSubscriptionCode = event.data?.subscription_code;
        
        if (email) {
          // Find company by owner email
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('email', email)
            .maybeSingle();
          
          if (profile?.company_id) {
            const nextBillingDate = event.data?.next_payment_date
              ? new Date(event.data.next_payment_date)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await supabase
              .from('platform_subscriptions')
              .update({
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: nextBillingDate.toISOString(),
                // Store Paystack subscription code for future management
                ...(paystackSubscriptionCode ? { paystack_subscription_code: paystackSubscriptionCode } : {}),
              })
              .eq('company_id', profile.company_id);
            
            console.log(`Subscription activated for company: ${profile.company_id}`);
          }
        }
      }

      // ── C. Subscription cancelled ───────────────────────────────────────────
      else if (eventType === 'subscription.disable') {
        const email = event.data?.customer?.email;
        
        if (email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('email', email)
            .maybeSingle();
          
          if (profile?.company_id) {
            await supabase
              .from('platform_subscriptions')
              .update({ status: 'canceled' })
              .eq('company_id', profile.company_id);
            
            console.log(`Subscription canceled for company: ${profile.company_id}`);
          }
        }
      }

      // ── D. Invoice payment failed (renewal failed) ──────────────────────────
      else if (eventType === 'invoice.payment_failed') {
        const email = event.data?.customer?.email;
        
        if (email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('email', email)
            .maybeSingle();
          
          if (profile?.company_id) {
            await supabase
              .from('platform_subscriptions')
              .update({ status: 'past_due' })
              .eq('company_id', profile.company_id);
            
            // Notify company owner of failed payment
            try {
              await supabase.functions.invoke('send_email', {
                body: {
                  to: email,
                  subject: '⚠️ Payment Failed – MAKAO Subscription',
                  htmlContent: `
                    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0f172a;color:#f8fafc;border-radius:16px;">
                      <h1 style="color:#ef4444;">Payment Failed</h1>
                      <p style="color:#94a3b8;">Your MAKAO subscription renewal payment failed. 
                      Your account has been marked as <strong style="color:#f59e0b;">Past Due</strong>.</p>
                      <p style="color:#94a3b8;">Please update your payment method or contact support to avoid losing access.</p>
                      <p style="color:#64748b;font-size:12px;margin-top:32px;">
                        MAKAO · admin@neonforgecreation.co.ke
                      </p>
                    </div>
                  `,
                }
              });
            } catch (e) {
              console.error('Failed to send payment failure email:', e);
            }
          }
        }
      }

      // ── E. Invoice paid (successful renewal) ────────────────────────────────
      else if (eventType === 'invoice.update' && event.data?.paid === true) {
        const email = event.data?.customer?.email;
        
        if (email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('email', email)
            .maybeSingle();
          
          if (profile?.company_id) {
            // Extend period by 30 days from now (or from current end if still future)
            const { data: existingSub } = await supabase
              .from('platform_subscriptions')
              .select('current_period_end')
              .eq('company_id', profile.company_id)
              .maybeSingle();
            
            const currentEnd = existingSub?.current_period_end
              ? new Date(existingSub.current_period_end)
              : new Date();
            const baseDate = currentEnd > new Date() ? currentEnd : new Date();
            const nextEnd = new Date(baseDate);
            nextEnd.setDate(nextEnd.getDate() + 30);

            await supabase
              .from('platform_subscriptions')
              .update({
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: nextEnd.toISOString(),
              })
              .eq('company_id', profile.company_id);
            
            console.log(`Subscription renewed for company: ${profile.company_id}`);
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
