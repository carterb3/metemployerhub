import { Link } from "react-router-dom";
import { MapPin, Briefcase, Clock, ArrowRight, DollarSign, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Job, 
  regionLabels, 
  employmentTypeLabels, 
  isJobNew, 
  formatPostedDate 
} from "@/hooks/useJobs";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  variant?: "default" | "compact";
}

export function JobCard({ job, variant = "default" }: JobCardProps) {
  // Safely strip HTML from description for preview
  const descriptionPreview = job.description
    ? DOMPurify.sanitize(job.description, { ALLOWED_TAGS: [] }).slice(0, 150)
    : "";

  // Format pay range if visible
  const payDisplay = job.pay_visible && job.pay_min
    ? job.pay_max
      ? `$${job.pay_min.toLocaleString()} - $${job.pay_max.toLocaleString()}`
      : `From $${job.pay_min.toLocaleString()}`
    : null;

  return (
    <Link
      to={`/jobs/${job.id}`}
      className={cn(
        "group relative block bg-card/80 backdrop-blur-sm rounded-xl border border-border transition-all duration-300",
        "hover:shadow-card-hover hover:-translate-y-0.5 hover:border-primary/30 overflow-hidden",
        variant === "compact" ? "p-4" : "p-5"
      )}
    >
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-foreground group-hover:text-primary transition-colors",
              variant === "compact" ? "text-base line-clamp-1" : "text-lg"
            )}>
              {job.title}
            </h3>
            <p className="text-muted-foreground font-medium">
              {job.employers?.company_name || "Employer"}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {isJobNew(job.posted_at) && <Badge variant="new">New</Badge>}
            {job.is_remote && <Badge variant="remote">Remote</Badge>}
          </div>
        </div>

        {/* Description Preview - only on default variant */}
        {variant === "default" && descriptionPreview && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {descriptionPreview}
            {job.description && job.description.length > 150 ? "..." : ""}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {job.city ? `${job.city}, ` : ""}
              {regionLabels[job.region] || job.region}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 shrink-0" />
            {employmentTypeLabels[job.employment_type] || job.employment_type}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0" />
            {formatPostedDate(job.posted_at)}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {payDisplay ? (
            <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              {payDisplay}
              {job.pay_period && (
                <span className="text-muted-foreground font-normal">/{job.pay_period}</span>
              )}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Salary on application</span>
          )}
          <span className="text-sm font-medium text-primary group-hover:text-accent flex items-center transition-colors">
            View Details
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// Skeleton for loading state
export function JobCardSkeleton() {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="h-5 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="h-6 bg-muted rounded w-12" />
      </div>
      <div className="h-4 bg-muted rounded w-full mb-2" />
      <div className="h-4 bg-muted rounded w-4/5 mb-4" />
      <div className="flex gap-4 mb-3">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-4 bg-muted rounded w-20" />
        <div className="h-4 bg-muted rounded w-16" />
      </div>
      <div className="flex justify-between pt-3 border-t border-border/50">
        <div className="h-4 bg-muted rounded w-28" />
        <div className="h-4 bg-muted rounded w-20" />
      </div>
    </div>
  );
}
