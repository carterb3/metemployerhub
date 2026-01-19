import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight, Briefcase, DollarSign, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs, regionLabels, employmentTypeLabels, isJobNew, formatPostedDate, Job } from "@/hooks/useJobs";

function JobCardSkeleton() {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="h-5 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="h-6 bg-muted rounded w-12" />
      </div>
      <div className="flex gap-4 mb-3">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-4 bg-muted rounded w-20" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 bg-muted rounded w-28" />
        <div className="h-4 bg-muted rounded w-20" />
      </div>
    </div>
  );
}

interface FeaturedJobCardProps {
  job: Job;
}

function FeaturedJobCard({ job }: FeaturedJobCardProps) {
  // Format pay range if visible
  const payDisplay = job.pay_visible && job.pay_min
    ? job.pay_max
      ? `$${job.pay_min.toLocaleString()} - $${job.pay_max.toLocaleString()}`
      : `From $${job.pay_min.toLocaleString()}`
    : null;

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group relative bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/30 overflow-hidden"
    >
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
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

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {job.city ? `${job.city}, ` : ""}
            {regionLabels[job.region] || job.region}
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" />
            {employmentTypeLabels[job.employment_type] || job.employment_type}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {formatPostedDate(job.posted_at)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {payDisplay ? (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              {payDisplay}
              {job.pay_period && <span className="text-muted-foreground font-normal">/{job.pay_period}</span>}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Salary on application</span>
          )}
          <span className="text-sm font-medium text-primary group-hover:text-accent flex items-center transition-colors">
            Apply Now
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedJobs() {
  const { data: jobs, isLoading, error } = useJobs({});
  
  // Get the 6 most recent featured or active jobs
  const featuredJobs = jobs
    ?.filter(job => job.status === 'active')
    .slice(0, 6) || [];

  return (
    <section className="section-padding bg-gradient-to-b from-secondary/30 to-background">
      <div className="container-mobile">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Featured Opportunities
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Discover the latest job openings from employers across Manitoba who
              are committed to hiring Red River Métis talent.
            </p>
          </div>
          <Button variant="outline" asChild className="group shrink-0">
            <Link to="/jobs">
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground mb-4">Unable to load featured jobs.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground mb-4">No featured jobs available at the moment.</p>
            <Button asChild>
              <Link to="/jobs">Browse All Jobs</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job, index) => (
              <div
                key={job.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FeaturedJobCard job={job} />
              </div>
            ))}
          </div>
        )}

        {featuredJobs.length > 0 && (
          <div className="text-center mt-10">
            <Button size="lg" asChild className="group">
              <Link to="/jobs">
                Explore All {jobs?.length || 0}+ Opportunities
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
