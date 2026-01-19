import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useJob, regionLabels, categoryLabels, employmentTypeLabels } from "@/hooks/useJobs";

// Job Detail Components
import { JobHeader } from "@/components/jobs/detail/JobHeader";
import { JobDescription } from "@/components/jobs/detail/JobDescription";
import { JobCompensation } from "@/components/jobs/detail/JobCompensation";
import { JobLocation } from "@/components/jobs/detail/JobLocation";
import { JobApplicationInstructions } from "@/components/jobs/detail/JobApplicationInstructions";
import { JobTags } from "@/components/jobs/detail/JobTags";
import { JobSidebar } from "@/components/jobs/detail/JobSidebar";
import { JobNotFound } from "@/components/jobs/detail/JobNotFound";
import { JobLoadingSkeleton } from "@/components/jobs/detail/JobLoadingSkeleton";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id || "");

  // Loading state
  if (isLoading) {
    return <JobLoadingSkeleton />;
  }

  // Not found or error state
  if (error || !job) {
    return <JobNotFound />;
  }

  // Check if job is expired
  if (job.expires_at && new Date(job.expires_at) < new Date()) {
    return <JobNotFound isExpired />;
  }

  // Prepare structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description.replace(/<[^>]*>/g, '').substring(0, 500),
    datePosted: job.posted_at || job.created_at,
    validThrough: job.expires_at || undefined,
    employmentType: job.employment_type.toUpperCase().replace('_', ''),
    hiringOrganization: job.employers ? {
      "@type": "Organization",
      name: job.employers.company_name,
      sameAs: job.employers.website || undefined,
    } : {
      "@type": "Organization",
      name: "Métis Employment & Training",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city || regionLabels[job.region],
        addressRegion: job.province || "MB",
        addressCountry: "CA",
      },
    },
    ...(job.pay_visible && job.pay_min && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.pay_currency || "CAD",
        value: {
          "@type": "QuantitativeValue",
          minValue: job.pay_min,
          maxValue: job.pay_max || job.pay_min,
          unitText: job.pay_period?.toUpperCase() || "YEAR",
        },
      },
    }),
    industry: categoryLabels[job.category],
    applicantLocationRequirements: job.is_remote ? {
      "@type": "Country",
      name: "Canada",
    } : undefined,
    jobLocationType: job.is_remote ? "TELECOMMUTE" : undefined,
  };

  const pageTitle = `${job.title} - ${job.employers?.company_name || 'MET'} | MET Jobs`;
  const pageDescription = `${job.title} position in ${job.city || regionLabels[job.region]}, Manitoba. ${employmentTypeLabels[job.employment_type]}. Apply now through Métis Employment & Training.`;

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Hero Header */}
      <JobHeader job={job} />

      {/* Main Content */}
      <section className="section-padding bg-background">
        <div className="container-mobile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Job Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description & Requirements */}
              <JobDescription 
                description={job.description} 
                requirements={job.requirements} 
              />

              {/* Compensation */}
              <JobCompensation job={job} />

              {/* Location */}
              <JobLocation job={job} />

              {/* Tags & Documents */}
              <JobTags job={job} />

              {/* Application Instructions - Prominent at bottom */}
              <JobApplicationInstructions job={job} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="order-first lg:order-last">
              <JobSidebar job={job} />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
