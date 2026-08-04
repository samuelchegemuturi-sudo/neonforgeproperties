import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

console.log("Brevo Send Email Function starting...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default {
  async fetch(req: Request) {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    try {
      const { to, subject, htmlContent } = await req.json();

      if (!to || !subject || !htmlContent) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Get Brevo API Key from platform_settings
      const { data: settings, error: settingsError } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'brevo_api_key')
        .single();

      if (settingsError || !settings?.value) {
        console.error('Failed to retrieve Brevo API key', settingsError);
        return new Response(JSON.stringify({ error: 'Brevo API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const brevoApiKey = String(settings.value);

      // Call Brevo API
      const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Makao Admin', email: 'noreply@makao.com' },
          to: [{ email: to }],
          subject: subject,
          htmlContent: htmlContent
        })
      });

      if (!brevoResponse.ok) {
        const errData = await brevoResponse.json();
        console.error('Brevo API Error:', errData);
        return new Response(JSON.stringify({ error: 'Failed to send email via Brevo' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const result = await brevoResponse.json();
      return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Email error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  }
};
