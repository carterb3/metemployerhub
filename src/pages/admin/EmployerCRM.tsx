import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Globe, 
  MessageSquare,
  ArrowUpRight,
  Users,
  Handshake,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  useEmployers, 
  useUnconvertedInquiries,
  useDeleteEmployer,
  employerStatusLabels,
  type Employer 
} from "@/hooks/useEmployerCRM";
import { EmployerFormDialog } from "@/components/admin/employers/EmployerFormDialog";
import { ConvertInquiryDialog } from "@/components/admin/employers/ConvertInquiryDialog";
import { format } from "date-fns";

export default function EmployerCRM() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);
  const [deletingEmployer, setDeletingEmployer] = useState<Employer | null>(null);

  const { data: employers, isLoading: loadingEmployers } = useEmployers();
  const { data: unconvertedInquiries } = useUnconvertedInquiries();
  const deleteEmployer = useDeleteEmployer();

  // Filter employers
  const filteredEmployers = employers?.filter((employer) => {
    const matchesSearch = 
      employer.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employer.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employer.contact_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || (employer as any).status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Stats
  const totalEmployers = employers?.length || 0;
  const activePartners = employers?.filter((e) => e.is_partner).length || 0;
  const prospects = employers?.filter((e) => (e as any).status === "prospect").length || 0;
  const pendingInquiries = unconvertedInquiries?.length || 0;

  const getStatusBadge = (employer: Employer) => {
    const status = (employer as any).status || "active";
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      active: "default",
      inactive: "secondary",
      prospect: "outline",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {employerStatusLabels[status] || status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employer CRM</h1>
            <p className="text-muted-foreground">
              Manage employer relationships and track communications
            </p>
          </div>
          <div className="flex gap-2">
            {pendingInquiries > 0 && (
              <Button variant="outline" onClick={() => setShowConvertDialog(true)}>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Convert Inquiry ({pendingInquiries})
              </Button>
            )}
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Employers
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Partners
              </CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{activePartners}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Prospects
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{prospects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Inquiries
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingInquiries}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active Partners</SelectItem>
              <SelectItem value="prospect">Prospects</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Employers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingEmployers ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredEmployers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {searchQuery || statusFilter !== "all" 
                        ? "No employers match your filters" 
                        : "No employers yet. Add one or convert an inquiry."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployers.map((employer) => (
                    <TableRow key={employer.id}>
                      <TableCell>
                        <div className="font-medium">{employer.company_name}</div>
                        {employer.industry && (
                          <div className="text-sm text-muted-foreground">{employer.industry}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{employer.contact_name}</div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {employer.contact_email}
                            </span>
                            {employer.contact_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {employer.contact_phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(employer)}</TableCell>
                      <TableCell>
                        {employer.is_partner ? (
                          <Badge variant="default" className="bg-success">Partner</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(employer.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {employer.website && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={employer.website} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => setEditingEmployer(employer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingEmployer(employer)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/employers/${employer.id}`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EmployerFormDialog 
        open={showNewDialog || !!editingEmployer} 
        onOpenChange={(open) => {
          if (!open) {
            setShowNewDialog(false);
            setEditingEmployer(null);
          }
        }}
        employer={editingEmployer}
      />
      <ConvertInquiryDialog
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
        inquiries={unconvertedInquiries || []}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingEmployer} onOpenChange={(open) => !open && setDeletingEmployer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingEmployer?.company_name}</strong>? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingEmployer) {
                  deleteEmployer.mutate(deletingEmployer.id);
                  setDeletingEmployer(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
