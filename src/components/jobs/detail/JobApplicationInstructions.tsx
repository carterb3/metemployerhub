import { Link } from "react-router-dom";
import { 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplyThroughMETModal } from "./ApplyThroughMETModal";
import type { Job } from "@/hooks/useJobs";

interface JobApplicationInstructionsProps {
  job: Job;
}

export function JobApplicationInstructions({ job }: JobApplicationInstructionsProps) {
  const renderApplyButton = () => {
    switch (job.application_method) {
      case 'apply_url':
        return job.apply_url ? (
          <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground shadow-lg shadow-accent/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5">
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
              <Sparkles className="mr-2 h-4 w-4" />
              Apply Now
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        ) : null;

      case 'email':
        return job.apply_email ? (
          <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70">
            <a href={`mailto:${job.apply_email}?subject=Application for ${job.title}`}>
              <Mail className="mr-2 h-4 w-4" />
              Apply via Email
            </a>
          </Button>
        ) : null;

      case 'phone':
        return job.apply_phone ? (
          <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70">
            <a href={`tel:${job.apply_phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call to Apply
            </a>
          </Button>
        ) : null;

      case 'in_person':
        return (
          <Button size="lg" disabled className="w-full sm:w-auto">
            <MapPin className="mr-2 h-4 w-4" />
            Apply In Person
          </Button>
        );

      case 'apply_through_met':
      default:
        return (
          <ApplyThroughMETModal 
            jobTitle={job.title} 
            jobId={job.id}
            trigger={
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5">
                <Sparkles className="mr-2 h-4 w-4" />
                Apply Through MET
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            }
          />
        );
    }
  };

  return (
    <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-xl border border-primary/20 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-accent/10 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-accent" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          How to Apply
        </h2>
      </div>

      {/* MET Partnership Message */}
      {job.apply_through_met && (
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">
                Apply Through Métis Employment & Training
              </p>
              <p className="text-sm text-muted-foreground">
                This employer partners with MET. Register with us to apply and receive 
                personalized support throughout the hiring process, including resume 
                assistance and interview preparation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Application Instructions */}
      {job.apply_instructions && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Application Instructions
          </h3>
          <p className="text-foreground whitespace-pre-wrap">
            {job.apply_instructions}
          </p>
        </div>
      )}

      {/* Contact Details */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        {job.apply_email && (
          <a 
            href={`mailto:${job.apply_email}`}
            className="flex items-center gap-1.5 text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            {job.apply_email}
          </a>
        )}
        {job.apply_phone && (
          <a 
            href={`tel:${job.apply_phone}`}
            className="flex items-center gap-1.5 text-primary hover:underline"
          >
            <Phone className="h-4 w-4" />
            {job.apply_phone}
          </a>
        )}
      </div>

      {/* Apply Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        {renderApplyButton()}
        
        {!job.apply_through_met && (
          <ApplyThroughMETModal 
            jobTitle={job.title} 
            jobId={job.id}
            trigger={
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Or Apply Through MET
              </Button>
            }
          />
        )}
      </div>

      {/* Expiry Notice */}
      {job.expires_at && (
        <p className="text-sm text-muted-foreground mt-4">
          ⏰ Applications close on {new Date(job.expires_at).toLocaleDateString('en-CA', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
      )}
    </section>
  );
}
