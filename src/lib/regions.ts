import type { Database } from "@/integrations/supabase/types";

type Region = Database["public"]["Enums"]["manitoba_region"];

export const REGION_LABELS: Record<Region, string> = {
  winnipeg: "Winnipeg",
  southeast: "Southeast",
  interlake: "Interlake",
  parklands: "Parklands",
  northwest: "Northwest",
  the_pas: "The Pas",
  thompson: "Thompson",
  swan_river: "Swan River",
  southwest: "Southwest",
  beyond_borders: "Beyond Borders",
};

export function formatRegion(region: Region): string {
  return REGION_LABELS[region] || region;
}
