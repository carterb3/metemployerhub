import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  User,
  MapPin,
  Phone,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  HelpCircle,
  Loader2,
  FileText,
  X,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ManitobaRegion = Database["public"]["Enums"]["manitoba_region"];

const regionToEnum: Record<string, ManitobaRegion> = {
  "Winnipeg": "winnipeg",
  "Southwest (Brandon area)": "southwest",
  "Southeast": "southeast",
  "Interlake": "interlake",
  "Northwest (Dauphin area)": "northwest",
  "The Pas & Northern": "the_pas",
};

const contactMethodToPreference = (methods: string[]): Database["public"]["Enums"]["contact_preference"] => {
  if (methods.length === 0 || methods.length >= 3) return "any";
  if (methods.includes("Email") && methods.length === 1) return "email";
  if (methods.includes("Phone call") && methods.length === 1) return "phone";
  if (methods.includes("Text message") && methods.length === 1) return "text";
  return "any";
};

// Allowed file types for resume
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const steps = [
  { id: 1, name: "Contact Info", icon: User },
  { id: 2, name: "Location", icon: MapPin },
  { id: 3, name: "Employment", icon: Briefcase },
  { id: 4, name: "Review", icon: CheckCircle2 },
];

const regions = [
  "Winnipeg",
  "Southwest (Brandon area)",
  "Southeast",
  "Interlake",
  "Northwest (Dauphin area)",
  "The Pas & Northern",
];

const employmentStatuses = [
  "Currently employed",
  "Unemployed - actively seeking work",
  "Unemployed - not currently seeking",
  "Student",
  "Underemployed",
  "Seasonal worker",
];

const employmentGoals = [
  "Find a new job",
  "Career change",
  "Increase hours/income",
  "Start a career",
  "Return to workforce",
  "Find training opportunities",
];

const skillCategories = [
  "Administration & Office",
  "Customer Service",
  "Construction & Trades",
  "Healthcare",
  "Technology",
  "Education",
  "Transportation",
  "Retail & Sales",
  "Food Service & Hospitality",
  "Manufacturing",
];

