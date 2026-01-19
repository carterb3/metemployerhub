import DOMPurify from "dompurify";
import { FileText } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface JobDescriptionProps {
  description: string;
  requirements?: string | null;
}

// Configure DOMPurify to allow safe HTML tags
const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ADD_ATTR: ['target'],
  });
};

const proseClasses = `prose prose-slate dark:prose-invert max-w-none text-foreground/80
  prose-headings:text-foreground prose-headings:font-semibold
  prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
  prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
  prose-p:my-3 prose-p:leading-relaxed
  prose-ul:my-3 prose-ol:my-3
  prose-li:my-1 prose-a:text-primary prose-a:no-underline hover:prose-a:underline
  prose-strong:text-foreground`;

export function JobDescription({ description, requirements }: JobDescriptionProps) {
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(true);

  return (
    <div className="space-y-6">
      {/* About This Role */}
      <section className="bg-card rounded-xl border border-border p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            About This Role
          </h2>
        </div>
        <div 
          className={proseClasses}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
        />
      </section>

      {/* Requirements */}
      {requirements && (
        <Collapsible 
          open={isRequirementsOpen} 
          onOpenChange={setIsRequirementsOpen}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-6 sm:p-8 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Requirements & Qualifications
              </h2>
            </div>
            <ChevronDown 
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                isRequirementsOpen ? 'rotate-180' : ''
              }`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              <div 
                className={proseClasses}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(requirements) }}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
