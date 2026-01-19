import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Eye, Copy, FileText, MapPin, DollarSign, Send, Tags, History } from "lucide-react";
import { useCreateJob, useUpdateJob, useEmployers, useDuplicateJob, useAdminJob, useTags, useCreateTag } from "@/hooks/useAdminJobs";
import type { LocationType, ApplicationMethod, PayPeriod } from "@/types/jobs";
import { statusColors } from "@/types/jobs";
import { DetailsTab } from "./tabs/DetailsTab";
import { LocationTab } from "./tabs/LocationTab";
import { CompensationTab } from "./tabs/CompensationTab";
import { ApplicationTab } from "./tabs/ApplicationTab";
import { TagsAttachmentsTab } from "./tabs/TagsAttachmentsTab";
import { PreviewTab } from "./tabs/PreviewTab";
import { ActivityLogPanel } from "./ActivityLogPanel";
import { sanitizeHtml } from "@/lib/sanitize";

const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().optional(),
  region: z.string().min(1, "Region is required"),
  city: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  employment_type: z.string().min(1, "Employment type is required"),
  listing_type: z.string().min(1, "Listing type is required"),
  location_type: z.string().default("onsite"),
  is_remote: z.boolean().default(false),
  province: z.string().default("MB"),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  employer_id: z.string().optional(),
  application_method: z.string().default("apply_url"),
  apply_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  apply_email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  apply_phone: z.string().optional(),
  apply_instructions: z.string().optional(),
  pay_min: z.string().optional(),
  pay_max: z.string().optional(),
  pay_period: z.string().optional(),
  pay_visible: z.boolean().default(false),
  featured: z.boolean().default(false),
  priority: z.number().default(0),
  expires_at: z.string().optional(),
  scheduled_publish_at: z.string().optional(),
  scheduled_unpublish_at: z.string().optional(),
  status: z.string().default("draft"),
  tags: z.array(z.string()).default([]),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobEditorTabsProps {
  jobId?: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function JobEditorTabs({ jobId, onClose, onSaved }: JobEditorTabsProps) {
  const isEditing = !!jobId;
  const [activeTab, setActiveTab] = useState("details");
  const [showActivityLog, setShowActivityLog] = useState(false);

  const { data: job, isLoading: jobLoading } = useAdminJob(jobId || null);
  const { data: employers = [] } = useEmployers();
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const duplicateJob = useDuplicateJob();

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
      location_type: "onsite",
      is_remote: false,
      province: "MB",
      address: "",
      postal_code: "",
      employer_id: "",
      application_method: "apply_url",
      apply_url: "",
      apply_email: "",
      apply_phone: "",
      apply_instructions: "",
      pay_min: "",
      pay_max: "",
      pay_period: "",
      pay_visible: false,
      featured: false,
      priority: 0,
      expires_at: "",
      scheduled_publish_at: "",
      scheduled_unpublish_at: "",
      status: "draft",
      tags: [],
    },
  });

  // Load job data into form
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
        location_type: job.location_type || "onsite",
        is_remote: job.is_remote || false,
        province: job.province || "MB",
        address: job.address || "",
        postal_code: job.postal_code || "",
        employer_id: job.employer_id || "",
        application_method: job.application_method || "apply_url",
        apply_url: job.apply_url || "",
        apply_email: job.apply_email || "",
        apply_phone: job.apply_phone || "",
        apply_instructions: job.apply_instructions || "",
        pay_min: job.pay_min?.toString() || "",
        pay_max: job.pay_max?.toString() || "",
        pay_period: job.pay_period || "",
        pay_visible: job.pay_visible || false,
        featured: job.featured || false,
        priority: job.priority || 0,
        expires_at: job.expires_at ? job.expires_at.split("T")[0] : "",
        scheduled_publish_at: job.scheduled_publish_at ? job.scheduled_publish_at.slice(0, 16) : "",
        scheduled_unpublish_at: job.scheduled_unpublish_at ? job.scheduled_unpublish_at.slice(0, 16) : "",
        status: job.status,
        tags: job.tags?.map(t => t.id) || [],
      });
    }
  }, [job, form]);

  const prepareSubmitData = (values: JobFormValues) => {
    // Sanitize HTML content before saving to database
    const sanitizedDescription = sanitizeHtml(values.description);
    const sanitizedRequirements = values.requirements ? sanitizeHtml(values.requirements) : null;
    
    return {
      title: values.title.trim(),
      description: sanitizedDescription,
      requirements: sanitizedRequirements,
      region: values.region as any,
      city: values.city || null,
      category: values.category as any,
      employment_type: values.employment_type as any,
      listing_type: values.listing_type as any,
      location_type: values.location_type as LocationType,
      is_remote: values.is_remote,
      province: values.province,
      address: values.address || null,
      postal_code: values.postal_code || null,
      employer_id: values.employer_id || null,
      application_method: values.application_method as ApplicationMethod,
      apply_url: values.apply_url || null,
      apply_email: values.apply_email || null,
      apply_phone: values.apply_phone || null,
      apply_instructions: values.apply_instructions || null,
      pay_min: values.pay_min ? parseFloat(values.pay_min) : null,
      pay_max: values.pay_max ? parseFloat(values.pay_max) : null,
      pay_period: (values.pay_period || null) as PayPeriod | null,
      pay_visible: values.pay_visible,
      featured: values.featured,
      priority: values.priority,
      expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : null,
      scheduled_publish_at: values.scheduled_publish_at ? new Date(values.scheduled_publish_at).toISOString() : null,
      scheduled_unpublish_at: values.scheduled_unpublish_at ? new Date(values.scheduled_unpublish_at).toISOString() : null,
      status: values.status as any,
      tags: values.tags,
    };
  };

  const onSubmit = async (values: JobFormValues) => {
    const { tags: tagIds, ...restData } = prepareSubmitData(values);

    if (isEditing && jobId) {
      await updateJob.mutateAsync({ id: jobId, ...restData, tags: tagIds } as any);
    } else {
      await createJob.mutateAsync({ ...restData, tags: tagIds } as any);
    }

    onSaved?.();
    onClose();
  };

  const handleSaveDraft = async () => {
    const values = form.getValues();
    const { tags: tagIds, ...restData } = prepareSubmitData({ ...values, status: "draft" });

    if (isEditing && jobId) {
      await updateJob.mutateAsync({ id: jobId, ...restData, tags: tagIds } as any);
    } else {
      await createJob.mutateAsync({ ...restData, tags: tagIds } as any);
    }
  };

  const handleDuplicate = async () => {
    if (jobId) {
      await duplicateJob.mutateAsync(jobId);
      onClose();
    }
  };

  const isLoading = createJob.isPending || updateJob.isPending || duplicateJob.isPending;

  if (jobLoading && isEditing) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full">
        <div className={`flex-1 flex flex-col ${showActivityLog ? "pr-80" : ""}`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="font-serif text-xl font-bold">
                {isEditing ? "Edit Job Posting" : "Create New Job Posting"}
              </h2>
              {isEditing && job && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusColors[job.status]}>{job.status}</Badge>
                  {job.featured && <Badge variant="outline">Featured</Badge>}
                  {job.slug && (
                    <span className="text-xs text-muted-foreground">/jobs/{job.slug}</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowActivityLog(!showActivityLog)}
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicate}
                    disabled={isLoading}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                </>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save Draft
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {isEditing ? "Update" : "Create"} Job
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="border-b px-6">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="details" className="data-[state=active]:bg-background">
                  <FileText className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="location" className="data-[state=active]:bg-background">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </TabsTrigger>
                <TabsTrigger value="compensation" className="data-[state=active]:bg-background">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Compensation
                </TabsTrigger>
                <TabsTrigger value="application" className="data-[state=active]:bg-background">
                  <Send className="h-4 w-4 mr-2" />
                  Application
                </TabsTrigger>
                <TabsTrigger value="tags" className="data-[state=active]:bg-background">
                  <Tags className="h-4 w-4 mr-2" />
                  Tags & Files
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-background">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="details" className="mt-0">
                  <DetailsTab form={form} employers={employers} />
                </TabsContent>

                <TabsContent value="location" className="mt-0">
                  <LocationTab form={form} />
                </TabsContent>

                <TabsContent value="compensation" className="mt-0">
                  <CompensationTab form={form} />
                </TabsContent>

                <TabsContent value="application" className="mt-0">
                  <ApplicationTab form={form} />
                </TabsContent>

                <TabsContent value="tags" className="mt-0">
                  <TagsAttachmentsTab
                    form={form}
                    tags={tags}
                    onCreateTag={(name) => createTag.mutateAsync(name)}
                    jobId={jobId || undefined}
                    attachments={job?.attachments || []}
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <PreviewTab form={form} employers={employers} tags={tags} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Activity Log Sidebar */}
        {showActivityLog && isEditing && jobId && (
          <ActivityLogPanel jobId={jobId} onClose={() => setShowActivityLog(false)} />
        )}
      </form>
    </Form>
  );
}
