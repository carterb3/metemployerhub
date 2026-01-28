import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Edit,
  Plus,
  Calendar,
  MessageSquare,
  Handshake,
  FileText,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  useEmployer,
  useEmployerCommunications,
  employerStatusLabels,
  communicationTypeLabels,
} from "@/hooks/useEmployerCRM";
import { EmployerFormDialog } from "@/components/admin/employers/EmployerFormDialog";
import { CommunicationFormDialog } from "@/components/admin/employers/CommunicationFormDialog";
import { ApproveEmployerDialog } from "@/components/admin/employers/ApproveEmployerDialog";

export default function EmployerDetail() {
  const { id } = useParams<{ id: string }>();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const { data: employer, isLoading: loadingEmployer } = useEmployer(id);
  const { data: communications, isLoading: loadingComms } = useEmployerCommunications(id);

  if (loadingEmployer) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!employer) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Employer Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The employer you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/admin/employers">Back to Employers</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const status = (employer as any).status || "active";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/employers">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{employer.company_name}</h1>
                {employer.is_partner && (
                  <Badge className="bg-success">
                    <Handshake className="mr-1 h-3 w-3" />
                    Partner
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge variant="outline">{employerStatusLabels[status]}</Badge>
                {employer.industry && (
                  <>
                    <span>•</span>
                    <span>{employer.industry}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!employer.user_id && (
              <Button variant="accent" onClick={() => setShowApproveDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            )}
            {employer.user_id && (
              <Badge variant="outline" className="flex items-center gap-1 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Account Active
              </Badge>
            )}
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Contact</p>
                    <p className="font-medium">{employer.contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a 
                      href={`mailto:${employer.contact_email}`}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-4 w-4" />
                      {employer.contact_email}
                    </a>
                  </div>
                  {employer.contact_phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a 
                        href={`tel:${employer.contact_phone}`}
                        className="font-medium flex items-center gap-1"
                      >
                        <Phone className="h-4 w-4" />
                        {employer.contact_phone}
                      </a>
                    </div>
                  )}
                  {employer.website && (
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a 
                        href={employer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <Globe className="h-4 w-4" />
                        {employer.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>
                
                {(employer as any).notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Internal Notes</p>
                      <p className="text-sm">{(employer as any).notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Communication History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Communication History</CardTitle>
                  <CardDescription>
                    Track all interactions with this employer
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowCommunicationDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Communication
                </Button>
              </CardHeader>
              <CardContent>
                {loadingComms ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : !communications || communications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No communications logged yet.</p>
                    <p className="text-sm">Click "Log Communication" to add the first entry.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {communications.map((comm) => (
                      <div 
                        key={comm.id} 
                        className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {communicationTypeLabels[comm.communication_type]}
                            </Badge>
                            {comm.subject && (
                              <span className="font-medium">{comm.subject}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(comm.communication_date), "MMM d, yyyy")}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{comm.notes}</p>
                        {comm.follow_up_date && (
                          <div className="mt-2 pt-2 border-t flex items-center gap-1 text-xs text-warning">
                            <Calendar className="h-3 w-3" />
                            Follow-up: {format(new Date(comm.follow_up_date), "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline">{employerStatusLabels[status]}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Partner</span>
                  <span>{employer.is_partner ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added</span>
                  <span>{format(new Date(employer.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Communications</span>
                  <span>{communications?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowCommunicationDialog(true)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Log Communication
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  asChild
                >
                  <a href={`mailto:${employer.contact_email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/admin/jobs?action=new">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Job Posting
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <EmployerFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        employer={employer}
      />
      <CommunicationFormDialog
        open={showCommunicationDialog}
        onOpenChange={setShowCommunicationDialog}
        employerId={employer.id}
      />
      <ApproveEmployerDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        employer={employer}
      />
    </AdminLayout>
  );
}
