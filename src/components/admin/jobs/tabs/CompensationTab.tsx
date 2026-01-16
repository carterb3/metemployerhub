import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Constants } from "@/integrations/supabase/types";
import { payPeriodLabels } from "@/types/jobs";

interface CompensationTabProps {
  form: UseFormReturn<any>;
}

export function CompensationTab({ form }: CompensationTabProps) {
  const payVisible = form.watch("pay_visible");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compensation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="pay_visible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Show compensation publicly</FormLabel>
                  <FormDescription>
                    Display pay information on the public job listing
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="pay_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Pay</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 45000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pay_max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Pay</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 55000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pay_period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pay Period</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      {Constants.public.Enums.pay_period.map((period) => (
                        <SelectItem key={period} value={period}>
                          {payPeriodLabels[period] || period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {payVisible && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Preview:</strong>{" "}
                {form.watch("pay_min") && form.watch("pay_max")
                  ? `$${form.watch("pay_min")} - $${form.watch("pay_max")} CAD ${
                      form.watch("pay_period")
                        ? payPeriodLabels[form.watch("pay_period") as keyof typeof payPeriodLabels]
                        : ""
                    }`
                  : form.watch("pay_min")
                  ? `From $${form.watch("pay_min")} CAD ${
                      form.watch("pay_period")
                        ? payPeriodLabels[form.watch("pay_period") as keyof typeof payPeriodLabels]
                        : ""
                    }`
                  : "No pay information entered"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
