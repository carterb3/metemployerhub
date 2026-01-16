import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useIntakes } from "@/hooks/useIntakes";
import { useEmployerInquiries } from "@/hooks/useEmployerInquiries";
import { Users, Building2, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { data: intakes = [] } = useIntakes();
  const { data: inquiries = [] } = useEmployerInquiries();

  const newIntakes = intakes.filter((i) => i.status === "new").length;
  const inProgressIntakes = intakes.filter((i) => i.status === "contacted" || i.status === "engaged").length;
  const urgentIntakes = intakes.filter((i) => i.is_urgent).length;

  const newInquiries = inquiries.filter((i) => i.status === "new").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of recruitment activities
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                New Intakes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newIntakes}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting initial contact
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                In Progress
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressIntakes}</div>
              <p className="text-xs text-muted-foreground">
                Active job seeker cases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Urgent Cases
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{urgentIntakes}</div>
              <p className="text-xs text-muted-foreground">
                Require priority attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Employer Inquiries
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newInquiries}</div>
              <p className="text-xs text-muted-foreground">
                New employer requests
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Seeker Intakes</CardTitle>
              <CardDescription>
                Latest registrations requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {intakes.slice(0, 5).map((intake) => (
                  <Link
                    key={intake.id}
                    to={`/admin/intakes/${intake.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{intake.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {intake.region} • {intake.email}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        intake.status === "new"
                          ? "bg-primary/10 text-primary"
                          : intake.status === "contacted" || intake.status === "engaged"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {intake.status.replace("_", " ")}
                    </span>
                  </Link>
                ))}
                {intakes.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No intakes yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Employer Inquiries</CardTitle>
              <CardDescription>
                Latest employer partnership requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inquiries.slice(0, 5).map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    to={`/admin/employers/${inquiry.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{inquiry.company_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {inquiry.contact_name} • {inquiry.inquiry_type}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        inquiry.status === "new"
                          ? "bg-primary/10 text-primary"
                          : inquiry.status === "in_progress"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {inquiry.status.replace("_", " ")}
                    </span>
                  </Link>
                ))}
                {inquiries.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No inquiries yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
