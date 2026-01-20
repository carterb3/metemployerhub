import { useState } from "react";
import { format } from "date-fns";
import { ArrowRight, Building2, Mail, Phone, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useConvertInquiryToEmployer, 
  type EmployerInquiryWithConversion 
} from "@/hooks/useEmployerCRM";

const inquiryTypeLabels: Record<string, string> = {
  job_posting: "Job Posting",
  candidate_request: "Candidate Request",
  partnership: "Partnership",
  general: "General Inquiry",
};

interface ConvertInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiries: EmployerInquiryWithConversion[];
}

export function ConvertInquiryDialog({ open, onOpenChange, inquiries }: ConvertInquiryDialogProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<EmployerInquiryWithConversion | null>(null);
  const convertMutation = useConvertInquiryToEmployer();

  const handleConvert = async () => {
    if (!selectedInquiry) return;
    
    try {
      await convertMutation.mutateAsync(selectedInquiry);
      setSelectedInquiry(null);
      if (inquiries.length <= 1) {
        onOpenChange(false);
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Convert Inquiry to Employer</DialogTitle>
          <DialogDescription>
            Select an inquiry to convert into an employer record. This will create a new employer profile with the inquiry's contact information.
          </DialogDescription>
        </DialogHeader>

        {selectedInquiry ? (
          <div className="space-y-4">
            <div className="bg-secondary rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-2">{selectedInquiry.company_name}</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Contact:</span>
                  <span>{selectedInquiry.contact_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedInquiry.contact_email}</span>
                </div>
                {selectedInquiry.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedInquiry.contact_phone}</span>
                  </div>
                )}
                {selectedInquiry.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedInquiry.website}</span>
                  </div>
                )}
              </div>
              {selectedInquiry.message && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">{selectedInquiry.message}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 py-4">
              <div className="text-center">
                <Badge variant="outline">Inquiry</Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {inquiryTypeLabels[selectedInquiry.inquiry_type]}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <Badge>Employer Record</Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: Prospect
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                Back
              </Button>
              <Button 
                onClick={handleConvert}
                disabled={convertMutation.isPending}
              >
                <Building2 className="mr-2 h-4 w-4" />
                {convertMutation.isPending ? "Converting..." : "Convert to Employer"}
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {inquiries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending inquiries to convert.
                </p>
              ) : (
                inquiries.map((inquiry) => (
                  <button
                    key={inquiry.id}
                    onClick={() => setSelectedInquiry(inquiry)}
                    className="w-full text-left p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium">{inquiry.company_name}</h4>
                        <p className="text-sm text-muted-foreground">{inquiry.contact_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {inquiry.contact_email}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {inquiryTypeLabels[inquiry.inquiry_type]}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
