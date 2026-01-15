import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { PathwayCards } from "@/components/home/PathwayCards";
import { FeaturedJobs } from "@/components/home/FeaturedJobs";
import { WhyMET } from "@/components/home/WhyMET";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <PathwayCards />
      <FeaturedJobs />
      <WhyMET />
      <CTASection />
    </Layout>
  );
};

export default Index;
