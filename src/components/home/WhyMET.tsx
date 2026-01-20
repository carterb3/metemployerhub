import { Shield, Users, MapPin, Heart } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Trusted Support",
    description:
      "Work with dedicated staff who understand your needs and provide personalized career guidance.",
  },
  {
    icon: Users,
    title: "Community Connection",
    description:
      "Join a network of Métis professionals and employers committed to community success.",
  },
  {
    icon: MapPin,
    title: "Province-Wide Reach",
    description:
      "Access opportunities across Manitoba, from Winnipeg to rural and northern communities.",
  },
  {
    icon: Heart,
    title: "Strengths-Based Approach",
    description:
      "We focus on your skills and potential, helping you showcase what you bring to employers.",
  },
];

export function WhyMET() {
  return (
    <section className="section-padding bg-background">
      <div className="container-mobile">
        <div className="text-center mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Why Work with MET?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            For over 20 years, we've helped Red River Métis citizens find meaningful
            employment and build lasting careers.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
