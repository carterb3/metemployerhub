import { Link } from "react-router-dom";
import { Mail, Phone, MessageSquare, FileText, ExternalLink } from "lucide-react";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does it take for my job posting to be approved?",
    answer: "Job postings are typically reviewed and approved within 1-2 business days. You'll receive an email notification once your posting is live.",
  },
  {
    question: "Can I edit a job posting after it's been published?",
    answer: "Once a job is active, you cannot edit it directly. Please contact MET staff if you need to make changes to a live posting. You can edit postings that are still in 'Draft' or 'Pending Review' status.",
  },
  {
    question: "How do I access applicant information?",
    answer: "If candidates apply through MET, our staff will coordinate referrals with you directly. You'll receive candidate information via email or phone based on your preferred contact method.",
  },
  {
    question: "What is the 'Apply through MET' option?",
    answer: "When you select 'Apply through MET', candidates submit their applications to MET staff who then pre-screen and refer qualified candidates to you. This can save you time reviewing unqualified applicants.",
  },
  {
    question: "How long do job postings stay active?",
    answer: "By default, job postings remain active for 30 days. You can request an extension by contacting MET staff, or close the posting early once the position is filled.",
  },
  {
    question: "Can I repost a closed or expired job?",
    answer: "Yes! You can create a new posting based on a previous one. Go to 'My Postings', view the job you want to repost, and use the information as a template for a new posting.",
  },
];

export default function EmployerHelp() {
  return (
    <EmployerLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground">
            Find answers to common questions or get in touch with our team
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get help via email within 1-2 business days
                  </p>
                  <a
                    href="mailto:employment@mmf.mb.ca"
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    employment@mmf.mb.ca
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Mon-Fri, 8:30 AM - 4:30 PM CT
                  </p>
                  <a
                    href="tel:204-586-8474"
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    204-586-8474
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resources
            </CardTitle>
            <CardDescription>Helpful links and guides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/employers">
                <ExternalLink className="mr-2 h-4 w-4" />
                About MET Employer Services
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/jobs">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public Job Board
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  );
}
