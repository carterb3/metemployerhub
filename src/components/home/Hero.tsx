import { Link } from "react-router-dom";
import { ArrowRight, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPrairie from "@/assets/hero-prairie.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroPrairie}
          alt="Manitoba prairie landscape"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
      </div>

      {/* Content */}
      <div className="relative container-mobile py-16 sm:py-20 lg:py-28">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-6">
            <span className="text-xl">∞</span>
            <span className="text-sm font-medium text-primary-foreground/90">
              Métis Employment & Training
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight text-balance mb-6">
            Your Career Journey Starts Here
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-primary-foreground/85 max-w-xl mb-8">
            Connecting Red River Métis job seekers with employers across
            Manitoba. Get personalized support for your employment goals.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/jobs">
                <Search className="h-5 w-5" />
                Find Jobs
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/register">
                Get Career Support
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/20 grid grid-cols-3 gap-6">
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-primary-foreground">
                500+
              </p>
              <p className="text-sm text-primary-foreground/70">Active Jobs</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-primary-foreground">
                2,000+
              </p>
              <p className="text-sm text-primary-foreground/70">
                Placements Made
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-primary-foreground">
                150+
              </p>
              <p className="text-sm text-primary-foreground/70">
                Employer Partners
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
