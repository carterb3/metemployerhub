import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

const regions = [
  {
    name: "Winnipeg",
    office: "Winnipeg MET",
    address: "412 - 200 Main Street, Winnipeg, MB R3C 1A8",
    phone: "204-586-8474 ext. 2796",
    email: "WPGMET@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["Winnipeg", "Selkirk", "Steinbach"],
  },
  {
    name: "Southwest",
    office: "Southwest MET",
    address: "656 6th Street, Brandon, MB R7A 3P1",
    phone: "204-725-7525",
    email: "SWMET@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["Brandon", "Portage la Prairie", "Virden", "Souris"],
  },
  {
    name: "Southeast",
    office: "Southeast MET",
    address: "56 Parkview Avenue, Grand Marais, MB R0E 0T0",
    phone: "204-754-3112",
    email: "SEMET@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["Ste. Anne", "Lorette", "La Broquerie", "Grand Marais"],
  },
  {
    name: "Interlake",
    office: "Interlake MET",
    address: "28 St. Laurent Drive, St. Laurent, MB R0C 2S0",
    phone: "204-646-4091",
    email: "INTMET@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["St. Laurent", "Gimli", "Arborg", "Fisher Branch"],
  },
  {
    name: "Northwest",
    office: "Northwest MET",
    address: "422 Main Street South, Dauphin, MB R7N 1K9",
    phone: "204-638-9485",
    email: "NWMET@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["Dauphin", "Roblin", "Winnipegosis", "Ste. Rose"],
  },
  {
    name: "The Pas",
    office: "The Pas MET",
    address: "456 Fisher Avenue, The Pas, MB R9A 1M2",
    phone: "204-623-5701",
    email: "PASMET@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["The Pas", "Flin Flon", "Cranberry Portage"],
  },
  {
    name: "Thompson",
    office: "Thompson MET",
    address: "171 Cree Road, Thompson, MB R8N 0C2",
    phone: "204-677-1430",
    email: "THOMET@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["Thompson", "Norway House", "Cross Lake"],
  },
];

export default function RegionsPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 sm:py-16">
        <div className="container-mobile">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Regional Offices & Contacts
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            MET has offices across Manitoba to serve Red River Métis job seekers and
            employers in every region.
          </p>
        </div>
      </section>

      {/* Regions Grid */}
      <section className="section-padding bg-background">
        <div className="container-mobile">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <div
                key={region.name}
                className="bg-card rounded-xl border border-border p-6"
              >
                <h2 className="font-serif text-xl font-bold text-foreground mb-1">
                  {region.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {region.office}
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{region.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <a
                      href={`tel:${region.phone}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {region.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <a
                      href={`mailto:${region.email}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {region.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{region.hours}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    Serving communities including:
                  </p>
                  <p className="text-sm text-foreground">
                    {region.areas.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="section-padding bg-secondary/30">
        <div className="container-mobile">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              Find Your Nearest Office
            </h2>
            <p className="text-muted-foreground mb-8">
              Not sure which region you're in? Enter your postal code when you
              register and we'll connect you with the right office.
            </p>
            <div className="aspect-video max-w-4xl mx-auto bg-muted rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">
                Interactive map coming soon
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
