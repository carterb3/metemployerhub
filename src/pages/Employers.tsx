import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Upload,
  X,
  Loader2,
  LogIn,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";

const benefits = [
  {
    icon: Users,
    title: "Access Red River Métis Talent",
    description:
      "Connect with a diverse pool of skilled, motivated candidates across Manitoba.",
  },
  {
    icon: FileText,
    title: "Free Job Posting",
    description:
      "List your openings at no cost and reach job seekers actively looking for work.",
  },
  {
    icon: CheckCircle2,
    title: "Pre-Screened Candidates",
    description:
      "Our staff can help match your requirements with qualified candidates.",
  },
];

const services = [
  "Post job openings",
  "Receive candidate referrals",
  "Access wage subsidies & grants",
  "On-the-job training support",
  "Workplace cultural training",
  "Recruitment event participation",
];

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function EmployersPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, employer, isEmployer, isApproved, isLoading: authLoading } = useEmployerAuth();
  
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    inquiryType: "",
    businessType: "",
    message: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, inquiryType: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.companyName || !formData.contactName || !formData.email || !formData.phone || !formData.inquiryType) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let attachmentUrl: string | null = null;
      let attachmentFilename: string | null = null;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `inquiries/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("employer-inquiry-attachments")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error("Failed to upload file: " + uploadError.message);
        }

        attachmentUrl = filePath;
        attachmentFilename = file.name;
      }

      // Map inquiry type to enum value
      const inquiryTypeMap: Record<string, string> = {
        "post-job": "job_posting",
        "find-candidates": "candidate_request",
        "wage-subsidy": "general",
        "partnership": "partnership",
        "other": "general",
      };

      // Submit form data
      const { error: insertError } = await supabase
        .from("employer_inquiries")
        .insert({
          company_name: formData.companyName,
          contact_name: formData.contactName,
          contact_email: formData.email,
          contact_phone: formData.phone,
          inquiry_type: inquiryTypeMap[formData.inquiryType] || "general",
          business_type: formData.businessType || null,
          message: formData.message || "No additional message provided.",
          attachment_url: attachmentUrl,
          attachment_filename: attachmentFilename,
        } as any);

      if (insertError) {
        throw new Error("Failed to submit inquiry: " + insertError.message);
      }

      // Show success message
      setShowSuccessMessage(true);

      // Reset form
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        inquiryType: "",
        businessType: "",
        message: "",
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-12 sm:py-16">
        <div className="container-mobile">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-6">
              <Building2 className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground/90">
                For Employers
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-6">
              Partner with MET to Build Your Team
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/85 mb-8">
              Connect with skilled Red River Métis job seekers and access free recruitment
              support, training subsidies, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <a href="#post-job">
                  Post a Job
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <a href="#contact">Contact Our Team</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-background">
        <div className="container-mobile">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Why Partner with MET?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer comprehensive recruitment support at no cost to Manitoba
              employers.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="text-center p-6 rounded-xl bg-card border border-border"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding bg-secondary/30">
        <div className="container-mobile">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Our Services for Employers
              </h2>
              <p className="text-muted-foreground mb-8">
                MET provides a range of recruitment and training services to
                help you find and develop great employees.
              </p>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-foreground">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Post Job Form or Welcome Panel */}
            <div id="post-job" className="bg-card rounded-xl border border-border p-6 sm:p-8">
              {/* Show welcome panel for logged-in employers */}
              {!authLoading && user && isEmployer && isApproved ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                      Welcome back, {employer?.company_name}!
                    </h3>
                    <p className="text-muted-foreground">
                      Access your employer dashboard to post jobs and manage your listings.
                    </p>
                  </div>
                  <Button variant="accent" size="lg" className="w-full" asChild>
                    <Link to="/employer/dashboard">
                      Go to Employer Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              ) : showSuccessMessage ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                      Thank You!
                    </h3>
                    <p className="text-muted-foreground">
                      Your inquiry has been submitted successfully. Our team will review it and contact you within 1-2 business days.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSuccessMessage(false)}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      Post a Job or Get in Touch
                    </h3>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/employer/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Employer Login
                      </Link>
                    </Button>
                  </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input 
                      id="companyName" 
                      className="mt-1.5" 
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input 
                      id="contactName" 
                      className="mt-1.5" 
                      value={formData.contactName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      className="mt-1.5" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      className="mt-1.5" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="inquiryType">What can we help with? *</Label>
                  <Select value={formData.inquiryType} onValueChange={handleSelectChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post-job">Post a job opening</SelectItem>
                      <SelectItem value="find-candidates">
                        Find candidates for a role
                      </SelectItem>
                      <SelectItem value="wage-subsidy">
                        Learn about wage subsidies
                      </SelectItem>
                      <SelectItem value="partnership">
                        Become a partner employer
                      </SelectItem>
                      <SelectItem value="other">Other inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type of Business */}
                <div>
                  <Label>Type of Business *</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      { value: "private", label: "Private" },
                      { value: "non_profit", label: "Non-Profit" },
                      { value: "metis_owned", label: "Red River Métis-owned Business" },
                      { value: "public_government", label: "Public / Government Services / Crown Corporations" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="businessType"
                          value={option.value}
                          checked={formData.businessType === option.value}
                          onChange={(e) => setFormData((prev) => ({ ...prev, businessType: e.target.value }))}
                          className="h-4 w-4 text-primary border-border focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <Label>Upload Job Description (optional)</Label>
                  <div className="mt-1.5">
                    {!file ? (
                      <div 
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, Word, or text file (max 10MB)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileChange}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Tell us more</Label>
                  <Textarea
                    id="message"
                    className="mt-1.5"
                    rows={4}
                    placeholder="Describe the position, number of openings, or any questions..."
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>

                <Button 
                  variant="accent" 
                  className="w-full" 
                  size="lg"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Inquiry
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We'll respond within 1-2 business days.
                </p>
              </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section-padding bg-background">
        <div className="container-mobile">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Questions? We're Here to Help
            </h2>
            <p className="text-muted-foreground mb-8">
              Our employer services team is ready to discuss how MET can support
              your hiring needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:204-586-8474"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">
                  204-586-8474 ext. 2731
                </span>
              </a>
              <a
                href="mailto:MET@mmf.mb.ca"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">
                  MET@mmf.mb.ca
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
