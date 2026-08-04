import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

console.log("Google Drive Backup Function starting...");

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
      const { report_name, data, folder_id } = await req.json();

      if (!report_name || !data) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
      }

      // Get Google Service Account from platform_settings
      const { data: settings, error: settingsError } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'google_drive_token')
        .single();

      if (settingsError || !settings?.value) {
        return new Response(JSON.stringify({ error: 'Google Drive is not configured on the platform.' }), { status: 500 });
      }

      const accessToken = String(settings.value); // In a real app, you'd exchange a refresh token or service account key here

      // Convert JSON data to CSV string (basic implementation)
      let csvContent = "";
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        csvContent += headers.join(",") + "\n";
        for (const row of data) {
          csvContent += headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(",") + "\n";
        }
      } else {
        csvContent = JSON.stringify(data, null, 2);
      }

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const metadata = {
        name: `${report_name}_${new Date().toISOString()}.csv`,
        mimeType: 'text/csv',
        parents: folder_id ? [folder_id] : undefined
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/csv\r\n\r\n' +
        csvContent +
        close_delim;

      const gdriveResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Authorization': `Bearer ${accessToken}`
        },
        body: multipartRequestBody
      });

      if (!gdriveResponse.ok) {
        const errData = await gdriveResponse.json();
        console.error('Google Drive API Error:', errData);
        return new Response(JSON.stringify({ error: 'Failed to upload to Google Drive' }), { status: 500 });
      }

      const result = await gdriveResponse.json();
      return new Response(JSON.stringify({ success: true, fileId: result.id }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Drive upload error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
  }
};
