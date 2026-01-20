import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const footerLinks = {
  jobSeekers: [
    { name: "Find a Job", href: "/jobs" },
    { name: "Register with MET", href: "/register" },
    { name: "Career Resources", href: "/programs" },
    { name: "FAQs", href: "/faqs" },
  ],
  employers: [
    { name: "Post a Job", href: "/employers" },
    { name: "Partner with Us", href: "/employers#partner" },
    { name: "Recruitment Services", href: "/employers#services" },
  ],
  about: [
    { name: "About MET", href: "/about" },
    { name: "Regions & Contacts", href: "/regions" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-mobile section-padding">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                <span className="text-xl font-bold text-primary-foreground">
                  ∞
                </span>
              </div>
              <div>
                <p className="font-serif text-lg font-semibold">
                  MET Recruitment
                </p>
                <p className="text-xs text-primary-foreground/70">
                  Métis Employment & Training
                </p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-primary-foreground/80 max-w-xs">
              Connecting Red River Métis job seekers with meaningful employment
              opportunities across Manitoba.
            </p>
          </div>

          {/* Job Seekers */}
          <div>
            <h3 className="font-serif text-base font-semibold mb-4">
              Job Seekers
            </h3>
            <ul className="space-y-2">
              {footerLinks.jobSeekers.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h3 className="font-serif text-base font-semibold mb-4">
              Employers
            </h3>
            <ul className="space-y-2">
              {footerLinks.employers.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-base font-semibold mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span>204-586-8474 ext. 2731</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <span>MET@mmf.mb.ca</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Manitoba Métis Federation. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/accessibility"
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                Accessibility
              </Link>
              <Link
                to="/admin"
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
