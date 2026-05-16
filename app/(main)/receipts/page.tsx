import { getPortalContext } from '@/lib/portalContext';
import { fetchReceiptsPage } from '@/lib/webapi';
import type { ReceiptPage } from '@/lib/api-types';
import ReceiptsTable from '@/app/components/ReceiptsTableMantine';

const INITIAL_RECEIPTS_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_RECEIPTS_PAGE_SIZE) || 50;

function getTodayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDate(date?: string): string {
  if (!date) return getTodayLocalDateString();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getTodayLocalDateString();
}

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; timezoneOffsetMinutes?: string; transactionSource?: string; userId?: string; userName?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = normalizeDate(params?.date);
  const initialTimezoneOffsetMinutes = params?.timezoneOffsetMinutes ? Number(params.timezoneOffsetMinutes) : undefined;
  const initialTransactionSource = params?.transactionSource?.trim() || undefined;
  const initialUserId = params?.userId?.trim() || undefined;
  const initialUserName = params?.userName?.trim() || undefined;

  let ctx;
  try {
    ctx = await getPortalContext();
  } catch {
    return <div className="rounded border bg-white p-4">Acceso denegado.</div>;
  }

  if (!ctx.isSuperAdmin && ctx.allowedCustomerIds.length === 0) {
    return <div className="rounded border bg-white p-4">Acceso denegado.</div>;
  }

  const organizations = ctx.customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
  }));

  let initialReceiptsPage: ReceiptPage = {
    customerId: '',
    page: 1,
    pageSize: INITIAL_RECEIPTS_PAGE_SIZE,
    hasMore: false,
    lastUpdatedAt: null,
    receipts: [],
    totalCount: 0,
  };

  const initialOrgId = organizations[0]?.id;
  if (initialOrgId) {
    try {
      initialReceiptsPage = await fetchReceiptsPage(initialOrgId, {
        take: INITIAL_RECEIPTS_PAGE_SIZE,
        date: selectedDate,
        timezoneOffsetMinutes: Number.isFinite(initialTimezoneOffsetMinutes) ? initialTimezoneOffsetMinutes : undefined,
        transactionSource: initialTransactionSource,
        userId: initialUserId,
      });
    } catch {
      initialReceiptsPage = {
        customerId: initialOrgId,
        page: 1,
        pageSize: INITIAL_RECEIPTS_PAGE_SIZE,
        hasMore: false,
        lastUpdatedAt: null,
        receipts: [],
        totalCount: 0,
      };
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded border bg-white p-4">
        <div className="text-lg font-semibold">Vouchers</div>
      </div>
      <ReceiptsTable
        organizations={organizations}
        showOrganizationSelector={organizations.length > 1}
        isSuperAdmin={ctx.isSuperAdmin}
        initialDate={selectedDate}
        initialTimezoneOffsetMinutes={Number.isFinite(initialTimezoneOffsetMinutes) ? initialTimezoneOffsetMinutes : undefined}
        initialTransactionSource={initialTransactionSource}
        initialUserId={initialUserId}
        initialUserName={initialUserName}
        initialReceiptsPage={initialReceiptsPage}
      />
    </div>
  );
}
