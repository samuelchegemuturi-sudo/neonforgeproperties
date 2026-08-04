Deno.serve(async (req) => {
  // SECURITY REMEDIATION: 
  // This endpoint previously allowed unauthenticated remote SQL execution.
  // It has been permanently disabled by the Chief Cybersecurity Officer.
  
  console.error("SECURITY ALERT: Attempted access to disabled run_sql endpoint.");
  
  return new Response(
    JSON.stringify({ 
      error: "Forbidden", 
      message: "This endpoint has been disabled for security reasons." 
    }), 
    { 
      status: 403,
      headers: { "Content-Type": "application/json" }
    }
  );
});
