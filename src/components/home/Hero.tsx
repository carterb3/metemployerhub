import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroPrairie from "@/assets/hero-prairie.jpg";

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/jobs");
    }
  };

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroPrairie}
          alt="Manitoba prairie landscape at sunset"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/60" />
        {/* Subtle animated particles/dots overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-foreground/40 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-primary-foreground/30 rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-primary-foreground/50 rounded-full animate-pulse delay-700" />
        </div>
      </div>

      {/* Content */}
      <div className="relative container-mobile py-16 sm:py-20 lg:py-28 w-full">
        <div className="max-w-3xl animate-fade-in">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6">
            <span className="text-xl" aria-hidden="true">∞</span>
            <span className="text-sm font-medium text-primary-foreground/90">
              Métis Employment & Training
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground leading-tight text-balance mb-6">
            Empowering Red River Métis Careers Across Our Homeland
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-primary-foreground/85 max-w-2xl mb-8">
            Find training, jobs, and personalized support to achieve your
            employment goals. Connecting our community with opportunities
            across Manitoba.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search jobs by title, keyword, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-background/95 backdrop-blur-sm border-0 text-base shadow-lg focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
                  aria-label="Search jobs"
                />
              </div>
              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="h-14 px-8 shadow-lg"
              >
                Search Jobs
              </Button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button variant="hero-outline" size="lg" asChild className="group">
              <Link to="/jobs">
                <Search className="h-5 w-5 mr-2" />
                Browse All Jobs
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild className="group">
              <Link to="/register">
                <Users className="h-5 w-5 mr-2" />
                Create Employer Profile
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild className="group">
              <Link to="/programs">
                <GraduationCap className="h-5 w-5 mr-2" />
                Explore Training
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
