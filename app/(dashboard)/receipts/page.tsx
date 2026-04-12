import { fetchCustomers } from '@/lib/webapi';
import { getPortalContext } from '@/lib/portalContext';
import ReceiptsTable from '@/app/components/ReceiptsTable';

export default async function ReceiptsPage() {
  const ctx = await getPortalContext();
  if (!ctx || (!ctx.isSuperAdmin && ctx.role !== 'org:sistema' && ctx.role !== 'org:verificador' && ctx.role !== 'org:admin')) {
    return <div className="rounded border bg-white p-4">Acceso denegado.</div>;
  }

  // Fetch customers/organizations from backend
  let organizations: { id: string; name: string }[] = [];
  try {
    const customers = await fetchCustomers();
    organizations = customers.map(c => ({ id: c.customerId, name: c.customerName ?? c.customerId }));
    if (!ctx.isSuperAdmin) {
      organizations = organizations.filter(o => o.id === ctx.orgId);
    }
  } catch { /* leave empty */ }

  return (
    <div className="space-y-4">
      <div className="rounded border bg-white p-4">
        <div className="text-lg font-semibold">Vouchers</div>
      </div>
      {/* Pass organizations as prop to ReceiptsTable (client component) */}
      <ReceiptsTable organizations={organizations} />
    </div>
  );
}
