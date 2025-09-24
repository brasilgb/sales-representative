import SiteLayout from '@/layouts/site/site-layout'
import { Link, usePage } from '@inertiajs/react'

export default function Home() {
  const { auth } = usePage().props as any;
  console.log(auth);

  return (
    <SiteLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-gray-600">
          {!auth?.user &&
            <div className='flex gap-8'>
            <Link href={route('login')}>Entrar</Link>
            <Link href={route('register')}>Registrar</Link>
            </div>
          }
          {auth?.user && auth?.user?.tenant_id
            ? <Link href={route('app.dashboard')}>{auth?.user?.name}</Link>
            : <Link href={route('admin.dashboard')}>{auth?.user?.name}</Link>
          }
        </h1>
      </div>
    </SiteLayout>
  )
}
