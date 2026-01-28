import { Link } from "react-router-dom";
import { Clock, ArrowLeft, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";

export default function EmployerPending() {
  const { user, signOut } = useEmployerAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link to="/">
            <img src={logo} alt="MET" className="h-14 w-auto mx-auto mb-4" />
          </Link>
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="font-serif text-2xl">Account Pending Approval</CardTitle>
          <CardDescription className="text-base">
            Your employer account is being reviewed by our team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              Thank you for your interest in partnering with Métis Employment & Training!
            </p>
            <p>
              Our team typically reviews employer applications within 1-2 business days. 
              You'll receive an email once your account has been approved.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Questions? Contact us:</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:employment@mmf.mb.ca" className="hover:text-primary">
                employment@mmf.mb.ca
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a href="tel:204-586-8474" className="hover:text-primary">
                204-586-8474
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
            {user && (
              <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                Sign Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
