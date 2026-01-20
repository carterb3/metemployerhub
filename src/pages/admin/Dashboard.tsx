import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIntakes } from "@/hooks/useIntakes";
import { useEmployerInquiries } from "@/hooks/useEmployerInquiries";
import { useAdminJobs } from "@/hooks/useAdminJobs";
import { 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Briefcase,
  TrendingUp,
  MapPin,
  Plus,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, subDays, isAfter } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { regionLabels } from "@/hooks/useJobs";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--muted-foreground))",
];

export default function AdminDashboard() {
  const { data: intakes = [] } = useIntakes();
  const { data: inquiries = [] } = useEmployerInquiries();
  const { data: jobs = [] } = useAdminJobs();

  // Intake metrics
  const newIntakes = intakes.filter((i) => i.status === "new").length;
  const contactedIntakes = intakes.filter((i) => i.status === "contacted").length;
  const engagedIntakes = intakes.filter((i) => i.status === "engaged").length;
  const placedIntakes = intakes.filter((i) => i.status === "placed").length;
  const urgentIntakes = intakes.filter((i) => i.is_urgent).length;
  
  // Last 7 days intakes
  const recentIntakes = intakes.filter((i) => 
    isAfter(new Date(i.created_at), subDays(new Date(), 7))
  ).length;

  // Job metrics
  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const draftJobs = jobs.filter((j) => j.status === "draft").length;
  const expiringJobs = jobs.filter((j) => {
    if (!j.expires_at) return false;
    const expiryDate = new Date(j.expires_at);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return expiryDate <= sevenDaysFromNow && j.status === "active";
  }).length;
  const featuredJobs = jobs.filter((j) => j.featured && j.status === "active").length;

  // Inquiry metrics
  const newInquiries = inquiries.filter((i) => i.status === "new").length;
  const inProgressInquiries = inquiries.filter((i) => i.status === "in_progress").length;

  // Regional breakdown for intakes
  const regionalData = Object.entries(
    intakes.reduce((acc, intake) => {
      const region = intake.region || "unknown";
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([region, count]) => ({
      name: regionLabels[region as keyof typeof regionLabels] || region,
      value: count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Intake pipeline data
  const pipelineData = [
    { stage: "New", count: newIntakes, color: "hsl(var(--primary))" },
    { stage: "Contacted", count: contactedIntakes, color: "hsl(var(--warning))" },
    { stage: "Engaged", count: engagedIntakes, color: "hsl(var(--accent))" },
    { stage: "Placed", count: placedIntakes, color: "hsl(var(--success))" },
  ];

  // Job status distribution
  const jobStatusData = [
    { name: "Active", value: activeJobs },
    { name: "Draft", value: draftJobs },
    { name: "Pending", value: jobs.filter((j) => j.status === "pending").length },
    { name: "Expired", value: jobs.filter((j) => j.status === "expired").length },
  ].filter((d) => d.value > 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of recruitment activities
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/admin/jobs">
                <Plus className="h-4 w-4 mr-1" />
                New Job
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/intakes">
                <Users className="h-4 w-4 mr-1" />
                View Intakes
              </Link>
            </Button>
          </div>
        </div>

        {/* Alert Banner for urgent items */}
        {(urgentIntakes > 0 || expiringJobs > 0) && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <div className="flex flex-wrap gap-4 text-sm">
                  {urgentIntakes > 0 && (
                    <Link to="/admin/intakes" className="flex items-center gap-1 text-warning hover:underline">
                      <span className="font-semibold">{urgentIntakes}</span> urgent intake{urgentIntakes !== 1 ? "s" : ""} need attention
                    </Link>
                  )}
                  {expiringJobs > 0 && (
                    <Link to="/admin/jobs" className="flex items-center gap-1 text-warning hover:underline">
                      <span className="font-semibold">{expiringJobs}</span> job{expiringJobs !== 1 ? "s" : ""} expiring soon
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Intakes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newIntakes}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>{recentIntakes} this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{featuredJobs} featured</span>
                <span>•</span>
                <span>{draftJobs} drafts</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Employer Inquiries</CardTitle>
              <Building2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newInquiries}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <span>{inProgressInquiries} in progress</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Placements</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{placedIntakes}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Successful job placements
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Intake Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Intake Pipeline
              </CardTitle>
              <CardDescription>
                Job seeker progression through stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Regional Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Regional Distribution
              </CardTitle>
              <CardDescription>
                Intakes by Manitoba region
              </CardDescription>
            </CardHeader>
            <CardContent>
              {regionalData.length > 0 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regionalData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {regionalData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No regional data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Intakes</CardTitle>
                <CardDescription>Latest job seeker registrations</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/intakes">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {intakes.slice(0, 5).map((intake) => (
                  <Link
                    key={intake.id}
                    to={`/admin/intakes/${intake.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{intake.full_name}</p>
                        {intake.is_urgent && (
                          <Badge variant="destructive" className="text-xs shrink-0">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {regionLabels[intake.region as keyof typeof regionLabels] || intake.region} • {format(new Date(intake.created_at), "MMM d")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ml-2 ${
                        intake.status === "new"
                          ? "border-primary/50 text-primary"
                          : intake.status === "contacted" || intake.status === "engaged"
                          ? "border-warning/50 text-warning"
                          : intake.status === "placed"
                          ? "border-success/50 text-success"
                          : ""
                      }`}
                    >
                      {intake.status}
                    </Badge>
                  </Link>
                ))}
                {intakes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No intakes yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Inquiries</CardTitle>
                <CardDescription>Latest employer requests</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/employers">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inquiries.slice(0, 5).map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{inquiry.company_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {inquiry.contact_name} • {inquiry.inquiry_type.replace("_", " ")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ml-2 ${
                        inquiry.status === "new"
                          ? "border-primary/50 text-primary"
                          : inquiry.status === "in_progress"
                          ? "border-warning/50 text-warning"
                          : inquiry.status === "resolved"
                          ? "border-success/50 text-success"
                          : ""
                      }`}
                    >
                      {inquiry.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
                {inquiries.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No inquiries yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Listings Overview
              </CardTitle>
              <CardDescription>Current job posting status</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/jobs">
                Manage Jobs <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="text-2xl font-bold text-success">{activeJobs}</div>
                <p className="text-sm text-muted-foreground">Active listings</p>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <div className="text-2xl font-bold">{draftJobs}</div>
                <p className="text-sm text-muted-foreground">Draft jobs</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="text-2xl font-bold text-warning">{expiringJobs}</div>
                <p className="text-sm text-muted-foreground">Expiring within 7 days</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">{featuredJobs}</div>
                <p className="text-sm text-muted-foreground">Featured jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
