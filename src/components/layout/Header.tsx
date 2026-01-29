import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const navigation = [
  { name: "Find a Job", href: "/jobs" },
  { name: "For Employers", href: "/employers" },
  { name: "Programs", href: "/programs" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="container-mobile flex h-16 items-center justify-between lg:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="Métis Employment & Training" 
            className="h-12 lg:h-14 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive(item.href)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/employers">Post a Job</Link>
          </Button>
          <Button variant="accent" size="sm" asChild>
            <Link to="/contact">Get Support</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <div className="container-mobile py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-border space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/employers" onClick={() => setMobileMenuOpen(false)}>
                  Post a Job
                </Link>
              </Button>
              <Button variant="accent" className="w-full" asChild>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  Get Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
