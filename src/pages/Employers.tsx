import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
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

const benefits = [
  {
    icon: Users,
    title: "Access Métis Talent",
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

export default function EmployersPage() {
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
              Connect with skilled Métis job seekers and access free recruitment
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

            {/* Post Job Form */}
            <div id="post-job" className="bg-card rounded-xl border border-border p-6 sm:p-8">
              <h3 className="font-serif text-xl font-bold text-foreground mb-6">
                Post a Job or Get in Touch
              </h3>
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input id="companyName" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input id="contactName" className="mt-1.5" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employerEmail">Email *</Label>
                    <Input id="employerEmail" type="email" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="employerPhone">Phone *</Label>
                    <Input id="employerPhone" type="tel" className="mt-1.5" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="inquiryType">What can we help with? *</Label>
                  <Select>
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

                <div>
                  <Label htmlFor="message">Tell us more</Label>
                  <Textarea
                    id="message"
                    className="mt-1.5"
                    rows={4}
                    placeholder="Describe the position, number of openings, or any questions..."
                  />
                </div>

                <Button variant="accent" className="w-full" size="lg">
                  Submit Inquiry
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We'll respond within 1-2 business days.
                </p>
              </form>
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
                href="tel:1-800-XXX-XXXX"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">
                  1-800-XXX-XXXX
                </span>
              </a>
              <a
                href="mailto:employers@mmf.mb.ca"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">
                  employers@mmf.mb.ca
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
