import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useEmployerInquiries,
  useUpdateInquiryStatus,
  useAssignInquiry,
} from "@/hooks/useEmployerInquiries";
import { useStaffMembers } from "@/hooks/useIntakes";
import { useConvertInquiryToEmployer } from "@/hooks/useEmployerCRM";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Download,
  Loader2,
  ExternalLink,
  Paperclip,
  Building2,
  XCircle,
  CheckCircle2,
  Clock,
  Inbox,
  AlertTriangle,
  Mail,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";
import { AttachmentPreviewCard } from "@/components/admin/inquiries/AttachmentPreviewCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatRegion } from "@/lib/regions";
import { toast } from "sonner";

type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];
type Region = Database["public"]["Enums"]["manitoba_region"];
type EmployerInquiry = Database["public"]["Tables"]["employer_inquiries"]["Row"];

const statusColors: Record<InquiryStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const statusIcons: Record<InquiryStatus, React.ReactNode> = {
  new: <Inbox className="h-4 w-4" />,
  in_progress: <Clock className="h-4 w-4" />,
  resolved: <CheckCircle2 className="h-4 w-4" />,
  closed: <XCircle className="h-4 w-4" />,
};

const inquiryTypeLabels: Record<string, string> = {
  job_posting: "Job Posting",
  candidate_request: "Candidate Request",
  partnership: "Partnership",
  general: "General Inquiry",
};

