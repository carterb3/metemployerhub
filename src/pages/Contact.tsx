import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  User,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  HelpCircle,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { RegionsMap, type RegionLocation } from "@/components/regions/RegionsMap";
import { PostalCodeFinder } from "@/components/regions/PostalCodeFinder";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const regionLocations: RegionLocation[] = [
  {
    name: "Winnipeg",
    office: "Winnipeg MET",
    address: "412 - 200 Main Street, Winnipeg, MB R3C 1A8",
    phone: "204-586-8474 ext. 2796",
    email: "WPGMET@mmf.mb.ca",
    lat: 49.8954,
    lng: -97.1385,
    areas: ["Winnipeg", "Selkirk", "Steinbach"],
  },
  {
    name: "Southwest",
    office: "Southwest MET",
    address: "656 6th Street, Brandon, MB R7A 3P1",
    phone: "204-725-7525",
    email: "SWMET@mmf.mb.ca",
    lat: 49.8485,
    lng: -99.9501,
    areas: ["Brandon", "Portage la Prairie", "Virden", "Souris"],
  },
  {
    name: "Southeast",
    office: "Southeast MET",
    address: "56 Parkview Avenue, Grand Marais, MB R0E 0T0",
    phone: "204-754-3112",
    email: "SEMET@mmf.mb.ca",
    lat: 50.5167,
    lng: -96.5833,
    areas: ["Ste. Anne", "Lorette", "La Broquerie", "Grand Marais"],
  },
  {
    name: "Interlake",
    office: "Interlake MET",
    address: "28 St. Laurent Drive, St. Laurent, MB R0C 2S0",
    phone: "204-646-4091",
    email: "INTMET@mmf.mb.ca",
    lat: 50.4333,
    lng: -98.3667,
    areas: ["St. Laurent", "Gimli", "Arborg", "Fisher Branch"],
  },
  {
    name: "Northwest",
    office: "Northwest MET",
    address: "422 Main Street South, Dauphin, MB R7N 1K9",
    phone: "204-638-9485",
    email: "NWMET@mmf.mb.ca",
    lat: 51.1493,
    lng: -100.0498,
    areas: ["Dauphin", "Roblin", "Winnipegosis", "Ste. Rose"],
  },
  {
    name: "The Pas",
    office: "The Pas MET",
    address: "456 Fisher Avenue, The Pas, MB R9A 1M2",
    phone: "204-623-5701",
    email: "PASMET@mmf.mb.ca",
    lat: 53.8251,
    lng: -101.2543,
    areas: ["The Pas", "Flin Flon", "Cranberry Portage"],
  },
  {
    name: "Thompson",
    office: "Thompson MET",
    address: "171 Cree Road, Thompson, MB R8N 0C2",
    phone: "204-677-1430",
    email: "THOMET@mmf.mb.ca",
    lat: 55.7433,
    lng: -97.8553,
    areas: ["Thompson", "Norway House", "Cross Lake"],
  },
];

const steps = [
  { id: 1, name: "Contact Info", icon: User },
  { id: 2, name: "Location", icon: MapPin },
  { id: 3, name: "Employment", icon: Briefcase },
  { id: 4, name: "Review", icon: CheckCircle2 },
];

