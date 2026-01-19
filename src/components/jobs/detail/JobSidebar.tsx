import { Link } from "react-router-dom";
import { 
  Share2, 
  Mail, 
  Linkedin, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs, type Job, regionLabels, categoryLabels, employmentTypeLabels } from "@/hooks/useJobs";
import { JobEmployerCard } from "./JobEmployerCard";
import { ApplyThroughMETModal } from "./ApplyThroughMETModal";
import { toast } from "sonner";

interface JobSidebarProps {
  job: Job;
}

export function JobSidebar({ job }: JobSidebarProps) {
  // Fetch similar jobs (same category or region, excluding current)
  const { data: allJobs, isLoading: isLoadingSimilar } = useJobs({ 
    category: job.category 
  });
  
  const similarJobs = allJobs
    ?.filter(j => j.id !== job.id)
    .slice(0, 4) || [];

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(`${job.title} at ${job.employers?.company_name || 'MET Partner'}`);

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Job Opportunity: ${job.title}`);
    const body = encodeURIComponent(`Check out this job opportunity:\n\n${job.title}\n${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <aside className="space-y-6">
      {/* Quick Apply Card */}
      <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
        <h3 className="font-semibold text-foreground mb-4">Quick Apply</h3>
        
        {job.apply_url ? (
          <Button asChild className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/20">
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
              <Sparkles className="mr-2 h-4 w-4" />
              Apply Now
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        ) : (
          <ApplyThroughMETModal 
            jobTitle={job.title} 
            jobId={job.id}
            trigger={
              <Button className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/20">
                <Sparkles className="mr-2 h-4 w-4" />
                Apply Through MET
              </Button>
            }
          />
        )}

        <Separator className="my-4" />

        {/* Share Buttons */}
        <p className="text-sm text-muted-foreground mb-3">Share this job</p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="flex-1"
            onClick={handleEmailShare}
            aria-label="Share via email"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="flex-1"
            asChild
            aria-label="Share on LinkedIn"
          >
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="flex-1"
            asChild
            aria-label="Share on X"
          >
            <a 
              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-bold text-sm">𝕏</span>
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="flex-1"
            onClick={handleCopyLink}
            aria-label="Copy link"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Employer Card */}
      {job.employers && (
        <JobEmployerCard employer={job.employers} />
      )}

      {/* Similar Jobs */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Similar Opportunities</h3>
        
        {isLoadingSimilar ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : similarJobs.length > 0 ? (
          <div className="space-y-3">
            {similarJobs.map(simJob => (
              <Link 
                key={simJob.id}
                to={`/jobs/${simJob.slug || simJob.id}`}
                className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                  {simJob.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {simJob.employers?.company_name || regionLabels[simJob.region]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {employmentTypeLabels[simJob.employment_type]}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No similar jobs at this time.
          </p>
        )}

        <Link 
          to={`/jobs?category=${job.category}`}
          className="inline-flex items-center text-sm text-primary hover:underline mt-4"
        >
          View all {categoryLabels[job.category]} jobs
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>

      {/* MET Resources */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-6">
        <h3 className="font-semibold text-foreground mb-4">MET Resources</h3>
        
        <div className="space-y-3">
          <Link 
            to="/programs"
            className="flex items-center gap-3 p-3 rounded-lg bg-background/80 hover:bg-background transition-colors group"
          >
            <GraduationCap className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Training Programs
              </p>
              <p className="text-xs text-muted-foreground">
                Upgrade your skills
              </p>
            </div>
          </Link>
          
          <Link 
            to="/register"
            className="flex items-center gap-3 p-3 rounded-lg bg-background/80 hover:bg-background transition-colors group"
          >
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Career Support
              </p>
              <p className="text-xs text-muted-foreground">
                Get personalized help
              </p>
            </div>
          </Link>
          
          <a 
            href="https://mmf.mb.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-background/80 hover:bg-background transition-colors group"
          >
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                MMF Resources
              </p>
              <p className="text-xs text-muted-foreground">
                Métis Federation info
              </p>
            </div>
          </a>
        </div>
      </div>
    </aside>
  );
}
