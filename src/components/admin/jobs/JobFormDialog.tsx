import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useCreateJob, useUpdateJob, useEmployers } from "@/hooks/useAdminJobs";
import { regionLabels, categoryLabels, employmentTypeLabels } from "@/hooks/useJobs";
import type { AdminJobFull } from "@/types/jobs";

const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().optional(),
  region: z.string().min(1, "Region is required"),
  city: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  employment_type: z.string().min(1, "Employment type is required"),
  listing_type: z.string().min(1, "Listing type is required"),
  pay_range: z.string().optional(),
  employer_id: z.string().optional(),
  apply_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  apply_through_met: z.boolean().default(false),
  is_remote: z.boolean().default(false),
  expires_at: z.string().optional(),
  status: z.string().default("draft"),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const listingTypeLabels: Record<string, string> = {
  summer_employment: "Summer Employment",
  met_positions: "MET Positions",
  partner_jobs: "Partner Jobs",
  training_programs: "Training Programs",
};

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: AdminJobFull | null;
}

export function JobFormDialog({ open, onOpenChange, job }: JobFormDialogProps) {
  const isEditing = !!job;
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const { data: employers = [] } = useEmployers();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      region: "",
      city: "",
      category: "",
      employment_type: "",
      listing_type: "partner_jobs",
      pay_range: "",
      employer_id: "",
      apply_url: "",
      apply_through_met: false,
      is_remote: false,
      expires_at: "",
      status: "draft",
    },
  });

  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title,
        description: job.description,
        requirements: job.requirements || "",
        region: job.region,
        city: job.city || "",
        category: job.category,
        employment_type: job.employment_type,
        listing_type: job.listing_type,
        pay_range: job.pay_range || "",
        employer_id: job.employer_id || "",
        apply_url: job.apply_url || "",
        apply_through_met: job.apply_through_met || false,
        is_remote: job.is_remote || false,
        expires_at: job.expires_at ? job.expires_at.split("T")[0] : "",
        status: job.status,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        requirements: "",
        region: "",
        city: "",
        category: "",
        employment_type: "",
        listing_type: "partner_jobs",
        pay_range: "",
        employer_id: "",
        apply_url: "",
        apply_through_met: false,
        is_remote: false,
        expires_at: "",
        status: "draft",
      });
    }
  }, [job, form, open]);

  const onSubmit = async (values: JobFormValues) => {
    const baseData = {
      title: values.title,
      description: values.description,
      region: values.region as any,
      category: values.category as any,
      employment_type: values.employment_type as any,
      listing_type: values.listing_type as any,
      status: values.status as any,
      employer_id: values.employer_id || null,
      apply_url: values.apply_url || null,
      expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : null,
      requirements: values.requirements || null,
      city: values.city || null,
      pay_range: values.pay_range || null,
      apply_through_met: values.apply_through_met,
      is_remote: values.is_remote,
    };

    if (isEditing && job) {
      await updateJob.mutateAsync({ id: job.id, ...baseData });
    } else {
      await createJob.mutateAsync(baseData);
    }

    onOpenChange(false);
  };

  const isLoading = createJob.isPending || updateJob.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {isEditing ? "Edit Job Posting" : "Create New Job Posting"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the job posting details below."
              : "Fill in the details to create a new job posting."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Basic Information
                </h3>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Employment Counsellor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Constants.public.Enums.job_category.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {categoryLabels[cat] || cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Constants.public.Enums.employment_type.map((type) => (
                              <SelectItem key={type} value={type}>
                                {employmentTypeLabels[type] || type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="listing_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select listing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Constants.public.Enums.listing_type.map((type) => (
                            <SelectItem key={type} value={type}>
                              {listingTypeLabels[type] || type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines which tab this job appears under
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List the qualifications, skills, and experience required..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Location
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Constants.public.Enums.manitoba_region.map((region) => (
                              <SelectItem key={region} value={region}>
                                {regionLabels[region] || region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Winnipeg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_remote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Remote work available</FormLabel>
                        <FormDescription>
                          This position can be done remotely
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Employer & Compensation */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Employer & Compensation
                </h3>

                <FormField
                  control={form.control}
                  name="employer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employer (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No employer selected</SelectItem>
                          {employers.map((employer) => (
                            <SelectItem key={employer.id} value={employer.id}>
                              {employer.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pay_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pay Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $45,000 - $55,000/year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Application */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Application Details
                </h3>

                <FormField
                  control={form.control}
                  name="apply_through_met"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Apply through MET</FormLabel>
                        <FormDescription>
                          Applicants will apply through MET services
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apply_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Application URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          disabled={form.watch("apply_through_met")}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank if applying through MET
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Job will automatically be hidden after this date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Publishing
                </h3>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Constants.public.Enums.job_status.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Only "Active" jobs are visible on the public job board
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update Job" : "Create Job"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