const regionOptions = [
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

export default function ContactPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("offices");

  // Job seeker registration form state
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

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(selectedRegion === regionName ? null : regionName);
  };

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

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      preferredContact: [],
      postalCode: "",
      region: "",
      city: "",
      employmentStatus: "",
      employmentGoals: [],
      skills: [],
      otherSkills: "",
      resume: null,
      supportNeeds: "",
      consent: false,
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 sm:py-16">
        <div className="container-mobile">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            MET has offices across Manitoba to serve Red River Métis job seekers and
            employers in every region. Register for career support or find your nearest office.
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-background border-b border-border">
        <div className="container-mobile">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
              <TabsTrigger value="offices">Find an Office</TabsTrigger>
              <TabsTrigger value="register">Get Career Support</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {activeTab === "offices" && (
        <>
          {/* Find My Region + Interactive Map */}
          <section className="section-padding bg-secondary/30">
            <div className="container-mobile">
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Find Your Nearest Office
                </h2>
                <p className="text-muted-foreground">
                  Enter your postal code or click on the map to find your regional office
                </p>
              </div>

              {/* Postal Code Finder */}
              <div className="max-w-md mx-auto mb-8">
                <PostalCodeFinder
                  locations={regionLocations}
                  onRegionFound={(regionName) => setSelectedRegion(regionName)}
                />
              </div>

              {/* Map */}
              <div className="h-[400px] sm:h-[500px] max-w-5xl mx-auto">
                <RegionsMap
                  locations={regionLocations}
                  selectedRegion={selectedRegion}
                  onRegionSelect={setSelectedRegion}
                />
              </div>
            </div>
          </section>

          {/* Regions Grid */}
          <section className="section-padding bg-background">
            <div className="container-mobile">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regionLocations.map((region) => (
                  <button
                    key={region.name}
                    onClick={() => handleRegionClick(region.name)}
                    className={cn(
                      "bg-card rounded-xl border p-6 text-left transition-all duration-200",
                      selectedRegion === region.name
                        ? "border-primary ring-2 ring-primary/20 shadow-lg"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    )}
                  >
                    <h2 className="font-serif text-xl font-bold text-foreground mb-1">
                      {region.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {region.office}
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{region.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-primary shrink-0" />
                        <a
                          href={`tel:${region.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {region.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-primary shrink-0" />
                        <a
                          href={`mailto:${region.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {region.email}
                        </a>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">Monday–Friday, 8:30 AM – 4:30 PM</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Serving communities including:
                      </p>
                      <p className="text-sm text-foreground">
                        {region.areas.join(", ")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "register" && (
        <>
          {isSubmitted ? (
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
                    <Button variant="outline" onClick={resetForm}>
                      Submit Another Registration
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <>
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
                                {regionOptions.map((region) => (
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
                            <Label htmlFor="otherSkills">
                              Other Skills or Certifications
                            </Label>
                            <Textarea
                              id="otherSkills"
                              value={formData.otherSkills}
                              onChange={(e) => updateField("otherSkills", e.target.value)}
                              className="mt-1.5"
                              placeholder="e.g., Class 5 license, First Aid, specific software..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label className="flex items-center gap-2">
                              Resume Upload (Optional)
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    If you have a resume ready, uploading it helps us better
                                    understand your background. Don't worry if you don't have
                                    one—we can help!
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <div className="mt-1.5">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    {formData.resume ? (
                                      <span className="text-foreground font-medium">
                                        {formData.resume.name}
                                      </span>
                                    ) : (
                                      <>
                                        <span className="font-medium text-primary">
                                          Click to upload
                                        </span>{" "}
                                        or drag and drop
                                      </>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    PDF, DOC, DOCX (max 10MB)
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) =>
                                    updateField("resume", e.target.files?.[0] || null)
                                  }
                                />
                              </label>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="supportNeeds">
                              Any barriers or support needs we should know about?
                            </Label>
                            <Textarea
                              id="supportNeeds"
                              value={formData.supportNeeds}
                              onChange={(e) => updateField("supportNeeds", e.target.value)}
                              className="mt-1.5"
                              placeholder="e.g., childcare, transportation, training costs..."
                              rows={3}
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
                          Please confirm everything looks correct before submitting.
                        </p>

                        <div className="space-y-6">
                          {/* Contact Info Summary */}
                          <div className="bg-card rounded-xl border border-border p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Contact Information
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentStep(1)}
                              >
                                Edit
                              </Button>
                            </div>
                            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <dt className="text-muted-foreground">Name</dt>
                                <dd className="text-foreground font-medium">
                                  {formData.firstName} {formData.lastName}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Email</dt>
                                <dd className="text-foreground font-medium">
                                  {formData.email}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Phone</dt>
                                <dd className="text-foreground font-medium">
                                  {formData.phone}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">
                                  Preferred Contact
                                </dt>
                                <dd className="text-foreground font-medium">
                                  {formData.preferredContact.join(", ") || "Not specified"}
                                </dd>
                              </div>
                            </dl>
                          </div>

                          {/* Location Summary */}
                          <div className="bg-card rounded-xl border border-border p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                Location
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentStep(2)}
                              >
                                Edit
                              </Button>
                            </div>
                            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <dt className="text-muted-foreground">Postal Code</dt>
                                <dd className="text-foreground font-medium">
                                  {formData.postalCode}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">City/Town</dt>
                                <dd className="text-foreground font-medium">
                                  {formData.city}
                                </dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="text-muted-foreground">Region</dt>
                                <dd className="text-foreground font-medium">
                                  {formData.region}
                                </dd>
                              </div>
                            </dl>
                          </div>

                          {/* Employment Summary */}
                          <div className="bg-card rounded-xl border border-border p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-primary" />
                                Employment & Skills
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentStep(3)}
                              >
                                Edit
                              </Button>
                            </div>
                            <dl className="space-y-4 text-sm">
                              <div>
                                <dt className="text-muted-foreground">Status</dt>
                                <dd className="text-foreground font-medium">
                                  {formData.employmentStatus}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Goals</dt>
                                <dd className="text-foreground font-medium">
                                  {formData.employmentGoals.join(", ") || "Not specified"}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground">Skills</dt>
                                <dd className="text-foreground font-medium">
                                  {formData.skills.join(", ") || "Not specified"}
                                </dd>
                              </div>
                              {formData.resume && (
                                <div>
                                  <dt className="text-muted-foreground">Resume</dt>
                                  <dd className="text-foreground font-medium">
                                    {formData.resume.name}
                                  </dd>
                                </div>
                              )}
                            </dl>
                          </div>

                          {/* Consent */}
                          <div className="bg-secondary/50 rounded-xl border border-border p-6">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <Checkbox
                                checked={formData.consent}
                                onCheckedChange={(checked) =>
                                  updateField("consent", checked)
                                }
                                className="mt-0.5"
                              />
                              <span className="text-sm text-muted-foreground">
                                I consent to MET collecting and using my personal
                                information to provide employment services. My information
                                will be handled in accordance with MMF's privacy policy and
                                may be shared with relevant MET regional offices.{" "}
                                <a href="#" className="text-primary hover:underline">
                                  View Privacy Policy
                                </a>
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                      {currentStep > 1 ? (
                        <Button variant="outline" onClick={handleBack}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                      ) : (
                        <div />
                      )}

                      {currentStep < 4 ? (
                        <Button onClick={handleNext}>
                          Continue
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={!formData.consent}
                          variant="accent"
                        >
                          Submit Registration
                          <CheckCircle2 className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </Layout>
  );
}
