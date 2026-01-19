import { DollarSign, TrendingUp } from "lucide-react";
import type { Job } from "@/hooks/useJobs";

interface JobCompensationProps {
  job: Job;
}

const payPeriodLabels: Record<string, string> = {
  hour: "per hour",
  day: "per day",
  week: "per week",
  month: "per month",
  year: "per year",
  project: "per project",
};

export function JobCompensation({ job }: JobCompensationProps) {
  if (!job.pay_visible) return null;

  const hasPayRange = job.pay_min || job.pay_max;
  if (!hasPayRange && !job.pay_range) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: job.pay_currency || 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPayRangeText = () => {
    if (job.pay_range) return job.pay_range;
    
    if (job.pay_min && job.pay_max) {
      return `${formatCurrency(job.pay_min)} – ${formatCurrency(job.pay_max)}`;
    }
    if (job.pay_min) {
      return `From ${formatCurrency(job.pay_min)}`;
    }
    if (job.pay_max) {
      return `Up to ${formatCurrency(job.pay_max)}`;
    }
    return null;
  };

  const payText = getPayRangeText();
  if (!payText) return null;

  return (
    <section className="bg-card rounded-xl border border-border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-success/10 rounded-lg">
          <DollarSign className="h-5 w-5 text-success" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Compensation
        </h2>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-foreground">
          {payText}
        </span>
        {job.pay_period && (
          <span className="text-muted-foreground">
            {payPeriodLabels[job.pay_period] || job.pay_period}
          </span>
        )}
      </div>

      {(job.pay_min && job.pay_max) && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Salary may vary based on experience and qualifications</span>
        </div>
      )}
    </section>
  );
}
