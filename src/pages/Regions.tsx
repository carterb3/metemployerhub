import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

const regions = [
  {
    name: "Winnipeg",
    office: "MET Winnipeg Office",
    address: "150 Henry Avenue, Winnipeg, MB R3B 0J7",
    phone: "(204) 586-8474",
    email: "winnipeg.met@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["Winnipeg", "Selkirk", "Steinbach"],
  },
  {
    name: "Southwest",
    office: "MET Brandon Office",
    address: "123 Main Street, Brandon, MB R7A 1A1",
    phone: "(204) 726-XXXX",
    email: "brandon.met@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["Brandon", "Portage la Prairie", "Virden", "Souris"],
  },
  {
    name: "Southeast",
    office: "MET Southeast Office",
    address: "456 Centre Ave, Ste. Anne, MB R5H 1A1",
    phone: "(204) 422-XXXX",
    email: "southeast.met@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["Ste. Anne", "Lorette", "La Broquerie", "Vita"],
  },
  {
    name: "Interlake",
    office: "MET Interlake Office",
    address: "789 Main St, Gimli, MB R0C 1B0",
    phone: "(204) 642-XXXX",
    email: "interlake.met@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["Gimli", "Arborg", "Fisher Branch", "Stonewall"],
  },
  {
    name: "Northwest",
    office: "MET Dauphin Office",
    address: "321 Main St, Dauphin, MB R7N 1A1",
    phone: "(204) 638-XXXX",
    email: "dauphin.met@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["Dauphin", "Swan River", "Roblin", "Winnipegosis"],
  },
  {
    name: "The Pas & Northern",
    office: "MET The Pas Office",
    address: "654 Fischer Ave, The Pas, MB R9A 1A1",
    phone: "(204) 623-XXXX",
    email: "thepas.met@mmf.mb.ca",
    hours: "Monday–Friday, 8:30 AM – 4:30 PM",
    areas: ["The Pas", "Flin Flon", "Thompson", "Norway House"],
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
