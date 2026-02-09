import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // --- Authentication: require valid JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // --- Authorization: require admin role ---
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Process request (admin-only from here) ---
    const { action, email, password } = await req.json();

    if (action === "create_demo_employer") {
      const demoEmail = email || "demo@employer.test";
      const demoPassword = password || "Demo123!";

      // Check if user exists
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("email", demoEmail.toLowerCase())
        .single();

      let targetUserId: string;

      if (existingProfile?.user_id) {
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          existingProfile.user_id,
          { password: demoPassword }
        );

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        targetUserId = existingProfile.user_id;
      } else {
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: demoEmail,
          password: demoPassword,
          email_confirm: true,
          user_metadata: { company_name: "Demo Employer Inc.", is_employer: true },
        });

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        targetUserId = newUser.user.id;
      }

      // Check if employer record exists for this user
      const { data: existingEmployer } = await adminClient
        .from("employers")
        .select("id")
        .eq("user_id", targetUserId)
        .single();

      if (!existingEmployer) {
        await adminClient
          .from("employers")
          .insert({
            user_id: targetUserId,
            company_name: "Demo Employer Inc.",
            contact_name: "Demo User",
            contact_email: demoEmail,
            status: "active",
            is_partner: true,
            industry: "Technology",
          });
      }

      // Ensure employer role
      await adminClient.from("user_roles").upsert(
        { user_id: targetUserId, role: "employer" },
        { onConflict: "user_id,role", ignoreDuplicates: true }
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Demo employer account ready for ${demoEmail}`,
          userId: targetUserId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "set_password") {
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Email and password required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: profile } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("email", email.toLowerCase())
        .single();

      if (!profile?.user_id) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        profile.user_id,
        { password }
      );

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: `Password updated for ${email}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
