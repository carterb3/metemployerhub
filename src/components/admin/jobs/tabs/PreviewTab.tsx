import { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Building2, Clock, DollarSign, Globe, Mail, Phone, User } from "lucide-react";
import { regionLabels, categoryLabels, employmentTypeLabels } from "@/hooks/useJobs";
import { locationTypeLabels, applicationMethodLabels, payPeriodLabels } from "@/types/jobs";
import type { Tag } from "@/types/jobs";
import { sanitizeHtml, isHtmlContent } from "@/lib/sanitize";

interface PreviewTabProps {
  form: UseFormReturn<any>;
  employers: Array<{ id: string; company_name: string }>;
  tags: Tag[];
}

export function PreviewTab({ form, employers, tags }: PreviewTabProps) {
  const values = form.watch();
  const employer = employers.find((e) => e.id === values.employer_id);
  const selectedTags = tags.filter((t) => values.tags?.includes(t.id));

  const formatPay = () => {
    if (!values.pay_visible || !values.pay_min) return null;
    let pay = `$${parseFloat(values.pay_min).toLocaleString()}`;
    if (values.pay_max) {
      pay += ` - $${parseFloat(values.pay_max).toLocaleString()}`;
    }
    pay += " CAD";
    if (values.pay_period) {
      pay += ` ${payPeriodLabels[values.pay_period as keyof typeof payPeriodLabels] || values.pay_period}`;
    }
    return pay;
  };

  const formatLocation = () => {
    const parts = [];
    if (values.city) parts.push(values.city);
    if (values.region) parts.push(regionLabels[values.region as keyof typeof regionLabels] || values.region);
    if (values.province) parts.push(values.province);
    return parts.join(", ") || "Location not specified";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
        This is how the job will appear on the public job board
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {values.featured && <Badge variant="default">Featured</Badge>}
              <Badge variant="outline">
                {employmentTypeLabels[values.employment_type as keyof typeof employmentTypeLabels] || values.employment_type || "Type not set"}
              </Badge>
              <Badge variant="secondary">
                {categoryLabels[values.category as keyof typeof categoryLabels] || values.category || "Category not set"}
              </Badge>
              {values.location_type && (
                <Badge variant="outline">
                  {locationTypeLabels[values.location_type as keyof typeof locationTypeLabels]}
                </Badge>
              )}
            </div>

            <CardTitle className="font-serif text-2xl md:text-3xl">
              {values.title || "Job Title"}
            </CardTitle>

            {employer && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{employer.company_name}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{formatLocation()}</span>
            </div>

            {formatPay() && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{formatPay()}</span>
              </div>
            )}

            {values.is_remote && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>Remote available</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">About This Role</h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {values.description ? (
                isHtmlContent(values.description) ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(values.description),
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{values.description}</p>
                )
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </div>
          </div>

          {/* Requirements */}
          {values.requirements && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Requirements</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{values.requirements}</p>
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          {selectedTags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* How to Apply */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">How to Apply</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-medium">
                {applicationMethodLabels[values.application_method as keyof typeof applicationMethodLabels] || "Application method not set"}
              </p>

              {values.application_method === "apply_url" && values.apply_url && (
                <a
                  href={values.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Globe className="h-3 w-3" />
                  {values.apply_url}
                </a>
              )}

              {values.application_method === "email" && values.apply_email && (
                <p className="text-sm flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {values.apply_email}
                </p>
              )}

              {values.application_method === "phone" && values.apply_phone && (
                <p className="text-sm flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {values.apply_phone}
                </p>
              )}

              {values.application_method === "apply_through_met" && (
                <p className="text-sm text-muted-foreground">
                  Submit your application through MET Employment Services
                </p>
              )}

              {values.apply_instructions && (
                <p className="text-sm text-muted-foreground mt-2">
                  {values.apply_instructions}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
