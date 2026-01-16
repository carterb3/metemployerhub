import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useIntake, useUpdateIntakeStatus, useAssignIntake, useStaffMembers } from "@/hooks/useIntakes";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  Send,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type IntakeStatus = Database["public"]["Enums"]["intake_status"];

const statusColors: Record<IntakeStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  contacted: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  placed: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground border-border",
};

export default function IntakeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");

  const { data: intake, isLoading } = useIntake(id!);
  const { data: staffMembers = [] } = useStaffMembers();
  const updateStatus = useUpdateIntakeStatus();
  const assignIntake = useAssignIntake();

  const { data: notes = [] } = useQuery({
    queryKey: ["intake-notes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intake_notes")
        .select("*, profiles:created_by(full_name, email)")
        .eq("intake_id", id!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const addNote = useMutation({
    mutationFn: async (note: string) => {
      const { error } = await supabase.from("intake_notes").insert({
        intake_id: id!,
        note,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intake-notes", id] });
      setNewNote("");
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!intake) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Intake not found</p>
          <Button asChild className="mt-4">
            <Link to="/admin/intakes">Back to Intakes</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const assignedStaff = staffMembers.find(
    (s) => s.user_id === intake.assigned_to
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/intakes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl font-bold text-foreground">
                {intake.full_name}
              </h1>
              {intake.is_urgent && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Urgent
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Submitted {format(new Date(intake.created_at), "MMMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${intake.email}`}
                        className="font-medium hover:underline"
                      >
                        {intake.email}
                      </a>
                    </div>
                  </div>
                  {intake.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${intake.phone}`}
                          className="font-medium hover:underline"
                        >
                          {intake.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">
                        {intake.city}, {intake.region}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Preferred Contact
                      </p>
                      <p className="font-medium capitalize">
                        {intake.contact_preference}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Employment Status
                    </p>
                    <p className="font-medium">
                      {intake.employment_status || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Goals</p>
                    <p className="font-medium">
                      {intake.employment_goals || "Not specified"}
                    </p>
                  </div>
                </div>

                {intake.skills && intake.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Skills & Interests
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {intake.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {intake.barriers_description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Support Needs
                    </p>
                    <p className="text-foreground">
                      {intake.barriers_description}
                    </p>
                  </div>
                )}

                {intake.resume_url && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={intake.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {intake.resume_filename || "View Resume"}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Case Notes</CardTitle>
                <CardDescription>
                  Internal notes for this intake case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={() => addNote.mutate(newNote)}
                    disabled={!newNote.trim() || addNote.isPending}
                    size="icon"
                    className="shrink-0"
                  >
                    {addNote.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  {notes.map((note: any) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-muted/50 border"
                    >
                      <p className="text-foreground whitespace-pre-wrap">
                        {note.note}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {note.profiles?.full_name || note.profiles?.email} •{" "}
                        {format(
                          new Date(note.created_at),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No notes yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Current Status
                  </p>
                  <Select
                    value={intake.status}
                    onValueChange={(value) =>
                      updateStatus.mutate({
                        id: intake.id,
                        status: value as IntakeStatus,
                      })
                    }
                  >
                    <SelectTrigger>
                      <Badge
                        variant="outline"
                        className={statusColors[intake.status]}
                      >
                        {intake.status.replace("_", " ")}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.intake_status.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Assigned To
                  </p>
                  <Select
                    value={intake.assigned_to || "unassigned"}
                    onValueChange={(value) =>
                      assignIntake.mutate({
                        intakeId: intake.id,
                        assignedTo: value === "unassigned" ? null : value,
                        assignedBy: user!.id,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {assignedStaff
                          ? assignedStaff.full_name || assignedStaff.email
                          : "Unassigned"}
                      </SelectValue>
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Self-identifies Métis</span>
                  <Badge variant={intake.self_identifies_metis ? "default" : "secondary"}>
                    {intake.self_identifies_metis ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Youth (under 30)</span>
                  <Badge variant={intake.is_youth ? "default" : "secondary"}>
                    {intake.is_youth ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Has Barriers</span>
                  <Badge variant={intake.has_barriers ? "default" : "secondary"}>
                    {intake.has_barriers ? "Yes" : "No"}
                  </Badge>
                </div>
                {intake.mmf_citizenship_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      MMF Citizenship #
                    </p>
                    <p className="font-medium">{intake.mmf_citizenship_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
