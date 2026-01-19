import { useParams, Link } from "react-router-dom";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Building2, 
  Globe, 
  ArrowLeft, 
  Share2, 
  Bookmark,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useJob, 
  regionLabels, 
  categoryLabels, 
  employmentTypeLabels, 
  isJobNew, 
  formatPostedDate 
} from "@/hooks/useJobs";
import { sanitizeHtml, isHtmlContent } from "@/lib/sanitize";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id || "");

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-primary py-12">
          <div className="container-mobile">
            <Skeleton className="h-8 w-64 bg-primary-foreground/20 mb-4" />
            <Skeleton className="h-6 w-48 bg-primary-foreground/20" />
          </div>
        </div>
        <div className="section-padding bg-background">
          <div className="container-mobile max-w-4xl">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="section-padding bg-background">
          <div className="container-mobile text-center py-16">
            <h1 className="font-serif text-2xl font-bold text-foreground mb-4">
              Job Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              This job posting may have been removed or expired.
            </p>
            <Button asChild>
              <Link to="/jobs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast here
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary py-12">
        <div className="container-mobile">
          <Link 
            to="/jobs" 
            className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {isJobNew(job.posted_at) && <Badge variant="new">New</Badge>}
                {job.is_remote && <Badge variant="remote">Remote</Badge>}
                {job.employers?.is_partner && (
                  <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">
                    Partner Employer
                  </Badge>
                )}
              </div>
              
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-3">
                {job.title}
              </h1>
              
              <p className="text-xl text-primary-foreground/90 mb-4">
                {job.employers?.company_name || "Employer"}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-primary-foreground/80">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.city ? `${job.city}, ` : ""}{regionLabels[job.region] || job.region}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {employmentTypeLabels[job.employment_type] || job.employment_type}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Posted {formatPostedDate(job.posted_at)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button variant="hero-outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="hero-outline" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-background">
        <div className="container-mobile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Job Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  About This Role
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {isHtmlContent(job.description) ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(job.description),
                      }}
                    />
                  ) : (
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {job.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    Requirements
                  </h2>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    {isHtmlContent(job.requirements) ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(job.requirements),
                        }}
                      />
                    ) : (
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {job.requirements}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Apply Through MET */}
              {job.apply_through_met && (
                <div className="bg-accent/10 rounded-xl border border-accent/20 p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Apply Through MET
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        This employer partners with Métis Employment & Training. 
                        Register with us to apply and receive personalized support 
                        throughout the hiring process.
                      </p>
                      <Button asChild variant="accent">
                        <Link to="/register">Register with MET to Apply</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                {job.pay_range && (
                  <div className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    {job.pay_range}
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {categoryLabels[job.category] || job.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {employmentTypeLabels[job.employment_type] || job.employment_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {job.city ? `${job.city}, ` : ""}
                      {regionLabels[job.region] || job.region}
                      {job.is_remote && " (Remote available)"}
                    </span>
                  </div>
                </div>

                {job.apply_url ? (
                  <Button asChild className="w-full" size="lg">
                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : job.apply_through_met ? (
                  <Button asChild className="w-full" size="lg">
                    <Link to="/register">Apply Through MET</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full" size="lg">
                    <Link to="/register">Register to Apply</Link>
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center mt-3">
                  {job.expires_at 
                    ? `Applications close ${new Date(job.expires_at).toLocaleDateString()}`
                    : "Apply soon - positions fill quickly"
                  }
                </p>
              </div>

              {/* Employer Info */}
              {job.employers && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    About the Employer
                  </h3>
                  
                  <p className="font-medium text-foreground mb-2">
                    {job.employers.company_name}
                  </p>
                  
                  {job.employers.industry && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {job.employers.industry}
                    </p>
                  )}

                  {job.employers.website && (
                    <a 
                      href={job.employers.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      <Globe className="mr-1.5 h-3.5 w-3.5" />
                      Visit Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
