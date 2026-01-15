import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data - will be replaced with real data from Supabase
const featuredJobs = [
  {
    id: "1",
    title: "Administrative Assistant",
    company: "Manitoba Hydro",
    location: "Winnipeg, MB",
    type: "Full-time",
    salary: "$45,000 - $52,000",
    isRemote: false,
    isNew: true,
    postedDate: "2 days ago",
  },
  {
    id: "2",
    title: "Heavy Equipment Operator",
    company: "Northern Construction Ltd.",
    location: "Thompson, MB",
    type: "Full-time",
    salary: "$32 - $38/hour",
    isRemote: false,
    isNew: true,
    postedDate: "1 day ago",
  },
  {
    id: "3",
    title: "Customer Service Representative",
    company: "Red River Mutual",
    location: "Remote",
    type: "Full-time",
    salary: "$40,000 - $48,000",
    isRemote: true,
    isNew: false,
    postedDate: "5 days ago",
  },
  {
    id: "4",
    title: "Carpenter Apprentice",
    company: "Prairies Builders Co-op",
    location: "Brandon, MB",
    type: "Full-time",
    salary: "$22 - $28/hour",
    isRemote: false,
    isNew: false,
    postedDate: "1 week ago",
  },
];

export function FeaturedJobs() {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-mobile">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Featured Opportunities
            </h2>
            <p className="text-muted-foreground">
              Recent job postings from our employer partners
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/jobs">
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {featuredJobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="group bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {job.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {job.isNew && <Badge variant="new">New</Badge>}
                  {job.isRemote && <Badge variant="remote">Remote</Badge>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.type}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {job.postedDate}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {job.salary}
                </span>
                <span className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  View Details
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
