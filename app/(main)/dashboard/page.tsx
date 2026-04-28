import { Title } from '@mantine/core';
import { getPortalContext } from '@/lib/portalContext';
import { fetchReceiptsSummaryByDate } from '@/lib/webapi';
import type { ReceiptsSummaryByDate } from '@/lib/api-types';
import DashboardSummary from '@/app/components/DashboardSummary';

function getTodayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; timezoneOffsetMinutes?: string }>;
}) {
  const params = await searchParams;
  const today = getTodayLocalDateString();
  const date = params?.date ?? today;
  const timezoneOffsetMinutes = params?.timezoneOffsetMinutes ? Number(params.timezoneOffsetMinutes) : undefined;

  const ctx = await getPortalContext();

  let data: ReceiptsSummaryByDate | null = null;
  if (ctx.orgId) {
    try {
      data = await fetchReceiptsSummaryByDate(
        ctx.orgId,
        date,
        Number.isFinite(timezoneOffsetMinutes) ? timezoneOffsetMinutes : undefined,
      );
    } catch {
      // data stays null; the component renders an empty state
    }
  }

  return (
    <>
      <Title order={2} mb="md">Dashboard</Title>
      <DashboardSummary
        customerId={ctx.orgId}
        data={data}
        date={date}
        initialTimezoneOffsetMinutes={Number.isFinite(timezoneOffsetMinutes) ? timezoneOffsetMinutes : undefined}
      />
    </>
  );
}
