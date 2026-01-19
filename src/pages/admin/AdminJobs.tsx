import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminJobs, useUpdateJobStatus, useBulkUpdateJobs, useArchiveJob, useDuplicateJob, exportJobsToCSV } from "@/hooks/useAdminJobs";
import type { AdminJobFull, JobStatus } from "@/types/jobs";
import { statusColors } from "@/types/jobs";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Loader2, MoreHorizontal, Pencil, Trash2, ExternalLink, Copy, Archive, Download, X } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";
import { JobEditorTabs } from "@/components/admin/jobs/JobEditorTabs";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DeleteJobDialog } from "@/components/admin/jobs/DeleteJobDialog";
import { JobStatusSelect } from "@/components/admin/jobs/JobStatusSelect";
import { Input } from "@/components/ui/input";
import {
  regionLabels,
  categoryLabels,
  employmentTypeLabels,
} from "@/hooks/useJobs";

type Region = Database["public"]["Enums"]["manitoba_region"];
type Category = Database["public"]["Enums"]["job_category"];

export default function AdminJobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [regionFilter, setRegionFilter] = useState<Region | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<AdminJobFull | null>(null);

  const { data: jobs = [], isLoading, error } = useAdminJobs({
    status: statusFilter === "all" ? undefined : statusFilter,
    region: regionFilter === "all" ? undefined : regionFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    search: search || undefined,
  });

  const updateStatus = useUpdateJobStatus();
  const bulkUpdate = useBulkUpdateJobs();

  // Selection helpers
  const allSelected = useMemo(
    () => jobs.length > 0 && jobs.every((job) => selectedIds.has(job.id)),
    [jobs, selectedIds]
  );

  const someSelected = useMemo(
    () => jobs.some((job) => selectedIds.has(job.id)) && !allSelected,
    [jobs, selectedIds, allSelected]
  );

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(jobs.map((job) => job.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Bulk actions
  const handleBulkStatusChange = (status: JobStatus) => {
    bulkUpdate.mutate(
      { ids: Array.from(selectedIds), updates: { status } },
      { onSuccess: clearSelection }
    );
  };

  const handleExportCSV = () => {
    const toExport = selectedIds.size > 0
      ? jobs.filter((job) => selectedIds.has(job.id))
      : jobs;
    exportJobsToCSV(toExport);
  };

  const handleEdit = (job: AdminJobFull) => {
    console.log("Opening edit for job:", job);
    setSelectedJob(job);
    setFormOpen(true);
  };

  const handleDelete = (job: AdminJobFull) => {
    setSelectedJob(job);
    setDeleteOpen(true);
  };

  const handleCreate = () => {
    setSelectedJob(null);
    setFormOpen(true);
  };

  const handleStatusChange = (job: AdminJobFull, status: JobStatus) => {
    updateStatus.mutate({ id: job.id, status });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Job Listings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage job postings for the public job board
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Job Posting
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Filter and search job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as JobStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Constants.public.Enums.job_status.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
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
                      {regionLabels[region] || region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={categoryFilter}
                onValueChange={(value) =>
                  setCategoryFilter(value as Category | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Constants.public.Enums.job_category.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat] || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Toolbar */}
        {selectedIds.size > 0 && (
          <div className="flex-shrink-0 flex items-center gap-3 bg-muted/50 border rounded-lg px-4 py-2 mt-4">
            <span className="text-sm font-medium">
              {selectedIds.size} selected
            </span>
            <div className="h-4 w-px bg-border" />
            <Select onValueChange={(val) => handleBulkStatusChange(val as JobStatus)}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue placeholder="Change status..." />
              </SelectTrigger>
              <SelectContent>
                {Constants.public.Enums.job_status.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                exportJobsToCSV(jobs.filter((j) => selectedIds.has(j.id)));
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Export Selected
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="flex-shrink-0 border-destructive mt-4">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">
                Error loading jobs: {error.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Jobs Table - Scrollable */}
        <Card className="flex-1 mt-4 flex flex-col overflow-hidden">
          <CardContent className="p-0 flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No jobs found matching your criteria
                </p>
                <Button variant="outline" onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first job posting
                </Button>
              </div>
            ) : (
              <div className="overflow-auto h-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                          className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                        />
                      </TableHead>
                      <TableHead className="min-w-[200px]">Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow
                        key={job.id}
                        className={selectedIds.has(job.id) ? "bg-muted/50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(job.id)}
                            onCheckedChange={() => toggleSelect(job.id)}
                            aria-label={`Select ${job.title}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.city || regionLabels[job.region] || job.region}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.employers?.company_name ? (
                            <span className="text-sm">
                              {job.employers.company_name}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {regionLabels[job.region] || job.region}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {categoryLabels[job.category] || job.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {employmentTypeLabels[job.employment_type] ||
                              job.employment_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <JobStatusSelect
                            status={job.status}
                            onStatusChange={(status) =>
                              handleStatusChange(job, status)
                            }
                            disabled={updateStatus.isPending}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {job.posted_at
                            ? format(new Date(job.posted_at), "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {job.expires_at
                            ? format(new Date(job.expires_at), "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(job)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/jobs/${job.id}`} target="_blank">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Public
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(job)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {!isLoading && jobs.length > 0 && (
          <p className="flex-shrink-0 text-sm text-muted-foreground text-center py-2">
            Showing {jobs.length} job{jobs.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0">
          <ErrorBoundary fallbackMessage="Something went wrong loading this job. Please try again or contact support if the issue persists.">
            <JobEditorTabs
              jobId={selectedJob?.id}
              onClose={() => setFormOpen(false)}
            />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>
      <DeleteJobDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        job={selectedJob}
      />
    </AdminLayout>
  );
}
