import { Header } from '../components/header';
import { HeroSection } from '../components/hero-section';
import { FeaturesSection } from '../components/features-section';
import { BenefitsSection } from '../components/benefits-section';
import { PricingSection } from '../components/pricing-section';
import { CTASection } from '../components/cta-section';
import { Footer } from '../components/footer';

export default function Home({ plans }: { plans: any[] }) {
  const trialDays = Number(plans[0]?.trial_days ?? 14);
  const monthlyPrice = (accountType: string) => plans
    .find((plan) => plan.account_type === accountType)
    ?.periods?.find((period: any) => Number(period.interval_count) === 1)?.price;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection trialDays={trialDays} individualMonthlyPrice={monthlyPrice('individual')} />
        <FeaturesSection />
        <BenefitsSection />
        <PricingSection plans={plans} />
        <CTASection trialDays={trialDays} individualMonthlyPrice={monthlyPrice('individual')} teamMonthlyPrice={monthlyPrice('team')} />
      </main>
      <Footer />
    </div>
  )
}
