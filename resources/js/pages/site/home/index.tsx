import SiteLayout from '@/layouts/site/site-layout'
import { Link, usePage } from '@inertiajs/react'
import { Header } from '../components/header';
import { HeroSection } from '../components/hero-section';
import { FeaturesSection } from '../components/features-section';
import { BenefitsSection } from '../components/benefits-section';
import { PricingSection } from '../components/pricing-section';
import { CTASection } from '../components/cta-section';
import { Footer } from '../components/footer';

export default function Home() {
  const { auth } = usePage().props as any;
  console.log(auth);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
    // <SiteLayout>
    //   <div className="container mx-auto">
    //     <h1 className="text-2xl font-bold text-gray-600">
    //       {!auth?.user &&
    //         <div className='flex gap-8'>
    //         <Link href={route('login')}>Entrar</Link>
    //         <Link href={route('register')}>Registrar</Link>
    //         </div>
    //       }
    //       {auth?.user && auth?.user?.tenant_id
    //         ? <Link href={route('app.dashboard')}>{auth?.user?.name}</Link>
    //         : <Link href={route('admin.dashboard')}>{auth?.user?.name}</Link>
    //       }
    //     </h1>
    //   </div>
    // </SiteLayout>
  )
}
