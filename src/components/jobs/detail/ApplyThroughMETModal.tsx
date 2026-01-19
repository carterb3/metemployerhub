import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ManitobaRegion = Database["public"]["Enums"]["manitoba_region"];
type ContactPreference = Database["public"]["Enums"]["contact_preference"];

const regionOptions: { value: ManitobaRegion; label: string }[] = [
  { value: "winnipeg", label: "Winnipeg" },
  { value: "southeast", label: "Southeast" },
  { value: "interlake", label: "Interlake" },
  { value: "parklands", label: "Parklands" },
  { value: "northwest", label: "Northwest" },
  { value: "the_pas", label: "The Pas" },
  { value: "thompson", label: "Thompson" },
  { value: "swan_river", label: "Swan River" },
];

const contactPreferenceOptions: { value: ContactPreference; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Call" },
  { value: "text", label: "Text Message" },
  { value: "any", label: "Any Method" },
];

// Form validation schema
const applyFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  region: z.enum([
    "winnipeg", "southeast", "interlake", "parklands", 
    "northwest", "the_pas", "thompson", "swan_river"
  ] as const, {
    required_error: "Please select your region",
  }),
  contact_preference: z.enum(["email", "phone", "text", "any"] as const).default("any"),
  employment_goals: z
    .string()
    .trim()
    .max(1000, "Message must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  self_identifies_metis: z.boolean().optional(),
  consent_data_collection: z
    .boolean()
    .refine(val => val === true, "You must consent to data collection to apply"),
  consent_contact: z
    .boolean()
    .refine(val => val === true, "You must consent to being contacted"),
});

type ApplyFormData = z.infer<typeof applyFormSchema>;

interface ApplyThroughMETModalProps {
  jobTitle: string;
  jobId: string;
  trigger?: React.ReactNode;
}

export function ApplyThroughMETModal({ jobTitle, jobId, trigger }: ApplyThroughMETModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ApplyFormData>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      region: undefined,
      contact_preference: "any",
      employment_goals: "",
      self_identifies_metis: false,
      consent_data_collection: false,
      consent_contact: false,
    },
  });

  const onSubmit = async (data: ApplyFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("job_seeker_intakes")
        .insert({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || null,
          region: data.region,
          contact_preference: data.contact_preference,
          employment_goals: data.employment_goals 
            ? `Applying for: ${jobTitle}\n\n${data.employment_goals}`
            : `Applying for: ${jobTitle}`,
          self_identifies_metis: data.self_identifies_metis || false,
          consent_data_collection: data.consent_data_collection,
          consent_contact: data.consent_contact,
          interests: [jobId], // Store job ID in interests for tracking
          status: "new",
        });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Application submitted successfully!");
      
      // Reset after delay
      setTimeout(() => {
        setOpen(false);
        setIsSuccess(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen);
      if (!newOpen) {
        setIsSuccess(false);
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full sm:w-auto bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70">
            <Sparkles className="mr-2 h-4 w-4" />
            Apply Through MET
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Application Submitted!
            </h3>
            <p className="text-muted-foreground">
              Thank you for applying. A MET career advisor will contact you soon.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Apply Through MET
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Submit your interest in <strong className="text-foreground">{jobTitle}</strong>. 
                A career advisor will contact you to discuss this opportunity.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your full name" 
                          {...field} 
                          autoComplete="name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your.email@example.com" 
                          {...field}
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone & Region Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="(204) 555-1234" 
                            {...field}
                            autoComplete="tel"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regionOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Preference */}
                <FormField
                  control={form.control}
                  name="contact_preference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Contact Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How should we contact you?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactPreferenceOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message */}
                <FormField
                  control={form.control}
                  name="employment_goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your interest in this position, relevant experience, or any questions..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional - Share anything that might help us support your application.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Métis Identity */}
                <FormField
                  control={form.control}
                  name="self_identifies_metis"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          I self-identify as Red River Métis
                        </FormLabel>
                        <FormDescription>
                          MET programs are designed specifically to support Red River Métis citizens.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Consent Checkboxes */}
                <div className="space-y-3 pt-2">
                  <FormField
                    control={form.control}
                    name="consent_data_collection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm cursor-pointer">
                            I consent to the collection and use of my information for employment services. *
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.consent_data_collection && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.consent_data_collection.message}
                    </p>
                  )}

                  <FormField
                    control={form.control}
                    name="consent_contact"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm cursor-pointer">
                            I consent to being contacted by MET staff regarding this application. *
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.consent_contact && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.consent_contact.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to MET's privacy policy and terms of service.
                </p>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
