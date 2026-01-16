import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Constants } from "@/integrations/supabase/types";
import { applicationMethodLabels } from "@/types/jobs";

interface ApplicationTabProps {
  form: UseFormReturn<any>;
}

export function ApplicationTab({ form }: ApplicationTabProps) {
  const applicationMethod = form.watch("application_method");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Apply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="application_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Method *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select application method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Constants.public.Enums.application_method.map((method) => (
                      <SelectItem key={method} value={method}>
                        {applicationMethodLabels[method] || method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose how applicants should apply for this position
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {applicationMethod === "apply_url" && (
            <FormField
              control={form.control}
              name="apply_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    External link where candidates can apply
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {applicationMethod === "email" && (
            <FormField
              control={form.control}
              name="apply_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jobs@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Email address for receiving applications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {applicationMethod === "phone" && (
            <FormField
              control={form.control}
              name="apply_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="204-555-1234" {...field} />
                  </FormControl>
                  <FormDescription>
                    Phone number for inquiries
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {applicationMethod === "apply_through_met" && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm">
                <strong>Apply through MET:</strong> Candidates will be directed to submit
                their application through MET Employment Services. Our team will manage
                the intake and connect qualified candidates with this opportunity.
              </p>
            </div>
          )}

          {applicationMethod === "in_person" && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>In-Person Application:</strong> Candidates will be instructed to
                apply in person at the job location. Make sure the address is filled in
                on the Location tab.
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="apply_instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information about how to apply..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional: Provide any special instructions for applicants
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
