import { Link } from "react-router-dom";
import { ArrowLeft, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

interface JobNotFoundProps {
  isExpired?: boolean;
}

export function JobNotFound({ isExpired = false }: JobNotFoundProps) {
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="container-mobile text-center py-16 max-w-lg">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {isExpired ? "This Job Has Expired" : "Job Not Found"}
          </h1>
          
          <p className="text-muted-foreground mb-8 text-lg">
            {isExpired 
              ? "This position is no longer accepting applications. Check out our other opportunities below."
              : "This job posting may have been removed or the link is incorrect."
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/jobs">
                <Search className="mr-2 h-4 w-4" />
                Browse All Jobs
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
