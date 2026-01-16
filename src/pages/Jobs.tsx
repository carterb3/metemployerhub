import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Briefcase, Clock, Filter, X, ArrowRight, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { 
  useJobs, 
  regionLabels, 
  categoryLabels, 
  employmentTypeLabels,
  isJobNew,
  formatPostedDate,
  Job
} from "@/hooks/useJobs";
import { MMFJobWidget } from "@/components/jobs/MMFJobWidget";

// Filter options from database enums
const regions = [
  { value: "all", label: "All Regions" },
  { value: "winnipeg", label: "Winnipeg" },
  { value: "southeast", label: "Southeast" },
  { value: "interlake", label: "Interlake" },
  { value: "parklands", label: "Parklands" },
  { value: "northwest", label: "Northwest" },
  { value: "the_pas", label: "The Pas" },
  { value: "thompson", label: "Thompson" },
  { value: "swan_river", label: "Swan River" },
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

interface JobCardProps {
  job: Job;
}

function JobCard({ job }: JobCardProps) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-muted-foreground">
            {job.employers?.company_name || "Employer"}
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {isJobNew(job.posted_at) && <Badge variant="new">New</Badge>}
          {job.is_remote && <Badge variant="remote">Remote</Badge>}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {job.city ? `${job.city}, ` : ""}
          {regionLabels[job.region] || job.region}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" />
          {employmentTypeLabels[job.employment_type] || job.employment_type}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatPostedDate(job.posted_at)}
        </span>
      </div>

      <div className="flex items-center justify-start pt-3">
        <span className="text-sm font-medium text-primary hover:text-[#b12028] flex items-center transition-colors">
          View Details
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

interface JobListProps {
  jobs: Job[] | undefined;
  isLoading: boolean;
  error: Error | null;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  emptyMessage?: string;
}

function JobList({ jobs, isLoading, error, hasActiveFilters, clearFilters, emptyMessage }: JobListProps) {
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
            <div className="h-6 bg-muted rounded w-2/3 mb-3" />
            <div className="h-4 bg-muted rounded w-1/3 mb-4" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          No jobs found
        </h3>
        <p className="text-muted-foreground mb-4">
          {emptyMessage || (hasActiveFilters 
            ? "Try adjusting your search or filters"
            : "Check back soon for new opportunities"
          )}
        </p>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("mmf");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "all");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounce search
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedRegion("all");
    setSelectedCategory("all");
    setSelectedType("all");
  };

  const hasActiveFilters =
    !!searchQuery || selectedRegion !== "all" || selectedCategory !== "all" || selectedType !== "all";

  const getJobCount = (tabValue: string) => {
    if (tabValue === "mmf") return null; // External widget, no count
    return filteredJobs[tabValue as keyof typeof filteredJobs]?.length || 0;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary py-12 sm:py-16">
        <div className="container-mobile">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Find Your Next Opportunity
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl">
            Browse job openings from employers across Manitoba who value Métis talent.
          </p>

          {/* Search Bar - only show for non-MMF tabs */}
          {activeTab !== "mmf" && (
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by job title or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background border-0"
                />
              </div>
              <Button
                variant="hero-outline"
                size="lg"
                className="lg:hidden"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-background border-b border-border">
        <div className="container-mobile">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-0 overflow-x-auto flex-nowrap">
              {listingTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
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
      <section className="section-padding bg-background">
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
                  {/* Filters Sidebar */}
                  <aside
                    className={cn(
                      "lg:w-64 shrink-0",
                      showMobileFilters ? "block" : "hidden lg:block"
                    )}
                  >
                    <div className="bg-card rounded-xl border border-border p-5 sticky top-24">
                      <div className="flex items-center justify-between mb-5">
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

                      <Button
                        variant="outline"
                        className="w-full mt-5 lg:hidden"
                        onClick={() => setShowMobileFilters(false)}
                      >
                        Apply Filters
                      </Button>
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
                            <span className="font-medium text-foreground">
                              {filteredJobs[tabValue as keyof typeof filteredJobs]?.length || 0}
                            </span>{" "}
                            {(filteredJobs[tabValue as keyof typeof filteredJobs]?.length || 0) === 1 ? "job" : "jobs"} found
                          </>
                        )}
                      </p>
                    </div>

                    {/* Active Filters */}
                    {hasActiveFilters && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {searchQuery && (
                          <Badge variant="secondary" className="gap-1 pr-1">
                            "{searchQuery}"
                            <button onClick={() => setSearchQuery("")} className="ml-1 p-0.5 hover:bg-muted rounded">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {selectedRegion !== "all" && (
                          <Badge variant="secondary" className="gap-1 pr-1">
                            {regionLabels[selectedRegion] || selectedRegion}
                            <button onClick={() => setSelectedRegion("all")} className="ml-1 p-0.5 hover:bg-muted rounded">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {selectedCategory !== "all" && (
                          <Badge variant="secondary" className="gap-1 pr-1">
                            {categoryLabels[selectedCategory] || selectedCategory}
                            <button onClick={() => setSelectedCategory("all")} className="ml-1 p-0.5 hover:bg-muted rounded">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {selectedType !== "all" && (
                          <Badge variant="secondary" className="gap-1 pr-1">
                            {employmentTypeLabels[selectedType] || selectedType}
                            <button onClick={() => setSelectedType("all")} className="ml-1 p-0.5 hover:bg-muted rounded">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                      </div>
                    )}

                    <JobList
                      jobs={filteredJobs[tabValue as keyof typeof filteredJobs]}
                      isLoading={isLoading}
                      error={error}
                      hasActiveFilters={hasActiveFilters}
                      clearFilters={clearFilters}
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
