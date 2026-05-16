import { getPortalContext } from '@/lib/portalContext'
import { AppNavbar } from '../../components/layout/Navbar'
import { AppBreadcrumbs } from '../../components/layout/Breadcrumbs'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import MainShell from './MainShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await getPortalContext();
  } catch {
    return <div className="rounded border bg-white p-4 m-4">Acceso denegado.</div>;
  }

  // Get user data for header
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <MainShell user={user}>
      <div className="flex">
        <div style={{ width: 300 }}>
          <AppNavbar canSeeAdmin={false} canSeeSuper={false} />
        </div>
        <main style={{ flex: 1 }} className="pr-5">
          <div className="p-4">
            <AppBreadcrumbs />
          </div>
          {children}
        </main>
      </div>
    </MainShell>
  );
}
