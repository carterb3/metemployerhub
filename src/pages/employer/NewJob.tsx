import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { useCreateEmployerJob } from "@/hooks/useEmployerJobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { Database } from "@/integrations/supabase/types";

type JobCategory = Database["public"]["Enums"]["job_category"];
type EmploymentType = Database["public"]["Enums"]["employment_type"];
type Region = Database["public"]["Enums"]["manitoba_region"];
type ApplicationMethod = Database["public"]["Enums"]["application_method"];
type LocationType = Database["public"]["Enums"]["location_type"];
type ListingType = Database["public"]["Enums"]["listing_type"];

const categoryLabels: Record<JobCategory, string> = {
  administration: "Administration",
  construction_trades: "Construction & Trades",
  education: "Education",
  healthcare: "Healthcare",
  hospitality: "Hospitality",
  information_technology: "Information Technology",
  manufacturing: "Manufacturing",
  natural_resources: "Natural Resources",
  retail_sales: "Retail & Sales",
  transportation: "Transportation",
  other: "Other",
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  seasonal: "Seasonal",
  internship: "Internship",
  remote: "Remote",
};

const regionLabels: Record<Region, string> = {
  interlake: "Interlake",
  northwest: "Northwest",
  southeast: "Southeast",
  southwest: "Southwest",
  winnipeg: "Winnipeg",
  the_pas: "The Pas",
  thompson: "Thompson",
  beyond_borders: "Beyond Borders",
  parklands: "Parklands",
  swan_river: "Swan River",
};

const locationTypeLabels: Record<LocationType, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

const applicationMethodLabels: Record<ApplicationMethod, string> = {
  apply_url: "Apply via external URL",
  apply_through_met: "Apply through MET",
  email: "Apply via email",
  phone: "Apply via phone",
  in_person: "Apply in person",
};

