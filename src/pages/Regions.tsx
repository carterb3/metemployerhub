import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { RegionsMap, type RegionLocation } from "@/components/regions/RegionsMap";
import { cn } from "@/lib/utils";

const regions: RegionLocation[] = [
  {
    name: "Winnipeg",
    office: "Winnipeg MET",
    address: "412 - 200 Main Street, Winnipeg, MB R3C 1A8",
    phone: "204-586-8474 ext. 2796",
    email: "WPGMET@mmf.mb.ca",
    lat: 49.8954,
    lng: -97.1385,
    areas: ["Winnipeg", "Selkirk", "Steinbach"],
  },
  {
    name: "Southwest",
    office: "Southwest MET",
    address: "656 6th Street, Brandon, MB R7A 3P1",
    phone: "204-725-7525",
    email: "SWMET@mmf.mb.ca",
    lat: 49.8485,
    lng: -99.9501,
    areas: ["Brandon", "Portage la Prairie", "Virden", "Souris"],
  },
  {
    name: "Southeast",
    office: "Southeast MET",
    address: "56 Parkview Avenue, Grand Marais, MB R0E 0T0",
    phone: "204-754-3112",
    email: "SEMET@mmf.mb.ca",
    lat: 50.5167,
    lng: -96.5833,
    areas: ["Ste. Anne", "Lorette", "La Broquerie", "Grand Marais"],
  },
  {
    name: "Interlake",
    office: "Interlake MET",
    address: "28 St. Laurent Drive, St. Laurent, MB R0C 2S0",
    phone: "204-646-4091",
    email: "INTMET@mmf.mb.ca",
    lat: 50.4333,
    lng: -98.3667,
    areas: ["St. Laurent", "Gimli", "Arborg", "Fisher Branch"],
  },
  {
    name: "Northwest",
    office: "Northwest MET",
    address: "422 Main Street South, Dauphin, MB R7N 1K9",
    phone: "204-638-9485",
    email: "NWMET@mmf.mb.ca",
    lat: 51.1493,
    lng: -100.0498,
    areas: ["Dauphin", "Roblin", "Winnipegosis", "Ste. Rose"],
  },
  {
    name: "The Pas",
    office: "The Pas MET",
    address: "456 Fisher Avenue, The Pas, MB R9A 1M2",
    phone: "204-623-5701",
    email: "PASMET@mmf.mb.ca",
    lat: 53.8251,
    lng: -101.2543,
    areas: ["The Pas", "Flin Flon", "Cranberry Portage"],
  },
  {
    name: "Thompson",
    office: "Thompson MET",
    address: "171 Cree Road, Thompson, MB R8N 0C2",
    phone: "204-677-1430",
    email: "THOMET@mmf.mb.ca",
    lat: 55.7433,
    lng: -97.8553,
    areas: ["Thompson", "Norway House", "Cross Lake"],
  },
];

export default function RegionsPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(selectedRegion === regionName ? null : regionName);
  };

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

      {/* Interactive Map */}
      <section className="section-padding bg-secondary/30">
        <div className="container-mobile">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
              Find Your Nearest Office
            </h2>
            <p className="text-muted-foreground">
              Click on a marker or region card to view office details
            </p>
          </div>
          <div className="h-[400px] sm:h-[500px] max-w-5xl mx-auto">
            <RegionsMap
              locations={regions}
              selectedRegion={selectedRegion}
              onRegionSelect={setSelectedRegion}
            />
          </div>
        </div>
      </section>

      {/* Regions Grid */}
      <section className="section-padding bg-background">
        <div className="container-mobile">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <button
                key={region.name}
                onClick={() => handleRegionClick(region.name)}
                className={cn(
                  "bg-card rounded-xl border p-6 text-left transition-all duration-200",
                  selectedRegion === region.name
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                )}
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
                      onClick={(e) => e.stopPropagation()}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {region.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <a
                      href={`mailto:${region.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {region.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Monday–Friday, 8:30 AM – 4:30 PM</span>
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
              </button>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
