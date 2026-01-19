import { useJobActivityLog } from "@/hooks/useAdminJobs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Loader2, Clock, User, FileEdit, CheckCircle, XCircle, Copy, Archive, RotateCcw } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { jobActionLabels } from "@/types/jobs";
import type { JobAction } from "@/types/jobs";

const actionIcons: Record<JobAction, typeof FileEdit> = {
  create: FileEdit,
  update: FileEdit,
  status_change: Clock,
  publish: CheckCircle,
  unpublish: XCircle,
  duplicate: Copy,
  archive: Archive,
  restore: RotateCcw,
};

const actionColors: Record<JobAction, string> = {
  create: "bg-blue-500/10 text-blue-600",
  update: "bg-muted text-muted-foreground",
  status_change: "bg-yellow-500/10 text-yellow-600",
  publish: "bg-green-500/10 text-green-600",
  unpublish: "bg-red-500/10 text-red-600",
  duplicate: "bg-purple-500/10 text-purple-600",
  archive: "bg-muted text-muted-foreground",
  restore: "bg-blue-500/10 text-blue-600",
};

interface ActivityLogPanelProps {
  jobId: string;
  onClose: () => void;
}

export function ActivityLogPanel({ jobId, onClose }: ActivityLogPanelProps) {
  const { data: logs = [], isLoading } = useJobActivityLog(jobId);

  const getChangeSummary = (log: typeof logs[0]): string => {
    try {
      if (log?.action === "status_change" && log?.before_state && log?.after_state) {
        const before = log.before_state as any;
        const after = log.after_state as any;
        return `${before?.status ?? "unknown"} → ${after?.status ?? "unknown"}`;
      }
      if (log?.action === "update" && log?.before_state && log?.after_state) {
        const before = log.before_state as any;
        const after = log.after_state as any;
        const changes: string[] = [];
        const fields = ["title", "description", "status", "region", "category"];
        for (const field of fields) {
          if (before?.[field] !== after?.[field]) {
            changes.push(field);
          }
        }
        if (changes.length > 0) {
          return `Changed: ${changes.slice(0, 3).join(", ")}${changes.length > 3 ? ` +${changes.length - 3} more` : ""}`;
        }
      }
      return "";
    } catch (err) {
      console.error("Error getting change summary:", err);
      return "";
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Activity History</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-64px)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No activity recorded yet
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {logs.map((log, index) => {
              if (!log) return null;
              const Icon = actionIcons[log.action] ?? FileEdit;
              const colorClass = actionColors[log.action] ?? "bg-muted text-muted-foreground";
              const summary = getChangeSummary(log);

              return (
                <div key={log.id}>
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-full h-fit ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {jobActionLabels[log.action]}
                        </span>
                      </div>
                      {summary && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {summary}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {index < logs.length - 1 && <Separator className="mt-4" />}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
