import { Header } from '../components/header';
import { HeroSection } from '../components/hero-section';
import { FeaturesSection } from '../components/features-section';
import { BenefitsSection } from '../components/benefits-section';
import { PricingSection } from '../components/pricing-section';
import { CTASection } from '../components/cta-section';
import { Footer } from '../components/footer';

export default function Home({ plans }: { plans: any[] }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <PricingSection plans={plans} />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
