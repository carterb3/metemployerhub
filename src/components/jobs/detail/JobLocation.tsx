import { MapPin, Navigation, Building, Home } from "lucide-react";
import { regionLabels } from "@/hooks/useJobs";
import type { Job } from "@/hooks/useJobs";

interface JobLocationProps {
  job: Job;
}

const locationTypeLabels: Record<string, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

const locationTypeIcons: Record<string, React.ReactNode> = {
  onsite: <Building className="h-4 w-4" />,
  hybrid: <Navigation className="h-4 w-4" />,
  remote: <Home className="h-4 w-4" />,
};

export function JobLocation({ job }: JobLocationProps) {
  const fullAddress = [
    job.address,
    job.city,
    job.province,
    job.postal_code
  ].filter(Boolean).join(', ');

  const regionLabel = regionLabels[job.region] || job.region;
  const locationTypeLabel = locationTypeLabels[job.location_type] || job.location_type;

  return (
    <section className="bg-card rounded-xl border border-border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Location
        </h2>
      </div>

      <div className="space-y-4">
        {/* Location Type Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-foreground">
            {locationTypeIcons[job.location_type]}
            {locationTypeLabel}
          </span>
          {job.is_remote && job.location_type !== 'remote' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-sm font-medium text-success">
              <Home className="h-4 w-4" />
              Remote Option
            </span>
          )}
        </div>

        {/* Region */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Region</p>
          <p className="text-foreground font-medium">{regionLabel}, Manitoba</p>
        </div>

        {/* Full Address if available */}
        {fullAddress && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Address</p>
            <p className="text-foreground">{fullAddress}</p>
          </div>
        )}

        {/* Simple Map Placeholder */}
      </div>
    </section>
  );
}
