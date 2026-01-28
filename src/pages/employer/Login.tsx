import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft, Building2 } from "lucide-react";
import { z } from "zod";
import logo from "@/assets/logo.png";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";

const authSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

export default function EmployerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isEmployer, isApproved, isLoading: authLoading } = useEmployerAuth();

  // Redirect if already logged in as approved employer
  useEffect(() => {
    if (!authLoading && user && isEmployer && isApproved) {
      navigate("/employer/dashboard");
    } else if (!authLoading && user && isEmployer && !isApproved) {
      navigate("/employer/pending");
    }
  }, [authLoading, user, isEmployer, isApproved, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }
    
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error) {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
    }
    // Navigation will happen via useEffect when auth state changes
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/">
            <img src={logo} alt="MET" className="h-14 w-auto mx-auto mb-4" />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Employer Portal</span>
          </div>
          <CardTitle className="font-serif text-2xl">Sign In</CardTitle>
          <CardDescription>
            Access your employer dashboard to manage job postings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Don't have an employer account?
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/employers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Submit an Employer Inquiry
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              After your inquiry is approved, you'll receive an email to set up your account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
