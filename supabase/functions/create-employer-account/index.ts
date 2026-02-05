import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Verify caller's JWT
    const { data: { user: caller }, error: authError } = await adminClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller is staff/admin
    const { data: isStaff } = await adminClient.rpc("is_staff_or_admin", {
      _user_id: caller.id,
    });

    if (!isStaff) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, employerId, companyName, setPassword } = await req.json();

    if (!email || !employerId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating employer account for ${email}`);

    // Try to create user first - if exists, will fail and we handle it
    const password = setPassword || (crypto.randomUUID() + "Aa1!");
    
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { company_name: companyName, is_employer: true },
    });

    let userId: string;

    if (createError?.message?.includes("already been registered")) {
      // User exists - get their ID from profiles table
      const { data: profile } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("email", email.toLowerCase())
        .single();

      if (!profile?.user_id) {
        return new Response(
          JSON.stringify({ error: "User exists but profile not found" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      userId = profile.user_id;
      console.log("User already exists:", userId);
    } else if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      userId = newUser.user.id;
      console.log("Created new user:", userId);
    }

    // Assign employer role
    await adminClient.from("user_roles").upsert(
      { user_id: userId, role: "employer" },
      { onConflict: "user_id,role", ignoreDuplicates: true }
    );

    // Link employer record
    const { error: updateError } = await adminClient
      .from("employers")
      .update({ user_id: userId, status: "active" })
      .eq("id", employerId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to link employer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send password reset email
    await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    return new Response(
      JSON.stringify({ success: true, userId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