export default function EmployerInquiriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
  const [regionFilter, setRegionFilter] = useState<Region | "all">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<EmployerInquiry | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingInquiry, setRejectingInquiry] = useState<EmployerInquiry | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approvingInquiry, setApprovingInquiry] = useState<EmployerInquiry | null>(null);

  const { data: inquiries = [], isLoading } = useEmployerInquiries({
    status: statusFilter === "all" ? undefined : statusFilter,
    region: regionFilter === "all" ? undefined : regionFilter,
    search: search || undefined,
  });

  // Fetch all inquiries for stats (unfiltered)
  const { data: allInquiries = [] } = useEmployerInquiries({});

  const { data: staffMembers = [] } = useStaffMembers();
  const updateStatus = useUpdateInquiryStatus();
  const assignInquiry = useAssignInquiry();
  const convertMutation = useConvertInquiryToEmployer();

  const stats = {
    new: allInquiries.filter((i) => i.status === "new").length,
    in_progress: allInquiries.filter((i) => i.status === "in_progress").length,
    resolved: allInquiries.filter((i) => i.status === "resolved").length,
    closed: allInquiries.filter((i) => i.status === "closed").length,
    total: allInquiries.length,
  };

  const handleReject = (inquiry: EmployerInquiry) => {
    setRejectingInquiry(inquiry);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (!rejectingInquiry) return;
    updateStatus.mutate(
      {
        id: rejectingInquiry.id,
        status: "closed",
        rejection_reason: rejectionReason || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Rejected inquiry from ${rejectingInquiry.company_name}`);
          setRejectDialogOpen(false);
          setRejectingInquiry(null);
          setSelectedInquiry(null);
        },
      }
    );
  };

  const handleApprove = (inquiry: EmployerInquiry) => {
    setApprovingInquiry(inquiry);
    setApproveDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!approvingInquiry) return;
    try {
      await convertMutation.mutateAsync(approvingInquiry as any);
      toast.success(`Approved and converted ${approvingInquiry.company_name} to employer`);
      setApproveDialogOpen(false);
      setApprovingInquiry(null);
      setSelectedInquiry(null);
    } catch {
      // Error handled in hook
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID", "Company Name", "Contact Name", "Contact Email", "Contact Phone",
      "Inquiry Type", "Region", "Status", "Created At", "Job Title",
      "Employment Type", "Positions Count",
    ];

    const rows = inquiries.map((inquiry) => [
      inquiry.id, inquiry.company_name, inquiry.contact_name,
      inquiry.contact_email, inquiry.contact_phone || "",
      inquiry.inquiry_type, inquiry.region || "", inquiry.status,
      format(new Date(inquiry.created_at), "yyyy-MM-dd"),
      inquiry.job_title || "", inquiry.employment_type || "",
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

  const canActOn = (inquiry: EmployerInquiry) =>
    inquiry.status !== "closed" && !inquiry.converted_to_employer_id;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Employer Inquiries
            </h1>
            <p className="text-muted-foreground mt-1">
              Review, approve, or reject employer partnership requests
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === "new" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setStatusFilter(statusFilter === "new" ? "all" : "new")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Inbox className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-xs text-muted-foreground">New</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === "in_progress" ? "ring-2 ring-warning" : ""}`}
            onClick={() => setStatusFilter(statusFilter === "in_progress" ? "all" : "in_progress")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.in_progress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === "resolved" ? "ring-2 ring-success" : ""}`}
            onClick={() => setStatusFilter(statusFilter === "resolved" ? "all" : "resolved")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === "closed" ? "ring-2 ring-muted-foreground" : ""}`}
            onClick={() => setStatusFilter(statusFilter === "closed" ? "all" : "closed")}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.closed}</p>
                <p className="text-xs text-muted-foreground">Rejected/Closed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
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
                onValueChange={(value) => setStatusFilter(value as InquiryStatus | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Constants.public.Enums.inquiry_status.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "resolved" ? "Approved" : status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={regionFilter}
                onValueChange={(value) => setRegionFilter(value as Region | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {Constants.public.Enums.manitoba_region.map((region) => (
                    <SelectItem key={region} value={region}>
                      {formatRegion(region)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {statusFilter !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("all"); setRegionFilter("all"); setSearch(""); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow
                      key={inquiry.id}
                      className={inquiry.status === "new" ? "bg-primary/[0.02]" : ""}
                    >
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
                              Website <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{inquiry.contact_name}</p>
                          <p className="text-sm text-muted-foreground">{inquiry.contact_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {inquiryTypeLabels[inquiry.inquiry_type] || inquiry.inquiry_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[inquiry.status]}>
                          <span className="flex items-center gap-1.5">
                            {statusIcons[inquiry.status]}
                            {inquiry.status === "resolved" ? "Approved" : inquiry.status.replace("_", " ")}
                          </span>
                        </Badge>
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
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {staffMembers.map((staff) => (
                              <SelectItem key={staff.user_id} value={staff.user_id}>
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
                        {inquiry.attachment_url && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Paperclip className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{inquiry.attachment_filename || "Attachment"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {canActOn(inquiry) && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                                      onClick={() => handleApprove(inquiry)}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Approve & convert to employer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleReject(inquiry)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Reject inquiry</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Inquiry Detail Dialog */}
        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {selectedInquiry && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <DialogTitle className="text-xl">{selectedInquiry.company_name}</DialogTitle>
                      <DialogDescription>
                        {inquiryTypeLabels[selectedInquiry.inquiry_type] || selectedInquiry.inquiry_type} — submitted {format(new Date(selectedInquiry.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </DialogDescription>
                    </div>
                    <Badge variant="outline" className={`${statusColors[selectedInquiry.status]} shrink-0`}>
                      <span className="flex items-center gap-1.5">
                        {statusIcons[selectedInquiry.status]}
                        {selectedInquiry.status === "resolved" ? "Approved" : selectedInquiry.status.replace("_", " ")}
                      </span>
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="space-y-5">
                  {/* Contact Info Card */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact Information</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a href={`mailto:${selectedInquiry.contact_email}`} className="text-sm text-primary hover:underline truncate">
                            {selectedInquiry.contact_email}
                          </a>
                        </div>
                        {selectedInquiry.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                            <a href={`tel:${selectedInquiry.contact_phone}`} className="text-sm hover:underline">
                              {selectedInquiry.contact_phone}
                            </a>
                          </div>
                        )}
                        {selectedInquiry.website && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                            <a href={selectedInquiry.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                              {selectedInquiry.website}
                            </a>
                          </div>
                        )}
                        {selectedInquiry.business_type && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm">{selectedInquiry.business_type}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Job Details */}
                  {(selectedInquiry.job_title || selectedInquiry.employment_type || selectedInquiry.positions_count || selectedInquiry.region) && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Job Details</h4>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          {selectedInquiry.job_title && (
                            <div>
                              <span className="text-muted-foreground">Title:</span>{" "}
                              <span className="font-medium">{selectedInquiry.job_title}</span>
                            </div>
                          )}
                          {selectedInquiry.region && (
                            <div>
                              <span className="text-muted-foreground">Region:</span>{" "}
                              <span className="font-medium">{formatRegion(selectedInquiry.region)}</span>
                            </div>
                          )}
                          {selectedInquiry.employment_type && (
                            <div>
                              <span className="text-muted-foreground">Type:</span>{" "}
                              <span className="font-medium capitalize">{selectedInquiry.employment_type.replace("_", " ")}</span>
                            </div>
                          )}
                          {selectedInquiry.positions_count && (
                            <div>
                              <span className="text-muted-foreground">Positions:</span>{" "}
                              <span className="font-medium">{selectedInquiry.positions_count}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Message */}
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Message</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                      {selectedInquiry.message}
                    </p>
                  </div>

                  {/* Job Description */}
                  {selectedInquiry.job_description && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Job Description</h4>
                      <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                        {selectedInquiry.job_description}
                      </p>
                    </div>
                  )}

                  {/* Attachment */}
                  {selectedInquiry.attachment_url && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Attached File</h4>
                      <AttachmentPreviewCard
                        attachmentUrl={selectedInquiry.attachment_url}
                        attachmentFilename={selectedInquiry.attachment_filename || null}
                      />
                    </div>
                  )}

                  {/* Rejection reason if closed */}
                  {selectedInquiry.status === "closed" && (selectedInquiry as any).rejection_reason && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Rejection Reason</p>
                        <p className="text-sm text-muted-foreground mt-1">{(selectedInquiry as any).rejection_reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Converted badge */}
                  {selectedInquiry.converted_to_employer_id && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <p className="text-sm font-medium text-success">
                        Approved & converted to employer record
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                {canActOn(selectedInquiry) && (
                  <DialogFooter className="mt-4 pt-4 border-t gap-2 sm:gap-2">
                    <Select
                      value={selectedInquiry.status}
                      onValueChange={(value) =>
                        updateStatus.mutate(
                          { id: selectedInquiry.id, status: value as InquiryStatus },
                          {
                            onSuccess: () => {
                              setSelectedInquiry({ ...selectedInquiry, status: value as InquiryStatus });
                            },
                          }
                        )
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Constants.public.Enums.inquiry_status
                          .filter((s) => s !== "closed")
                          .map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === "resolved" ? "Approved" : status.replace("_", " ")}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="flex-1" />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(selectedInquiry)}
                      disabled={updateStatus.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(selectedInquiry)}
                      disabled={convertMutation.isPending}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve & Convert
                    </Button>
                  </DialogFooter>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Confirmation Dialog */}
        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Inquiry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject the inquiry from{" "}
                <span className="font-semibold text-foreground">{rejectingInquiry?.company_name}</span>?
                This will close the inquiry. You can optionally provide a reason.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
              placeholder="Reason for rejection (optional)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmReject}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? "Rejecting..." : "Reject Inquiry"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Approve Confirmation Dialog */}
        <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve & Convert to Employer</AlertDialogTitle>
              <AlertDialogDescription>
                This will approve the inquiry from{" "}
                <span className="font-semibold text-foreground">{approvingInquiry?.company_name}</span>{" "}
                and create a new employer record with their contact information. The inquiry will be
                marked as resolved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {approvingInquiry && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">Company:</span> {approvingInquiry.company_name}</p>
                <p><span className="text-muted-foreground">Contact:</span> {approvingInquiry.contact_name}</p>
                <p><span className="text-muted-foreground">Email:</span> {approvingInquiry.contact_email}</p>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmApprove}
                disabled={convertMutation.isPending}
              >
                <Building2 className="mr-2 h-4 w-4" />
                {convertMutation.isPending ? "Converting..." : "Approve & Convert"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
