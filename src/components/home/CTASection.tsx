import { Link } from "react-router-dom";
import { ArrowRight, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="section-padding bg-primary">
      <div className="container-mobile">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Job Seekers CTA */}
          <div className="bg-primary-foreground/10 rounded-2xl p-8 border border-primary-foreground/20">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center mb-6">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary-foreground mb-4">
              Ready to Find Your Next Role?
            </h3>
            <p className="text-primary-foreground/80 mb-6">
              Register with MET today and get connected with a career advisor
              who can help you find opportunities that match your skills and
              goals.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/register">
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Employers CTA */}
          <div className="bg-primary-foreground/5 rounded-2xl p-8 border border-primary-foreground/10">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-6">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary-foreground mb-4">
              Looking to Hire Métis Talent?
            </h3>
            <p className="text-primary-foreground/80 mb-6">
              Post your job openings and connect with qualified candidates. Our
              team can help match you with the right people for your
              organization.
            </p>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/employers">
                Post a Job
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
