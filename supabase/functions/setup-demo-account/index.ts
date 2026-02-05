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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { action, email, password } = await req.json();

    if (action === "create_demo_employer") {
      // Create or update demo employer account
      const demoEmail = email || "demo@employer.test";
      const demoPassword = password || "Demo123!";

      // Check if user exists
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("email", demoEmail.toLowerCase())
        .single();

      let userId: string;

      if (existingProfile?.user_id) {
        // Update password for existing user
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
        
        userId = existingProfile.user_id;
        console.log("Updated password for existing user:", userId);
      } else {
        // Create new user
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

        userId = newUser.user.id;
        console.log("Created new demo user:", userId);
      }

      // Check if employer record exists for this user
      const { data: existingEmployer } = await adminClient
        .from("employers")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!existingEmployer) {
        // Create employer record
        const { error: employerError } = await adminClient
          .from("employers")
          .insert({
            user_id: userId,
            company_name: "Demo Employer Inc.",
            contact_name: "Demo User",
            contact_email: demoEmail,
            status: "active",
            is_partner: true,
            industry: "Technology",
          });

        if (employerError) {
          console.error("Failed to create employer record:", employerError);
        }
      }

      // Ensure employer role
      await adminClient.from("user_roles").upsert(
        { user_id: userId, role: "employer" },
        { onConflict: "user_id,role", ignoreDuplicates: true }
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Demo employer account ready: ${demoEmail} / ${demoPassword}`,
          userId 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "set_password") {
      // Set password for existing user
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
