import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, Globe, User } from "lucide-react";

export default function EmployerProfile() {
  const { employer, user } = useEmployerAuth();

  return (
    <EmployerLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Company Profile</h1>
          <p className="text-muted-foreground">
            View your company information. Contact MET staff to update details.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Your business details as registered with MET</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input value={employer?.company_name || ""} disabled className="mt-1.5" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Contact Name
                </Label>
                <Input value={employer?.contact_name || ""} disabled className="mt-1.5" />
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Contact Email
                </Label>
                <Input value={employer?.contact_email || ""} disabled className="mt-1.5" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </Label>
                <Input value={employer?.contact_phone || "Not provided"} disabled className="mt-1.5" />
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </Label>
                <Input value={employer?.website || "Not provided"} disabled className="mt-1.5" />
              </div>
            </div>

            {employer?.industry && (
              <div>
                <Label>Industry</Label>
                <Input value={employer.industry} disabled className="mt-1.5" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your login credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Account Email</Label>
              <Input value={user?.email || ""} disabled className="mt-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Need to update your company information? Contact MET at{" "}
               <a href="mailto:metdigital@mmf.mb.ca" className="text-primary hover:underline">
                metdigital@mmf.mb.ca
              </a>{" "}
              or call{" "}
              <a href="tel:204-586-8474" className="text-primary hover:underline">
                204-586-8474
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  );
}
