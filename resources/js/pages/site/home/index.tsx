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
            <Link href={route('login')}>Login</Link>
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
