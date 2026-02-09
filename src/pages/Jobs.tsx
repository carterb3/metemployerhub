import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Filter, 
  X, 
  ArrowRight, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { JobCard, JobCardSkeleton } from "@/components/jobs/JobCard";
import { 
  useJobs, 
  regionLabels, 
  categoryLabels, 
  employmentTypeLabels,
  Job
} from "@/hooks/useJobs";
import { formatRegion } from "@/lib/regions";
import { MMFJobWidget } from "@/components/jobs/MMFJobWidget";

const JOBS_PER_PAGE = 12;

// Filter options from database enums
const regions = [
  { value: "all", label: "All Regions" },
  ...Object.entries(regionLabels).map(([value, label]) => ({ value, label })),
];

const categories = [
  { value: "all", label: "All Categories" },
  { value: "administration", label: "Administration" },
  { value: "construction_trades", label: "Construction & Trades" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hospitality", label: "Hospitality" },
  { value: "information_technology", label: "Information Technology" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "natural_resources", label: "Natural Resources" },
  { value: "retail_sales", label: "Retail & Sales" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" },
];

const employmentTypes = [
  { value: "all", label: "All Types" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "seasonal", label: "Seasonal" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

const listingTabs = [
  { value: "mmf", label: "MMF & Affiliates" },
  { value: "summer_employment", label: "Summer Employment" },
  { value: "met_positions", label: "MET Positions" },
  { value: "partner_jobs", label: "Partner Opportunities" },
  { value: "training_programs", label: "Training Programs" },
];

interface JobListProps {
  jobs: Job[] | undefined;
  isLoading: boolean;
  error: Error | null;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  emptyMessage?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function JobList({ 
  jobs, 
  isLoading, 
  error, 
  hasActiveFilters, 
  clearFilters, 
  emptyMessage,
  currentPage,
  totalPages,
  onPageChange
}: JobListProps) {
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive mb-4">Failed to load jobs. Please try again.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-16 bg-card/50 backdrop-blur-sm rounded-xl border border-border">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          No jobs found
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          {emptyMessage || (hasActiveFilters 
            ? "Try adjusting your search or filters to find more opportunities"
            : "Check back soon for new opportunities"
          )}
        </p>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {jobs.map((job, index) => (
          <div 
            key={job.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <JobCard job={job} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first, last, current, and adjacent pages
                return page === 1 || 
                       page === totalPages || 
                       Math.abs(page - currentPage) <= 1;
              })
              .map((page, index, array) => {
                // Add ellipsis
                const showEllipsis = index > 0 && page - array[index - 1] > 1;
                return (
                  <div key={page} className="flex items-center">
                    {showEllipsis && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className="w-9 h-9"
                    >
                      {page}
                    </Button>
                  </div>
                );
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface FiltersContentProps {
  selectedRegion: string;
  setSelectedRegion: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  onApply?: () => void;
}

function FiltersContent({
  selectedRegion,
  setSelectedRegion,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  hasActiveFilters,
  clearFilters,
  onApply
}: FiltersContentProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-accent hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Region
          </label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Category
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Job Type
          </label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {onApply && (
        <Button className="w-full" onClick={onApply}>
          Apply Filters
        </Button>
      )}
    </div>
  );
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "mmf");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "all");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== "mmf") params.set("tab", activeTab);
    if (searchQuery) params.set("q", searchQuery);
    if (selectedRegion !== "all") params.set("region", selectedRegion);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedType !== "all") params.set("type", selectedType);
    setSearchParams(params, { replace: true });
  }, [activeTab, searchQuery, selectedRegion, selectedCategory, selectedType, setSearchParams]);

  // Fetch jobs with filters
  const { data: allJobs, isLoading, error } = useJobs({
    search: debouncedSearch,
    region: selectedRegion,
    category: selectedCategory,
    employmentType: selectedType,
  });

  // Filter jobs by listing type for each tab
  const filteredJobs = useMemo(() => {
    if (!allJobs) return {};
    
    return {
      summer_employment: allJobs.filter(job => (job as any).listing_type === 'summer_employment'),
      met_positions: allJobs.filter(job => (job as any).listing_type === 'met_positions'),
      partner_jobs: allJobs.filter(job => (job as any).listing_type === 'partner_jobs'),
      training_programs: allJobs.filter(job => (job as any).listing_type === 'training_programs'),
    };
  }, [allJobs]);

  // Paginate jobs for current tab
  const paginatedJobs = useMemo(() => {
    const tabJobs = filteredJobs[activeTab as keyof typeof filteredJobs] || [];
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    return tabJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
  }, [filteredJobs, activeTab, currentPage]);

  const totalPages = useMemo(() => {
    const tabJobs = filteredJobs[activeTab as keyof typeof filteredJobs] || [];
    return Math.ceil(tabJobs.length / JOBS_PER_PAGE);
  }, [filteredJobs, activeTab]);

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedRegion("all");
    setSelectedCategory("all");
    setSelectedType("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    !!searchQuery || selectedRegion !== "all" || selectedCategory !== "all" || selectedType !== "all";

  const getJobCount = (tabValue: string) => {
    if (tabValue === "mmf") return null;
    return filteredJobs[tabValue as keyof typeof filteredJobs]?.length || 0;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate JSON-LD for job listings
  const jobListingSchema = useMemo(() => {
    const tabJobs = filteredJobs[activeTab as keyof typeof filteredJobs] || [];
    if (tabJobs.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": tabJobs.slice(0, 10).map((job, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "JobPosting",
          "title": job.title,
          "description": job.description?.slice(0, 200),
          "datePosted": job.posted_at,
          "employmentType": job.employment_type?.toUpperCase().replace("_", "_"),
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": job.city || regionLabels[job.region] || job.region,
              "addressRegion": "MB",
              "addressCountry": "CA"
            }
          },
          "hiringOrganization": {
            "@type": "Organization",
            "name": job.employers?.company_name || "Employer"
          }
        }
      }))
    };
  }, [filteredJobs, activeTab]);

  return (
    <Layout>
      <Helmet>
        <title>Job Listings | Métis Employment & Training</title>
        <meta 
          name="description" 
          content="Browse job opportunities across Manitoba for Red River Métis job seekers. Find full-time, part-time, contract, and training positions from employers who value Red River Métis talent." 
        />
        <meta property="og:title" content="Job Listings | Métis Employment & Training" />
        <meta property="og:description" content="Find your next career opportunity with MET. Browse hundreds of jobs from employers across Manitoba." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/jobs" />
        {jobListingSchema && (
          <script type="application/ld+json">
            {JSON.stringify(jobListingSchema)}
          </script>
        )}
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/90 py-12 sm:py-16">
        <div className="container-mobile">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Find Your Next Opportunity
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl">
            Browse job openings from employers across Manitoba who value Red River Métis talent.
          </p>

          {/* Search Bar - only show for non-MMF tabs */}
          {activeTab !== "mmf" && (
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by job title, keyword, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background/95 backdrop-blur-sm border-0 shadow-lg"
                  aria-label="Search jobs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              
              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="hero-outline"
                    size="lg"
                    className="lg:hidden h-12"
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    {hasActiveFilters && (
                      <span className="ml-2 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full">
                        {[selectedRegion !== "all", selectedCategory !== "all", selectedType !== "all"].filter(Boolean).length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filter Jobs</SheetTitle>
                    <SheetDescription>
                      Narrow down your job search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent
                      selectedRegion={selectedRegion}
                      setSelectedRegion={setSelectedRegion}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedType={selectedType}
                      setSelectedType={setSelectedType}
                      hasActiveFilters={hasActiveFilters}
                      clearFilters={clearFilters}
                      onApply={() => setMobileFiltersOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-background border-b border-border sticky top-14 z-30">
        <div className="container-mobile">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-0 overflow-x-auto flex-nowrap scrollbar-hide">
              {listingTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap text-sm sm:text-base"
                >
                  {tab.label}
                  {getJobCount(tab.value) !== null && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {getJobCount(tab.value)}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-gradient-to-b from-background to-secondary/20">
        <div className="container-mobile">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* MMF Widget Tab */}
            <TabsContent value="mmf" className="mt-0">
              <MMFJobWidget />
            </TabsContent>

            {/* Other Job Listing Tabs */}
            {["summer_employment", "met_positions", "partner_jobs", "training_programs"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="mt-0">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Filters Sidebar - Desktop */}
                  <aside className="hidden lg:block lg:w-64 shrink-0">
                    <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 sticky top-32">
                      <FiltersContent
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        hasActiveFilters={hasActiveFilters}
                        clearFilters={clearFilters}
                      />
                    </div>
                  </aside>

                  {/* Job Listings */}
                  <div className="flex-1">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-muted-foreground">
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading jobs...
                          </span>
                        ) : (
                          <>
                            <span className="font-semibold text-foreground">
                              {filteredJobs[tabValue as keyof typeof filteredJobs]?.length || 0}
                            </span>{" "}
                            {(filteredJobs[tabValue as keyof typeof filteredJobs]?.length || 0) === 1 ? "job" : "jobs"} found
                          </>
                        )}
                      </p>
                    </div>

                    {/* Active Filters Pills */}
                    {hasActiveFilters && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {searchQuery && (
                          <Badge variant="secondary" className="gap-1 pr-1 py-1">
                            Search: "{searchQuery}"
                            <button onClick={() => setSearchQuery("")} className="ml-1 p-0.5 hover:bg-muted rounded">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {selectedRegion !== "all" && (
                          <Badge variant="secondary" className="gap-1 pr-1 py-1">
                            {regionLabels[selectedRegion] || selectedRegion}
                            <button onClick={() => setSelectedRegion("all")} className="ml-1 p-0.5 hover:bg-muted rounded">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {selectedCategory !== "all" && (
                          <Badge variant="secondary" className="gap-1 pr-1 py-1">
                            {categoryLabels[selectedCategory] || selectedCategory}
                            <button onClick={() => setSelectedCategory("all")} className="ml-1 p-0.5 hover:bg-muted rounded">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {selectedType !== "all" && (
                          <Badge variant="secondary" className="gap-1 pr-1 py-1">
                            {employmentTypeLabels[selectedType] || selectedType}
                            <button onClick={() => setSelectedType("all")} className="ml-1 p-0.5 hover:bg-muted rounded">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                      </div>
                    )}

                    <JobList
                      jobs={paginatedJobs}
                      isLoading={isLoading}
                      error={error}
                      hasActiveFilters={hasActiveFilters}
                      clearFilters={clearFilters}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      emptyMessage={
                        tabValue === "training_programs" 
                          ? "Training program opportunities coming soon" 
                          : undefined
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
