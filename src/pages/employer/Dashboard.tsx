import { Link } from "react-router-dom";
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { useEmployerJobs, useEmployerJobStats } from "@/hooks/useEmployerJobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, icon: FileText },
  pending: { label: "Pending Review", variant: "outline" as const, icon: Clock },
  active: { label: "Active", variant: "default" as const, icon: CheckCircle2 },
  expired: { label: "Expired", variant: "destructive" as const, icon: AlertCircle },
  closed: { label: "Closed", variant: "secondary" as const, icon: AlertCircle },
};

export default function EmployerDashboard() {
  const { employer } = useEmployerAuth();
  const { data: jobs, isLoading: loadingJobs } = useEmployerJobs(employer?.id);
  const { data: stats, isLoading: loadingStats } = useEmployerJobStats(employer?.id);

  const recentJobs = jobs?.slice(0, 5) || [];

  return (
    <EmployerLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back, {employer?.company_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your job postings and connect with Métis talent.
            </p>
          </div>
          <Button asChild variant="accent">
            <Link to="/employer/jobs/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post New Job
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loadingStats ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Postings</p>
                      <p className="text-2xl font-bold">{stats?.total || 0}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold text-success">{stats?.active || 0}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Review</p>
                      <p className="text-2xl font-bold text-warning">{stats?.pending || 0}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Drafts</p>
                      <p className="text-2xl font-bold">{stats?.draft || 0}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent Postings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Postings</CardTitle>
              <CardDescription>Your latest job listings</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/employer/jobs">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingJobs ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No job postings yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first job posting to start attracting candidates.
                </p>
                <Button asChild>
                  <Link to="/employer/jobs/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Post Your First Job
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => {
                  const config = statusConfig[job.status];
                  return (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/employer/jobs/${job.id}`}
                          className="font-medium hover:text-primary truncate block"
                        >
                          {job.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Posted {format(new Date(job.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Attracting Great Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Write clear, specific job titles that candidates search for
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Include salary ranges to attract more qualified applicants
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                List specific requirements vs. "nice-to-haves" separately
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Highlight benefits, culture, and growth opportunities
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  );
}