const contactMethods = ["Phone call", "Text message", "Email"];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredContact: [] as string[],
    postalCode: "",
    region: "",
    city: "",
    employmentStatus: "",
    employmentGoals: [] as string[],
    skills: [] as string[],
    otherSkills: "",
    resume: null as File | null,
    supportNeeds: "",
    consent: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: string, value: string) => {
    setFormData((prev) => {
      const arr = prev[field as keyof typeof prev] as string[];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter((v) => v !== value) };
      }
      return { ...prev, [field]: [...arr, value] };
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeError(null);
    if (!file) {
      updateField("resume", null);
      return;
    }
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(extension) && !ALLOWED_FILE_TYPES.includes(file.type)) {
      setResumeError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      updateField("resume", null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setResumeError("File size must be less than 10MB");
      updateField("resume", null);
      return;
    }
    updateField("resume", file);
  };

  const removeFile = () => {
    updateField("resume", null);
    setResumeError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Please enter your first and last name.");
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!formData.region) {
      toast.error("Please select your region.");
      return;
    }
    if (!formData.consent) {
      toast.error("You must consent to data collection.");
      return;
    }

    setIsSubmitting(true);

    try {
      let resumeUrl: string | null = null;
      let resumeFilename: string | null = null;

      // Upload resume if provided
      if (formData.resume) {
        const timestamp = Date.now();
        const sanitizedName = formData.resume.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `registrations/${timestamp}-${sanitizedName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, formData.resume, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error("Resume upload error:", uploadError);
          toast.error("Failed to upload resume. Please try again.");
          setIsSubmitting(false);
          return;
        }

        resumeUrl = uploadData.path;
        resumeFilename = formData.resume.name;
      }

      const regionEnum = regionToEnum[formData.region];
      if (!regionEnum) {
        toast.error("Invalid region selected.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("job_seeker_intakes")
        .insert({
          full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          postal_code: formData.postalCode.trim() || null,
          city: formData.city.trim() || null,
          region: regionEnum,
          contact_preference: contactMethodToPreference(formData.preferredContact),
          employment_status: formData.employmentStatus || null,
          employment_goals: formData.employmentGoals.join(", ") || null,
          skills: formData.skills.length > 0 ? formData.skills : null,
          skills_other: formData.otherSkills.trim() || null,
          barriers_description: formData.supportNeeds.trim() || null,
          has_barriers: formData.supportNeeds.trim().length > 0,
          consent_data_collection: formData.consent,
          consent_contact: formData.consent,
          status: "new",
          resume_url: resumeUrl,
          resume_filename: resumeFilename,
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Registration submitted successfully!");
    } catch (error) {
      console.error("Registration submission error:", error);
      toast.error("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <section className="section-padding bg-background min-h-[60vh] flex items-center">
          <div className="container-mobile">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                Thank You for Registering!
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                A MET staff member in your region will be in touch within 2-3
                business days to discuss your employment goals and next steps.
              </p>
              <div className="bg-card rounded-xl border border-border p-6 text-left mb-8">
                <h2 className="font-semibold text-foreground mb-4">
                  What Happens Next?
                </h2>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      1
                    </span>
                    <span>Your information is sent to your regional MET office</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      2
                    </span>
                    <span>A career advisor will review your profile</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      3
                    </span>
                    <span>
                      We'll contact you to schedule an intake meeting
                    </span>
                  </li>
                </ol>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/jobs">Browse Job Listings</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Return Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-10 sm:py-12">
        <div className="container-mobile">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-3">
            Get Career Support
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            Register with MET to connect with a career advisor. This takes about
            2-5 minutes.
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="bg-secondary border-b border-border">
        <div className="container-mobile py-6">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, index) => (
                <li key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "step-indicator",
                        currentStep > step.id && "completed",
                        currentStep === step.id && "active",
                        currentStep < step.id && "upcoming"
                      )}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-xs font-medium hidden sm:block",
                        currentStep >= step.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "hidden sm:block w-16 lg:w-24 h-0.5 mx-4",
                        currentStep > step.id ? "bg-success" : "bg-border"
                      )}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* Form */}
      <section className="section-padding bg-background">
        <div className="container-mobile">
          <div className="max-w-2xl mx-auto">
            {/* Step 1: Contact Info */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Contact Information
                </h2>
                <p className="text-muted-foreground mb-8">
                  How can we reach you?
                </p>

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="mt-1.5"
                      placeholder="(204) 555-0123"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      Preferred Contact Method *
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Select all the ways you'd be comfortable with us
                            reaching out
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="mt-3 space-y-2">
                      {contactMethods.map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={formData.preferredContact.includes(method)}
                            onCheckedChange={() =>
                              toggleArrayField("preferredContact", method)
                            }
                          />
                          <span className="text-foreground">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Where Are You Located?
                </h2>
                <p className="text-muted-foreground mb-8">
                  This helps us connect you with the right regional office.
                </p>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) =>
                        updateField("postalCode", e.target.value.toUpperCase())
                      }
                      className="mt-1.5"
                      placeholder="R3B 0J7"
                      maxLength={7}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City/Town *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="region">Region *</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => updateField("region", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select your region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Employment */}
            {currentStep === 3 && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Employment & Skills
                </h2>
                <p className="text-muted-foreground mb-8">
                  Tell us about your current situation and what you're looking
                  for.
                </p>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="employmentStatus">
                      Current Employment Status *
                    </Label>
                    <Select
                      value={formData.employmentStatus}
                      onValueChange={(value) =>
                        updateField("employmentStatus", value)
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select your status" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>What are your goals? (Select all that apply) *</Label>
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      {employmentGoals.map((goal) => (
                        <label
                          key={goal}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={formData.employmentGoals.includes(goal)}
                            onCheckedChange={() =>
                              toggleArrayField("employmentGoals", goal)
                            }
                          />
                          <span className="text-sm text-foreground">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Skills & Interest Areas *</Label>
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      {skillCategories.map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={formData.skills.includes(skill)}
                            onCheckedChange={() =>
                              toggleArrayField("skills", skill)
                            }
                          />
                          <span className="text-sm text-foreground">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="otherSkills">Other Skills or Experience</Label>
                    <Textarea
                      id="otherSkills"
                      value={formData.otherSkills}
                      onChange={(e) => updateField("otherSkills", e.target.value)}
                      className="mt-1.5"
                      rows={3}
                      placeholder="Any other skills, certifications, or experience you'd like us to know about..."
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      Upload Resume (Optional)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            PDF or Word documents accepted (max 10MB). You can also bring
                            this to your meeting.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    
                    {!formData.resume ? (
                      <div 
                        className={`mt-1.5 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors relative ${resumeError ? 'border-destructive' : 'border-border'}`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload your resume
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF or Word document, max 10MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileSelect}
                        />
                      </div>
                    ) : (
                      <div className="mt-1.5 flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {formData.resume.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(formData.resume.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {resumeError && (
                      <p className="text-sm text-destructive mt-1">{resumeError}</p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      Support Needs (Optional)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Share any barriers or supports you might need. This is
                            completely optional and helps us serve you better.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Textarea
                      value={formData.supportNeeds}
                      onChange={(e) => updateField("supportNeeds", e.target.value)}
                      className="mt-1.5"
                      rows={3}
                      placeholder="E.g., childcare, transportation, training needs..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Review Your Information
                </h2>
                <p className="text-muted-foreground mb-8">
                  Please review before submitting.
                </p>

                <div className="space-y-6">
                  <div className="bg-card rounded-xl border border-border divide-y divide-border">
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2">
                        Contact Info
                      </h3>
                      <p className="text-muted-foreground">
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-muted-foreground">{formData.email}</p>
                      <p className="text-muted-foreground">{formData.phone}</p>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2">
                        Location
                      </h3>
                      <p className="text-muted-foreground">
                        {formData.city}, {formData.postalCode}
                      </p>
                      <p className="text-muted-foreground">{formData.region}</p>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2">
                        Employment
                      </h3>
                      <p className="text-muted-foreground">
                        {formData.employmentStatus}
                      </p>
                      <p className="text-muted-foreground">
                        Goals: {formData.employmentGoals.join(", ")}
                      </p>
                      <p className="text-muted-foreground">
                        Skills: {formData.skills.join(", ")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-start gap-3 p-4 rounded-lg border border-border bg-secondary/30 cursor-pointer">
                      <Checkbox
                        checked={formData.consent}
                        onCheckedChange={(checked) =>
                          updateField("consent", checked)
                        }
                        className="mt-0.5"
                      />
                      <div className="text-sm">
                        <span className="text-foreground">
                          I consent to MET collecting and using my information *
                        </span>
                        <p className="text-muted-foreground mt-1">
                          Your information will be used to provide employment
                          services and may be shared with relevant MET staff. See
                          our{" "}
                          <Link
                            to="/privacy"
                            className="text-primary hover:underline"
                          >
                            Privacy Policy
                          </Link>{" "}
                          for details.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="accent"
                  onClick={handleSubmit}
                  disabled={!formData.consent || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Registration
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
