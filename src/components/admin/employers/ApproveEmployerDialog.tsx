import { useState } from "react";
import { UserPlus, Mail, Building2, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Employer } from "@/hooks/useEmployerCRM";

interface ApproveEmployerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employer: Employer;
}

export function ApproveEmployerDialog({ 
  open, 
  onOpenChange, 
  employer 
}: ApproveEmployerDialogProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(employer.contact_email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Call edge function to create employer account
      const { data, error: fnError } = await supabase.functions.invoke('create-employer-account', {
        body: {
          email,
          employerId: employer.id,
          companyName: employer.company_name,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to create employer account");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSuccess(true);
      toast.success("Employer account created successfully");
      queryClient.invalidateQueries({ queryKey: ["employers"] });
      queryClient.invalidateQueries({ queryKey: ["employer", employer.id] });
      
      // Close dialog after short delay
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error creating employer account:", err);
      setError(err.message || "Failed to create employer account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setEmail(employer.contact_email);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Employer Account
          </DialogTitle>
          <DialogDescription>
            Create a login account for {employer.company_name} to access the Employer Portal.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-medium text-lg mb-2">Account Created!</h3>
            <p className="text-sm text-muted-foreground">
              An invitation email has been sent to {email} with instructions to set up their password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApprove} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{employer.company_name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {employer.contact_name}
              </p>
            </div>

            <div>
              <Label htmlFor="email">Account Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="employer@company.com"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                A password setup link will be sent to this email address.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
