import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";

export function JobLoadingSkeleton() {
  return (
    <Layout>
      {/* Header Skeleton */}
      <section className="bg-primary py-10 sm:py-12">
        <div className="container-mobile">
          <Skeleton className="h-4 w-48 bg-primary-foreground/20 mb-6" />
          
          <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16 bg-primary-foreground/20" />
                <Skeleton className="h-6 w-12 bg-primary-foreground/20" />
              </div>
              <Skeleton className="h-10 w-3/4 bg-primary-foreground/20 mb-3" />
              <Skeleton className="h-6 w-48 bg-primary-foreground/20 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-32 bg-primary-foreground/20" />
                <Skeleton className="h-5 w-28 bg-primary-foreground/20" />
                <Skeleton className="h-5 w-24 bg-primary-foreground/20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 bg-primary-foreground/20" />
              <Skeleton className="h-10 w-10 bg-primary-foreground/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="section-padding bg-background">
        <div className="container-mobile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              
              <div className="bg-card rounded-xl border border-border p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>
              
              <div className="bg-card rounded-xl border border-border p-6">
                <Skeleton className="h-14 w-14 rounded-xl mb-3" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
