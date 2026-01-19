import { Link } from "react-router-dom";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Share2, 
  Bookmark,
  Calendar,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  regionLabels, 
  categoryLabels, 
  employmentTypeLabels, 
  isJobNew, 
  formatPostedDate,
  type Job
} from "@/hooks/useJobs";
import { JobBreadcrumb } from "./JobBreadcrumb";
import { toast } from "sonner";

interface JobHeaderProps {
  job: Job;
}

export function JobHeader({ job }: JobHeaderProps) {
  const handleShare = async () => {
    const shareData = {
      title: job.title,
      text: `Check out this job opportunity: ${job.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleSave = () => {
    toast.info("Sign in to save jobs", {
      action: {
        label: "Sign In",
        onClick: () => window.location.href = "/login",
      },
    });
  };

  return (
    <section className="bg-primary py-10 sm:py-12">
      <div className="container-mobile">
        <JobBreadcrumb jobTitle={job.title} />

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge 
                variant="outline" 
                className="border-green-400/50 bg-green-500/20 text-green-100"
              >
                Active
              </Badge>
              {isJobNew(job.posted_at) && (
                <Badge className="bg-accent text-accent-foreground">
                  New
                </Badge>
              )}
              {job.is_remote && (
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">
                  Remote Available
                </Badge>
              )}
              {job.featured && (
                <Badge className="bg-warning text-warning-foreground">
                  Featured
                </Badge>
              )}
              {job.employers?.is_partner && (
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">
                  Partner Employer
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 text-balance">
              {job.title}
            </h1>

            {/* Company */}
            {job.employers && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-foreground/70" />
                </div>
                <span className="text-lg text-primary-foreground/90 font-medium">
                  {job.employers.company_name}
                </span>
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.city ? `${job.city}, ` : ""}
                {regionLabels[job.region] || job.region}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {categoryLabels[job.category] || job.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {employmentTypeLabels[job.employment_type] || job.employment_type}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Posted {formatPostedDate(job.posted_at)}
              </span>
            </div>

            {/* Expiry Warning */}
            {job.expires_at && (
              <p className="text-sm text-primary-foreground/70 mt-3">
                Applications close {new Date(job.expires_at).toLocaleDateString('en-CA', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0 lg:flex-col lg:items-end">
            <Button 
              variant="hero-outline" 
              size="icon" 
              onClick={handleShare}
              aria-label="Share this job"
              className="w-10 h-10"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="hero-outline" 
              size="icon"
              onClick={handleSave}
              aria-label="Save this job"
              className="w-10 h-10"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