export default function NewEmployerJob() {
  const navigate = useNavigate();
  const { employer } = useEmployerAuth();
  const createJob = useCreateEmployerJob();

  const [formData, setFormData] = useState({
    title: "",
    category: "" as JobCategory | "",
    employment_type: "" as EmploymentType | "",
    region: "" as Region | "",
    city: "",
    address: "",
    postal_code: "",
    location_type: "onsite" as LocationType,
    description: "",
    requirements: "",
    pay_visible: false,
    pay_min: "",
    pay_max: "",
    pay_period: "hour",
    application_method: "apply_through_met" as ApplicationMethod,
    apply_url: "",
    apply_email: "",
    apply_phone: "",
    apply_instructions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employer || !formData.title || !formData.category || !formData.employment_type || !formData.region) {
      return;
    }

    try {
      await createJob.mutateAsync({
        title: formData.title,
        employer_id: employer.id,
        employer_name: employer.company_name,
        category: formData.category as JobCategory,
        employment_type: formData.employment_type as EmploymentType,
        region: formData.region as Region,
        city: formData.city || null,
        address: formData.address || null,
        postal_code: formData.postal_code || null,
        location_type: formData.location_type,
        description: formData.description || "No description provided.",
        requirements: formData.requirements || null,
        pay_visible: formData.pay_visible,
        pay_min: formData.pay_min ? parseFloat(formData.pay_min) : null,
        pay_max: formData.pay_max ? parseFloat(formData.pay_max) : null,
        pay_period: formData.pay_visible ? (formData.pay_period as any) : null,
        application_method: formData.application_method,
        apply_url: formData.apply_url || null,
        apply_email: formData.apply_email || null,
        apply_phone: formData.apply_phone || null,
        apply_instructions: formData.apply_instructions || null,
        apply_through_met: formData.application_method === "apply_through_met",
        listing_type: "partner_jobs" as ListingType,
      });

      navigate("/employer/jobs");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <EmployerLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" asChild>
            <Link to="/employer/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Post a New Job</h1>
            <p className="text-muted-foreground">
              Create a job posting to be reviewed and published by MET staff
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about the position</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Administrative Assistant"
                className="mt-1.5"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => handleInputChange("category", v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employment_type">Employment Type *</Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(v) => handleInputChange("employment_type", v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(employmentTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Where will the employee work?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Region *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(v) => handleInputChange("region", v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(regionLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location_type">Work Arrangement</Label>
                <Select
                  value={formData.location_type}
                  onValueChange={(v) => handleInputChange("location_type", v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(locationTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="e.g., Winnipeg"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  placeholder="e.g., R3C 0A5"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Optional"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Describe the role and requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Job Description *</Label>
              <div className="mt-1.5">
                <RichTextEditor
                  value={formData.description}
                  onChange={(v) => handleInputChange("description", v)}
                  placeholder="Describe the responsibilities, duties, and what a typical day looks like..."
                />
              </div>
            </div>

            <div>
              <Label>Requirements & Qualifications</Label>
              <div className="mt-1.5">
                <RichTextEditor
                  value={formData.requirements}
                  onChange={(v) => handleInputChange("requirements", v)}
                  placeholder="List required skills, experience, education, certifications..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader>
            <CardTitle>Compensation</CardTitle>
            <CardDescription>Optional but recommended - jobs with pay info get more applicants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pay_visible"
                checked={formData.pay_visible}
                onCheckedChange={(v) => handleInputChange("pay_visible", v)}
              />
              <Label htmlFor="pay_visible" className="cursor-pointer">
                Display compensation on job listing
              </Label>
            </div>

            {formData.pay_visible && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pay_min">Minimum Pay</Label>
                  <Input
                    id="pay_min"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pay_min}
                    onChange={(e) => handleInputChange("pay_min", e.target.value)}
                    placeholder="e.g., 18.00"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="pay_max">Maximum Pay</Label>
                  <Input
                    id="pay_max"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pay_max}
                    onChange={(e) => handleInputChange("pay_max", e.target.value)}
                    placeholder="e.g., 25.00"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="pay_period">Pay Period</Label>
                  <Select
                    value={formData.pay_period}
                    onValueChange={(v) => handleInputChange("pay_period", v)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Per Hour</SelectItem>
                      <SelectItem value="day">Per Day</SelectItem>
                      <SelectItem value="week">Per Week</SelectItem>
                      <SelectItem value="month">Per Month</SelectItem>
                      <SelectItem value="year">Per Year</SelectItem>
                      <SelectItem value="project">Per Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Method */}
        <Card>
          <CardHeader>
            <CardTitle>How to Apply</CardTitle>
            <CardDescription>How should candidates submit their applications?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="application_method">Application Method *</Label>
              <Select
                value={formData.application_method}
                onValueChange={(v) => handleInputChange("application_method", v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(applicationMethodLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.application_method === "apply_url" && (
              <div>
                <Label htmlFor="apply_url">Application URL *</Label>
                <Input
                  id="apply_url"
                  type="url"
                  value={formData.apply_url}
                  onChange={(e) => handleInputChange("apply_url", e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5"
                />
              </div>
            )}

            {formData.application_method === "email" && (
              <div>
                <Label htmlFor="apply_email">Application Email *</Label>
                <Input
                  id="apply_email"
                  type="email"
                  value={formData.apply_email}
                  onChange={(e) => handleInputChange("apply_email", e.target.value)}
                  placeholder="hr@company.com"
                  className="mt-1.5"
                />
              </div>
            )}

            {formData.application_method === "phone" && (
              <div>
                <Label htmlFor="apply_phone">Application Phone *</Label>
                <Input
                  id="apply_phone"
                  type="tel"
                  value={formData.apply_phone}
                  onChange={(e) => handleInputChange("apply_phone", e.target.value)}
                  placeholder="204-555-0123"
                  className="mt-1.5"
                />
              </div>
            )}

            <div>
              <Label htmlFor="apply_instructions">Additional Instructions</Label>
              <Textarea
                id="apply_instructions"
                value={formData.apply_instructions}
                onChange={(e) => handleInputChange("apply_instructions", e.target.value)}
                placeholder="Any specific instructions for applicants..."
                className="mt-1.5"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/employer/jobs">Cancel</Link>
          </Button>
          <Button
            type="submit"
            variant="accent"
            disabled={
              createJob.isPending ||
              !formData.title ||
              !formData.category ||
              !formData.employment_type ||
              !formData.region
            }
          >
            {createJob.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Review"
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Your job posting will be reviewed by MET staff before being published. 
          You'll be notified when it goes live.
        </p>
      </form>
    </EmployerLayout>
  );
}
