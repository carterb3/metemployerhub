import { Link } from "react-router-dom";
import { GraduationCap, Wrench, Laptop, Heart, ArrowRight, ExternalLink } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const programs = [
  {
    icon: Wrench,
    title: "Skilled Trades",
    description:
      "Apprenticeship support, pre-employment training, and certification assistance for trades careers.",
    examples: ["Carpentry", "Electrical", "Plumbing", "Heavy Equipment"],
    badge: "High Demand",
  },
  {
    icon: Laptop,
    title: "Technology & Office",
    description:
      "Training programs in computer skills, office administration, and technology careers.",
    examples: ["Microsoft Office", "Data Entry", "IT Support", "Bookkeeping"],
    badge: null,
  },
  {
    icon: Heart,
    title: "Healthcare",
    description:
      "Pathways into healthcare careers from entry-level to professional certifications.",
    examples: ["Healthcare Aide", "Medical Office", "Mental Health", "Nursing"],
    badge: "High Demand",
  },
  {
    icon: GraduationCap,
    title: "Education & Certification",
    description:
      "Support for GED completion, essential skills upgrading, and professional certifications.",
    examples: ["GED Prep", "Essential Skills", "First Aid", "Food Handler"],
    badge: null,
  },
];

const supports = [
  "Training cost coverage",
  "Living allowance during training",
  "Childcare support",
  "Transportation assistance",
  "Equipment and supplies",
  "Resume and interview coaching",
];

export default function ProgramsPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 sm:py-16">
        <div className="container-mobile">
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Programs & Career Pathways
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Explore training opportunities and career development programs
              available through MET.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/register">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="section-padding bg-background">
        <div className="container-mobile">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Training Areas
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We can help you access training in a variety of career paths based
              on your interests and goals.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {programs.map((program) => (
              <div
                key={program.title}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <program.icon className="h-6 w-6 text-primary" />
                  </div>
                  {program.badge && (
                    <Badge variant="accent">{program.badge}</Badge>
                  )}
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {program.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {program.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {program.examples.map((example) => (
                    <Badge key={example} variant="secondary">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supports */}
      <section className="section-padding bg-secondary/30">
        <div className="container-mobile">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Financial & Practical Supports
              </h2>
              <p className="text-muted-foreground mb-8">
                Depending on your situation and the program, you may be eligible
                for various supports to help you succeed in training.
              </p>
              <ul className="space-y-3">
                {supports.map((support) => (
                  <li key={support} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-foreground">{support}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-6">
                * Eligibility for supports varies by program and individual
                circumstances.
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                Ready to Explore Your Options?
              </h3>
              <p className="text-muted-foreground mb-6">
                Register with MET and speak with a career advisor about training
                programs that match your goals.
              </p>
              <Button variant="accent" size="lg" className="w-full" asChild>
                <Link to="/register">
                  Register Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* External Resources */}
      <section className="section-padding bg-background">
        <div className="container-mobile">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-8 text-center">
            Additional Resources
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <a
              href="https://www.gov.mb.ca/jec/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors"
            >
              <span className="font-medium text-foreground">
                Manitoba Job Bank
              </span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a
              href="https://www.apprenticeship.mb.ca/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors"
            >
              <span className="font-medium text-foreground">
                Apprenticeship Manitoba
              </span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a
              href="https://www.indspire.ca/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors"
            >
              <span className="font-medium text-foreground">
                Indspire Scholarships
              </span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
