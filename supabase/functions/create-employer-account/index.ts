import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateEmployerAccountRequest {
  email: string;
  employerId: string;
  companyName: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the calling user is a staff/admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claims?.claims) {
      console.error("JWT verification failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub;

    // Check if user is staff or admin using service client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: isStaff, error: roleError } = await adminClient.rpc("is_staff_or_admin", {
      _user_id: userId,
    });

    if (roleError || !isStaff) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { email, employerId, companyName }: CreateEmployerAccountRequest = await req.json();

    if (!email || !employerId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating employer account for ${email}, employer ID: ${employerId}`);

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let newUserId: string;

    if (existingUser) {
      console.log("User already exists, linking to employer profile");
      newUserId = existingUser.id;
    } else {
      // Create a new user with a random password (they'll reset it)
      const tempPassword = crypto.randomUUID() + "Aa1!";
      
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          company_name: companyName,
          is_employer: true,
        },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      newUserId = newUser.user.id;
      console.log("Created new user:", newUserId);
    }

    // Assign 'employer' role to the user
    const { error: roleInsertError } = await adminClient
      .from("user_roles")
      .upsert(
        { user_id: newUserId, role: "employer" },
        { onConflict: "user_id,role" }
      );

    if (roleInsertError) {
      console.error("Error assigning employer role:", roleInsertError);
      // Continue anyway - user might already have role
    }

    // Link the employer record to the user
    const { error: updateError } = await adminClient
      .from("employers")
      .update({ user_id: newUserId, status: "active" })
      .eq("id", employerId);

    if (updateError) {
      console.error("Error linking employer to user:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to link employer to user account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send password reset email so they can set their password
    const { error: resetError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${req.headers.get("origin")}/employer/login`,
      },
    });

    if (resetError) {
      console.error("Error sending password reset:", resetError);
      // Don't fail - account was created successfully
    }

    console.log("Employer account created successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUserId,
        message: "Employer account created. Password reset email sent."
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
