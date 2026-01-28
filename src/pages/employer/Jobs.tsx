import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  FileText,
  PlusCircle,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
} from "lucide-react";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { useEmployerJobs } from "@/hooks/useEmployerJobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, icon: FileText },
  pending: { label: "Pending Review", variant: "outline" as const, icon: Clock },
  active: { label: "Active", variant: "default" as const, icon: CheckCircle2 },
  expired: { label: "Expired", variant: "destructive" as const, icon: AlertCircle },
  closed: { label: "Closed", variant: "secondary" as const, icon: AlertCircle },
};

export default function EmployerJobs() {
  const { employer } = useEmployerAuth();
  const { data: jobs, isLoading } = useEmployerJobs(employer?.id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <EmployerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">My Job Postings</h1>
            <p className="text-muted-foreground">View and manage all your job listings</p>
          </div>
          <Button asChild variant="accent">
            <Link to="/employer/jobs/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post New Job
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job titles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredJobs.length} {filteredJobs.length === 1 ? "Posting" : "Postings"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">
                  {search || statusFilter !== "all"
                    ? "No matching jobs found"
                    : "No job postings yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first job posting to start attracting candidates."}
                </p>
                {!search && statusFilter === "all" && (
                  <Button asChild>
                    <Link to="/employer/jobs/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Post Your First Job
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => {
                    const config = statusConfig[job.status];
                    const canEdit = job.status === "draft" || job.status === "pending";
                    return (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {job.employment_type.replace("_", " ")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(job.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {job.city || job.region.replace("_", " ")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {job.status === "active" && job.slug && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/jobs/${job.slug}`} target="_blank">
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {canEdit && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/employer/jobs/${job.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/employer/jobs/${job.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  );
}
