import { useState } from "react";
import { Search, MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RegionLocation {
  name: string;
  lat: number;
  lng: number;
}

interface PostalCodeFinderProps {
  locations: RegionLocation[];
  onRegionFound: (regionName: string) => void;
}

// Manitoba postal code prefix mappings to approximate coordinates
// FSAs (Forward Sortation Areas) for Manitoba start with R
const postalCodeCoordinates: Record<string, { lat: number; lng: number; area: string }> = {
  // Winnipeg area
  R2C: { lat: 49.9167, lng: -97.0333, area: "Winnipeg (East Kildonan)" },
  R2E: { lat: 49.9333, lng: -97.0667, area: "Winnipeg (North Kildonan)" },
  R2G: { lat: 49.95, lng: -97.0833, area: "Winnipeg (Garden City)" },
  R2H: { lat: 49.8833, lng: -97.1, area: "Winnipeg (St. Boniface)" },
  R2J: { lat: 49.8667, lng: -97.0667, area: "Winnipeg (Windsor Park)" },
  R2K: { lat: 49.9333, lng: -97.1167, area: "Winnipeg (Kildonan)" },
  R2L: { lat: 49.9167, lng: -97.1333, area: "Winnipeg (West Kildonan)" },
  R2M: { lat: 49.85, lng: -97.1, area: "Winnipeg (St. Vital)" },
  R2N: { lat: 49.8167, lng: -97.0833, area: "Winnipeg (Island Lakes)" },
  R2P: { lat: 49.95, lng: -97.15, area: "Winnipeg (Garden City)" },
  R2R: { lat: 49.9, lng: -97.25, area: "Winnipeg (Brooklands)" },
  R2V: { lat: 49.95, lng: -97.1333, area: "Winnipeg (Old Kildonan)" },
  R2W: { lat: 49.9167, lng: -97.1, area: "Winnipeg (North End)" },
  R2X: { lat: 49.9333, lng: -97.15, area: "Winnipeg (Inkster)" },
  R2Y: { lat: 49.8667, lng: -97.2667, area: "Winnipeg (Charleswood)" },
  R3A: { lat: 49.9, lng: -97.15, area: "Winnipeg (Downtown)" },
  R3B: { lat: 49.8917, lng: -97.1417, area: "Winnipeg (Exchange District)" },
  R3C: { lat: 49.8833, lng: -97.1333, area: "Winnipeg (Downtown)" },
  R3E: { lat: 49.9, lng: -97.1667, area: "Winnipeg (Health Sciences)" },
  R3G: { lat: 49.8833, lng: -97.1833, area: "Winnipeg (West End)" },
  R3H: { lat: 49.8833, lng: -97.2167, area: "Winnipeg (St. James)" },
  R3J: { lat: 49.8833, lng: -97.25, area: "Winnipeg (St. James)" },
  R3K: { lat: 49.9, lng: -97.2667, area: "Winnipeg (Crestview)" },
  R3L: { lat: 49.8667, lng: -97.15, area: "Winnipeg (River Heights)" },
  R3M: { lat: 49.85, lng: -97.1667, area: "Winnipeg (River Heights)" },
  R3N: { lat: 49.85, lng: -97.2, area: "Winnipeg (Tuxedo)" },
  R3P: { lat: 49.85, lng: -97.2333, area: "Winnipeg (Tuxedo)" },
  R3R: { lat: 49.8333, lng: -97.2667, area: "Winnipeg (Assiniboia)" },
  R3S: { lat: 49.8, lng: -97.25, area: "Winnipeg (Fort Whyte)" },
  R3T: { lat: 49.8167, lng: -97.15, area: "Winnipeg (Fort Garry)" },
  R3V: { lat: 49.8, lng: -97.1667, area: "Winnipeg (Fort Richmond)" },
  R3W: { lat: 49.8167, lng: -97.1167, area: "Winnipeg (Southdale)" },
  R3X: { lat: 49.8, lng: -97.1167, area: "Winnipeg (Sage Creek)" },
  R3Y: { lat: 49.8333, lng: -97.2, area: "Winnipeg (Waverley)" },
  R4A: { lat: 49.85, lng: -97.2833, area: "Winnipeg (Headingley)" },
  
  // Selkirk area
  R1A: { lat: 50.1333, lng: -96.8667, area: "Selkirk" },
  
  // Steinbach area
  R5G: { lat: 49.5258, lng: -96.6839, area: "Steinbach" },
  
  // Brandon area
  R7A: { lat: 49.85, lng: -99.95, area: "Brandon" },
  R7B: { lat: 49.85, lng: -99.93, area: "Brandon" },
  R7C: { lat: 49.87, lng: -99.97, area: "Brandon" },
  
  // Portage la Prairie
  R1N: { lat: 49.9728, lng: -98.2919, area: "Portage la Prairie" },
  
  // Virden
  R0M: { lat: 49.85, lng: -100.9333, area: "Virden/Southwestern MB" },
  
  // Southeast Manitoba
  R0E: { lat: 50.4, lng: -96.5, area: "Southeast Manitoba" },
  R0A: { lat: 49.4, lng: -96.5, area: "Southeast Manitoba" },
  R5A: { lat: 49.4, lng: -96.2, area: "Southeast Manitoba" },
  
  // Interlake
  R0C: { lat: 50.5, lng: -98.0, area: "Interlake" },
  
  // Dauphin/Northwest
  R7N: { lat: 51.15, lng: -100.05, area: "Dauphin" },
  R0L: { lat: 51.5, lng: -100.0, area: "Northwest Manitoba" },
  R0J: { lat: 50.5, lng: -100.0, area: "Parklands" },
  
  // The Pas
  R9A: { lat: 53.825, lng: -101.254, area: "The Pas" },
  
  // Flin Flon
  R8A: { lat: 54.767, lng: -101.876, area: "Flin Flon" },
  
  // Thompson
  R8N: { lat: 55.743, lng: -97.855, area: "Thompson" },
  
  // Northern Manitoba
  R0B: { lat: 55.0, lng: -97.5, area: "Northern Manitoba" },
};

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findClosestRegion(
  postalLat: number,
  postalLng: number,
  locations: RegionLocation[]
): { region: RegionLocation; distance: number } {
  let closest = locations[0];
  let minDistance = calculateDistance(postalLat, postalLng, closest.lat, closest.lng);

  for (const location of locations) {
    const distance = calculateDistance(postalLat, postalLng, location.lat, location.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closest = location;
    }
  }

  return { region: closest, distance: minDistance };
}

export function PostalCodeFinder({ locations, onRegionFound }: PostalCodeFinderProps) {
  const [postalCode, setPostalCode] = useState("");
  const [result, setResult] = useState<{
    regionName: string;
    distance: number;
    area: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setError(null);
    setResult(null);

    // Clean and validate postal code
    const cleaned = postalCode.toUpperCase().replace(/\s/g, "");
    
    // Manitoba postal codes start with R
    if (!cleaned.startsWith("R")) {
      setError("Please enter a Manitoba postal code (starts with R)");
      return;
    }

    if (cleaned.length < 3) {
      setError("Please enter at least the first 3 characters");
      return;
    }

    // Get the FSA (first 3 characters)
    const fsa = cleaned.substring(0, 3);
    
    setIsSearching(true);

    // Simulate a brief search delay for UX
    setTimeout(() => {
      const coords = postalCodeCoordinates[fsa];
      
      if (coords) {
        const { region, distance } = findClosestRegion(coords.lat, coords.lng, locations);
        setResult({
          regionName: region.name,
          distance: Math.round(distance),
          area: coords.area,
        });
        onRegionFound(region.name);
      } else {
        // Fallback: use general Manitoba center and find closest
        // This handles FSAs we don't have mapped
        const { region, distance } = findClosestRegion(54.5, -98.5, locations);
        setResult({
          regionName: region.name,
          distance: Math.round(distance),
          area: "Manitoba",
        });
        onRegionFound(region.name);
      }
      setIsSearching(false);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatPostalCode = (value: string) => {
    // Auto-format as user types: R1A 1A1
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length <= 3) return cleaned;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Navigation className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Find My Region</h3>
          <p className="text-sm text-muted-foreground">
            Enter your postal code to find your nearest office
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="e.g., R3C 1A8"
          value={postalCode}
          onChange={(e) => setPostalCode(formatPostalCode(e.target.value))}
          onKeyDown={handleKeyDown}
          maxLength={7}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching || postalCode.length < 3}>
          {isSearching ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Based on your location in <span className="font-medium text-foreground">{result.area}</span>
              </p>
              <p className="text-lg font-semibold text-foreground mt-1">
                Your nearest office is <span className="text-primary">{result.regionName}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Approximately {result.distance} km away
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
