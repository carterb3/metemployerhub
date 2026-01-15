import { Link } from "react-router-dom";
import {
  Search,
  UserPlus,
  Building2,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pathways = [
  {
    icon: Search,
    title: "Find a Job",
    description:
      "Browse current openings from employers across Manitoba. Filter by region, category, and job type.",
    href: "/jobs",
    color: "primary" as const,
  },
  {
    icon: UserPlus,
    title: "Get Help / Register",
    description:
      "Connect with MET staff for personalized career support, resume help, and job matching services.",
    href: "/register",
    color: "accent" as const,
  },
  {
    icon: Building2,
    title: "For Employers",
    description:
      "Post job opportunities and access our network of qualified Métis candidates ready to work.",
    href: "/employers",
    color: "success" as const,
  },
  {
    icon: GraduationCap,
    title: "Programs & Training",
    description:
      "Explore training programs, certifications, and career pathways to advance your skills.",
    href: "/programs",
    color: "primary" as const,
  },
];

const colorStyles = {
  primary: {
    icon: "bg-primary/10 text-primary",
    hover: "group-hover:bg-primary group-hover:text-primary-foreground",
  },
  accent: {
    icon: "bg-accent/10 text-accent",
    hover: "group-hover:bg-accent group-hover:text-accent-foreground",
  },
  success: {
    icon: "bg-success/10 text-success",
    hover: "group-hover:bg-success group-hover:text-success-foreground",
  },
};

export function PathwayCards() {
  return (
    <section className="section-padding bg-background metis-pattern">
      <div className="container-mobile">
        <div className="text-center mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
            How Can We Help You?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you're looking for work, hiring, or developing your career,
            MET is here to support your journey.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pathways.map((pathway) => (
            <Link
              key={pathway.title}
              to={pathway.href}
              className="group relative bg-card rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300",
                  colorStyles[pathway.color].icon,
                  colorStyles[pathway.color].hover
                )}
              >
                <pathway.icon className="h-6 w-6" />
              </div>

              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                {pathway.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {pathway.description}
              </p>

              <div className="flex items-center text-sm font-medium text-primary group-hover:text-accent transition-colors">
                Learn more
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
