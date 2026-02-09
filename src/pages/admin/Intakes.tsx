import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useIntakes, useStaffMembers, useUpdateIntakeStatus, useAssignIntake } from "@/hooks/useIntakes";
import { useAuth } from "@/hooks/useAuth";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Constants } from "@/integrations/supabase/types";
import { formatRegion } from "@/lib/regions";
import type { Database } from "@/integrations/supabase/types";

type IntakeStatus = Database["public"]["Enums"]["intake_status"];
type Region = Database["public"]["Enums"]["manitoba_region"];

const statusColors: Record<IntakeStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  contacted: "bg-blue-100 text-blue-700 border-blue-200",
  engaged: "bg-warning/10 text-warning border-warning/20",
  referred: "bg-amber-100 text-amber-700 border-amber-200",
  placed: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-border",
};

export default function IntakesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IntakeStatus | "all">("all");
  const [regionFilter, setRegionFilter] = useState<Region | "all">("all");
  const { user } = useAuth();

  const { data: intakes = [], isLoading } = useIntakes({
    status: statusFilter === "all" ? undefined : statusFilter,
    region: regionFilter === "all" ? undefined : regionFilter,
    search: search || undefined,
  });

  const { data: staffMembers = [] } = useStaffMembers();
  const updateStatus = useUpdateIntakeStatus();
  const assignIntake = useAssignIntake();

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone",
      "Region",
      "City",
      "Status",
      "Created At",
      "Employment Status",
      "Is Youth",
      "Has Barriers",
      "Self-Identifies Red River Métis",
      "MMF Citizenship Number",
    ];

    const rows = intakes.map((intake) => [
      intake.id,
      intake.full_name,
      intake.email,
      intake.phone || "",
      intake.region ? formatRegion(intake.region) : "",
      intake.city || "",
      intake.status,
      format(new Date(intake.created_at), "yyyy-MM-dd"),
      intake.employment_status || "",
      intake.is_youth ? "Yes" : "No",
      intake.has_barriers ? "Yes" : "No",
      intake.self_identifies_metis ? "Yes" : "No",
      intake.mmf_citizenship_number || "",
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
    link.download = `intakes-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handleStatusChange = (intakeId: string, status: IntakeStatus) => {
    updateStatus.mutate({ id: intakeId, status });
  };

  const handleAssign = (intakeId: string, assignedTo: string) => {
    if (!user) return;
    assignIntake.mutate({
      intakeId,
      assignedTo: assignedTo === "unassigned" ? null : assignedTo,
      assignedBy: user.id,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Job Seeker Intakes
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage intake submissions and assignments
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
            <CardDescription>Filter and search intake records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as IntakeStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Constants.public.Enums.intake_status.map((status) => (
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
                      {formatRegion(region)}
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
            ) : intakes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No intakes found matching your criteria
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intakes.map((intake) => (
                    <TableRow key={intake.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {intake.is_urgent && (
                            <AlertTriangle className="h-4 w-4 text-accent" />
                          )}
                          <div>
                            <Link
                              to={`/admin/intakes/${intake.id}`}
                              className="font-medium hover:underline"
                            >
                              {intake.full_name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {intake.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatRegion(intake.region)}</TableCell>
                      <TableCell>
                        <Select
                          value={intake.status}
                          onValueChange={(value) =>
                            handleStatusChange(intake.id, value as IntakeStatus)
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <Badge
                              variant="outline"
                              className={statusColors[intake.status]}
                            >
                              {intake.status.replace("_", " ")}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Constants.public.Enums.intake_status.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={intake.assigned_to || "unassigned"}
                          onValueChange={(value) =>
                            handleAssign(intake.id, value)
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
                        {format(new Date(intake.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/intakes/${intake.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
