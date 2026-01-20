import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useEmployerInquiries,
  useUpdateInquiryStatus,
  useAssignInquiry,
} from "@/hooks/useEmployerInquiries";
import { useStaffMembers } from "@/hooks/useIntakes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Download, Loader2, ExternalLink, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";
import { AttachmentPreviewCard } from "@/components/admin/inquiries/AttachmentPreviewCard";

type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];
type Region = Database["public"]["Enums"]["manitoba_region"];
type EmployerInquiry = Database["public"]["Tables"]["employer_inquiries"]["Row"] & {
  attachment_url?: string | null;
  attachment_filename?: string | null;
};

const statusColors: Record<InquiryStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-border",
};

export default function EmployerInquiriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
  const [regionFilter, setRegionFilter] = useState<Region | "all">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<EmployerInquiry | null>(null);

  const { data: inquiries = [], isLoading } = useEmployerInquiries({
    status: statusFilter === "all" ? undefined : statusFilter,
    region: regionFilter === "all" ? undefined : regionFilter,
    search: search || undefined,
  });

  const { data: staffMembers = [] } = useStaffMembers();
  const updateStatus = useUpdateInquiryStatus();
  const assignInquiry = useAssignInquiry();

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Company Name",
      "Contact Name",
      "Contact Email",
      "Contact Phone",
      "Inquiry Type",
      "Region",
      "Status",
      "Created At",
      "Job Title",
      "Employment Type",
      "Positions Count",
    ];

    const rows = inquiries.map((inquiry) => [
      inquiry.id,
      inquiry.company_name,
      inquiry.contact_name,
      inquiry.contact_email,
      inquiry.contact_phone || "",
      inquiry.inquiry_type,
      inquiry.region || "",
      inquiry.status,
      format(new Date(inquiry.created_at), "yyyy-MM-dd"),
      inquiry.job_title || "",
      inquiry.employment_type || "",
      inquiry.positions_count || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `employer-inquiries-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Employer Inquiries
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage employer partnership requests
            </p>
          </div>
          <Button onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter and search inquiry records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search company or contact..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as InquiryStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Constants.public.Enums.inquiry_status.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={regionFilter}
                onValueChange={(value) =>
                  setRegionFilter(value as Region | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {Constants.public.Enums.manitoba_region.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No inquiries found matching your criteria
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{inquiry.company_name}</p>
                          {inquiry.website && (
                            <a
                              href={inquiry.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              Website
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{inquiry.contact_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {inquiry.contact_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {inquiry.inquiry_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={inquiry.status}
                          onValueChange={(value) =>
                            updateStatus.mutate({
                              id: inquiry.id,
                              status: value as InquiryStatus,
                            })
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <Badge
                              variant="outline"
                              className={statusColors[inquiry.status]}
                            >
                              {inquiry.status.replace("_", " ")}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Constants.public.Enums.inquiry_status.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={inquiry.assigned_to || "unassigned"}
                          onValueChange={(value) =>
                            assignInquiry.mutate({
                              inquiryId: inquiry.id,
                              assignedTo: value === "unassigned" ? null : value,
                            })
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>
                            {staffMembers.map((staff) => (
                              <SelectItem
                                key={staff.user_id}
                                value={staff.user_id}
                              >
                                {staff.full_name || staff.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {(inquiry as any).attachment_url && (
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInquiry(inquiry as EmployerInquiry)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Inquiry Detail Dialog */}
        <Dialog
          open={!!selectedInquiry}
          onOpenChange={() => setSelectedInquiry(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedInquiry?.company_name}</DialogTitle>
              <DialogDescription>
                {selectedInquiry?.inquiry_type.replace("_", " ")} inquiry from{" "}
                {selectedInquiry?.contact_name}
              </DialogDescription>
            </DialogHeader>
            {selectedInquiry && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Email</p>
                    <a
                      href={`mailto:${selectedInquiry.contact_email}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {selectedInquiry.contact_email}
                    </a>
                  </div>
                  {selectedInquiry.contact_phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Contact Phone
                      </p>
                      <a
                        href={`tel:${selectedInquiry.contact_phone}`}
                        className="font-medium hover:underline"
                      >
                        {selectedInquiry.contact_phone}
                      </a>
                    </div>
                  )}
                  {selectedInquiry.region && (
                    <div>
                      <p className="text-sm text-muted-foreground">Region</p>
                      <p className="font-medium">{selectedInquiry.region}</p>
                    </div>
                  )}
                  {selectedInquiry.job_title && (
                    <div>
                      <p className="text-sm text-muted-foreground">Job Title</p>
                      <p className="font-medium">{selectedInquiry.job_title}</p>
                    </div>
                  )}
                  {selectedInquiry.employment_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Employment Type
                      </p>
                      <p className="font-medium">
                        {selectedInquiry.employment_type.replace("_", " ")}
                      </p>
                    </div>
                  )}
                  {selectedInquiry.positions_count && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Positions Count
                      </p>
                      <p className="font-medium">
                        {selectedInquiry.positions_count}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Message</p>
                  <p className="text-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                    {selectedInquiry.message}
                  </p>
                </div>

                {selectedInquiry.job_description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Job Description
                    </p>
                    <p className="text-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                      {selectedInquiry.job_description}
                    </p>
                  </div>
                )}

                {selectedInquiry.attachment_url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Attached File
                    </p>
                    <AttachmentPreviewCard
                      attachmentUrl={selectedInquiry.attachment_url}
                      attachmentFilename={selectedInquiry.attachment_filename || null}
                    />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
