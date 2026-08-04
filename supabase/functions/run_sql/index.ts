import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const pool = new postgres.Pool(Deno.env.get("SUPABASE_DB_URL")!, 3, true);

Deno.serve(async (req) => {
  try {
    const { query } = await req.json();
    const connection = await pool.connect();
    try {
      const result = await connection.queryObject(query);
      return new Response(JSON.stringify(result.rows), {
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});
