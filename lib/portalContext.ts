import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type PortalRole = string;

type VirtualitiCustomer = {
  customer_id: string;
  customer_name?: string;
  role?: string;
};

type PortalCustomer = {
  id: string;
  name: string;
  role?: string;
};

export type PortalContext = {
  userId: string;
  orgId: string;
  customers: PortalCustomer[];
  allowedCustomerIds: string[];
  email?: string;
  role?: PortalRole;
  isSuperAdmin: boolean;
  fullName?: string;
};

export async function getPortalContext(): Promise<PortalContext> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) throw new Error('Not authenticated');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Missing auth token');

  const appId = process.env.NEXT_PUBLIC_VIRTUALITI_APP_ID;
  if (!appId) {
    throw new Error('Missing NEXT_PUBLIC_VIRTUALITI_APP_ID configuration.');
  }

  const userMeta = (user.user_metadata ?? {}) as {
    virtualiti?: {
      full_name?: string;
      is_super_admin?: boolean;
      applications?: Array<{
        application_id?: string;
        customers?: VirtualitiCustomer[];
      }>;
    };
  };

  const applications = userMeta.virtualiti?.applications ?? [];
  const appAccess = applications.find((app) => app.application_id === appId);
  const isSuperAdmin = userMeta.virtualiti?.is_super_admin === true;

  if (!appAccess && !isSuperAdmin) {
    throw new Error('No access to VouChek application.');
  }

  const customers: PortalCustomer[] = (appAccess?.customers ?? [])
    .filter((customer): customer is VirtualitiCustomer => Boolean(customer?.customer_id))
    .map((customer) => ({
      id: customer.customer_id,
      name: customer.customer_name?.trim() || customer.customer_id,
      role: customer.role,
    }));

  const allowedCustomerIds = customers.map((customer) => customer.id);
  const primaryCustomer = customers[0];

  const email = user.email;
  const fullName = userMeta.virtualiti?.full_name || undefined;
  const orgId = primaryCustomer?.id ?? '';
  const role = primaryCustomer?.role;

  return {
    userId: user.id,
    orgId,
    customers,
    allowedCustomerIds,
    email,
    role,
    isSuperAdmin,
    fullName,
  };
}
