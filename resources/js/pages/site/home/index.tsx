import { Head } from '@inertiajs/react';
import { BenefitsSection } from '../components/benefits-section';
import { CTASection } from '../components/cta-section';
import { FeaturesSection } from '../components/features-section';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { HeroSection } from '../components/hero-section';
import { PricingSection } from '../components/pricing-section';

export default function Home({ plans }: { plans: any[] }) {
    const trialDays = Number(plans[0]?.trial_days ?? 14);
    const monthlyPrice = (accountType: string) =>
        plans.find((plan) => plan.account_type === accountType)?.periods?.find((period: any) => Number(period.interval_count) === 1)?.price;

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-950">
            <Head title="VetorPet — Gestão comercial para representantes">
                <meta name="description" content="Organize clientes, catálogo, visitas, pedidos e vendedores com o VetorPet." />
                <meta name="theme-color" content="#ffffff" />
            </Head>
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
    );
}
