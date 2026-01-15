import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Briefcase, Clock, Filter, X, ChevronDown, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Mock job data
const allJobs = [
  {
    id: "1",
    title: "Administrative Assistant",
    company: "Manitoba Hydro",
    location: "Winnipeg, MB",
    region: "Winnipeg",
    type: "Full-time",
    category: "Administration",
    salary: "$45,000 - $52,000",
    isRemote: false,
    isNew: true,
    postedDate: "2 days ago",
    description: "Support office operations with administrative tasks, scheduling, and document management.",
  },
  {
    id: "2",
    title: "Heavy Equipment Operator",
    company: "Northern Construction Ltd.",
    location: "Thompson, MB",
    region: "The Pas",
    type: "Full-time",
    category: "Trades & Construction",
    salary: "$32 - $38/hour",
    isRemote: false,
    isNew: true,
    postedDate: "1 day ago",
    description: "Operate excavators and loaders on construction sites. Valid Class 1 license required.",
  },
  {
    id: "3",
    title: "Customer Service Representative",
    company: "Red River Mutual",
    location: "Remote",
    region: "Remote",
    type: "Full-time",
    category: "Customer Service",
    salary: "$40,000 - $48,000",
    isRemote: true,
    isNew: false,
    postedDate: "5 days ago",
    description: "Handle customer inquiries and provide support via phone, email, and chat.",
  },
  {
    id: "4",
    title: "Carpenter Apprentice",
    company: "Prairies Builders Co-op",
    location: "Brandon, MB",
    region: "Southwest",
    type: "Full-time",
    category: "Trades & Construction",
    salary: "$22 - $28/hour",
    isRemote: false,
    isNew: false,
    postedDate: "1 week ago",
    description: "Learn carpentry skills while working on residential and commercial projects.",
  },
  {
    id: "5",
    title: "Registered Nurse",
    company: "Prairie Mountain Health",
    location: "Dauphin, MB",
    region: "Northwest",
    type: "Full-time",
    category: "Healthcare",
    salary: "$38 - $52/hour",
    isRemote: false,
    isNew: true,
    postedDate: "3 days ago",
    description: "Provide patient care in a hospital setting. BN/RN certification required.",
  },
  {
    id: "6",
    title: "IT Support Technician",
    company: "Manitoba Métis Federation",
    location: "Winnipeg, MB",
    region: "Winnipeg",
    type: "Full-time",
    category: "Technology",
    salary: "$50,000 - $60,000",
    isRemote: false,
    isNew: false,
    postedDate: "2 weeks ago",
    description: "Provide technical support and maintain IT infrastructure for staff.",
  },
];

const regions = ["All Regions", "Winnipeg", "Southwest", "Southeast", "Interlake", "Northwest", "The Pas", "Remote"];
const categories = ["All Categories", "Administration", "Customer Service", "Healthcare", "Technology", "Trades & Construction", "Education", "Finance"];
const jobTypes = ["All Types", "Full-time", "Part-time", "Contract", "Seasonal"];

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "All Regions");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All Categories");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "All Types");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter jobs
  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === "All Regions" || job.region === selectedRegion;
    const matchesCategory = selectedCategory === "All Categories" || job.category === selectedCategory;
    const matchesType = selectedType === "All Types" || job.type === selectedType;
    return matchesSearch && matchesRegion && matchesCategory && matchesType;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRegion("All Regions");
    setSelectedCategory("All Categories");
    setSelectedType("All Types");
  };

  const hasActiveFilters =
    searchQuery || selectedRegion !== "All Regions" || selectedCategory !== "All Categories" || selectedType !== "All Types";

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

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by job title or company..."
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
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-background">
        <div className="container-mobile">
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
                          <SelectItem key={region} value={region}>
                            {region}
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
                          <SelectItem key={category} value={category}>
                            {category}
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
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                  <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs
                  found
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
                  {selectedRegion !== "All Regions" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {selectedRegion}
                      <button onClick={() => setSelectedRegion("All Regions")} className="ml-1 p-0.5 hover:bg-muted rounded">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory !== "All Categories" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory("All Categories")} className="ml-1 p-0.5 hover:bg-muted rounded">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedType !== "All Types" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      {selectedType}
                      <button onClick={() => setSelectedType("All Types")} className="ml-1 p-0.5 hover:bg-muted rounded">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Job Cards */}
              <div className="space-y-4">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="group block bg-card rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-muted-foreground">{job.company}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {job.isNew && <Badge variant="new">New</Badge>}
                          {job.isRemote && <Badge variant="remote">Remote</Badge>}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {job.postedDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="font-medium text-foreground">{job.salary}</span>
                        <span className="text-sm font-medium text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      No jobs found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
