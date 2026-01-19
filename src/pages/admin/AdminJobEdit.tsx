import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { JobEditorTabs } from "@/components/admin/jobs/JobEditorTabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function AdminJobEditPage() {
  const navigate = useNavigate();
  const params = useParams();

  const jobId = useMemo(() => {
    const id = params.id;
    if (!id || id === "new") return null;
    return id;
  }, [params.id]);

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate("/admin/jobs")}
          aria-label="Back to job listings"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Link to={"/jobs"} className="text-sm text-muted-foreground hover:underline" target="_blank">
          View public job board
        </Link>
      </div>

      <div className="rounded-lg border bg-background overflow-hidden h-[calc(100vh-10rem)]">
        <JobEditorTabs
          jobId={jobId}
          onClose={() => navigate("/admin/jobs")}
          onSaved={() => {
            // Keep navigation consistent and avoid relying on dialog state.
            navigate("/admin/jobs");
          }}
        />
      </div>
    </AdminLayout>
  );
}
