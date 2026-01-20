import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon with MET branding
const createCustomIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="w-8 h-8 rounded-full ${isSelected ? "bg-accent" : "bg-primary"} border-2 border-white shadow-lg flex items-center justify-center transform ${isSelected ? "scale-125" : ""} transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        ${isSelected ? '<div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rotate-45"></div>' : ""}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export interface RegionLocation {
  name: string;
  office: string;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  areas: string[];
}

interface RegionsMapProps {
  locations: RegionLocation[];
  selectedRegion?: string | null;
  onRegionSelect?: (regionName: string | null) => void;
}

// Component to handle map view changes
function MapController({ selectedRegion, locations }: { selectedRegion: string | null; locations: RegionLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedRegion) {
      const location = locations.find((l) => l.name === selectedRegion);
      if (location) {
        map.flyTo([location.lat, location.lng], 10, { duration: 0.8 });
      }
    } else {
      // Reset to Manitoba view
      map.flyTo([54.5, -98.5], 5, { duration: 0.8 });
    }
  }, [selectedRegion, locations, map]);

  return null;
}

export function RegionsMap({ locations, selectedRegion, onRegionSelect }: RegionsMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Manitoba center coordinates
  const manitobaCenter: [number, number] = [54.5, -98.5];
  const defaultZoom = 5;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={manitobaCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController selectedRegion={selectedRegion || null} locations={locations} />
        
        {locations.map((location) => (
          <Marker
            key={location.name}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(selectedRegion === location.name)}
            eventHandlers={{
              click: () => onRegionSelect?.(location.name),
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <h3 className="font-semibold text-foreground mb-1">{location.office}</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground text-xs">{location.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <a href={`tel:${location.phone}`} className="text-xs hover:text-primary">
                      {location.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                    <a href={`mailto:${location.email}`} className="text-xs hover:text-primary">
                      {location.email}
                    </a>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Serving: {location.areas.join(", ")}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg border border-border p-3 shadow-lg z-[1000]">
        <p className="text-xs font-medium text-foreground mb-2">MET Regional Offices</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-primary border border-white shadow"></div>
          <span>{locations.length} locations across Manitoba</span>
        </div>
      </div>
    </div>
  );
}
