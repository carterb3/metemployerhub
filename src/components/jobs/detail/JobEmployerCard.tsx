import { Building2, Globe, Mail, Phone, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

interface JobEmployerCardProps {
  employer: Tables<"employers">;
}

export function JobEmployerCard({ employer }: JobEmployerCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start gap-4">
        {/* Logo Placeholder */}
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {employer.company_name}
            </h3>
            {employer.is_partner && (
              <Badge variant="outline" className="shrink-0 text-xs">
                <BadgeCheck className="h-3 w-3 mr-1" />
                Partner
              </Badge>
            )}
          </div>

          {employer.industry && (
            <p className="text-sm text-muted-foreground mb-3">
              {employer.industry}
            </p>
          )}

          <div className="space-y-2">
            {employer.website && (
              <a 
                href={employer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                Visit Website
              </a>
            )}
            {employer.contact_email && (
              <a 
                href={`mailto:${employer.contact_email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" />
                {employer.contact_email}
              </a>
            )}
            {employer.contact_phone && (
              <a 
                href={`tel:${employer.contact_phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-3.5 w-3.5" />
                {employer.contact_phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
