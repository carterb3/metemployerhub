import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type JobStatus = Database["public"]["Enums"]["job_status"];

const statusColors: Record<JobStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  active: "bg-success/10 text-success",
  expired: "bg-muted text-muted-foreground",
  closed: "bg-destructive/10 text-destructive",
};

interface JobStatusSelectProps {
  status: JobStatus;
  onStatusChange: (status: JobStatus) => void;
  disabled?: boolean;
}

export function JobStatusSelect({
  status,
  onStatusChange,
  disabled,
}: JobStatusSelectProps) {
  return (
    <Select value={status} onValueChange={onStatusChange} disabled={disabled}>
      <SelectTrigger className="w-[120px] h-8 text-xs">
        <SelectValue>
          <Badge variant="outline" className={statusColors[status]}>
            {status}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Constants.public.Enums.job_status.map((s) => (
          <SelectItem key={s} value={s}>
            <Badge variant="outline" className={statusColors[s]}>
              {s}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
