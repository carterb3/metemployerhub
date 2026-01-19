import { Tag, Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabels, employmentTypeLabels, regionLabels } from "@/hooks/useJobs";
import type { Job } from "@/hooks/useJobs";

interface JobTagsProps {
  job: Job;
  // Future: attachments could be passed here
}

const listingTypeLabels: Record<string, string> = {
  summer_employment: "Summer Employment",
  met_positions: "MET Positions",
  partner_jobs: "Partner Jobs",
  training_programs: "Training Programs",
};

export function JobTags({ job }: JobTagsProps) {
  const tags = [
    categoryLabels[job.category],
    employmentTypeLabels[job.employment_type],
    regionLabels[job.region],
    listingTypeLabels[job.listing_type],
    job.is_remote ? "Remote Available" : null,
    job.featured ? "Featured" : null,
  ].filter(Boolean);

  // Placeholder for future attachments feature
  const attachments: Array<{ name: string; url: string; size: string }> = [];

  return (
    <section className="bg-card rounded-xl border border-border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Tag className="h-5 w-5 text-primary" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Tags & Documents
        </h2>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-3">Categories & Tags</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Attachments */}
      {attachments.length > 0 ? (
        <div>
          <p className="text-sm text-muted-foreground mb-3">Downloadable Documents</p>
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a href={file.url} download>
                  <FileText className="mr-2 h-4 w-4" />
                  {file.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {file.size}
                  </span>
                  <Download className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No additional documents attached to this listing.
        </p>
      )}
    </section>
  );
}
