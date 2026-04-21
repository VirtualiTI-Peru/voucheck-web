import type { Receipt } from './api-types';

// Fetch all receipts for a customer using the public API route (client/browser safe)
export async function fetchReceipts(customerId: string, options: { forceRefresh?: boolean } = {}): Promise<Receipt[]> {
  let allReceipts: Receipt[] = [];
  let page = 1;
  const pageSize = 200;
  let hasMore = true;
  while (hasMore) {
    const params = new URLSearchParams({
      customerId,
      page: String(page),
      pageSize: String(pageSize),
    });
    if (options.forceRefresh) params.set('refresh', '1');
    const res = await fetch(`/api/receipts?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch receipts');
    const data = await res.json();
    if (Array.isArray(data.receipts)) {
      allReceipts = allReceipts.concat(data.receipts);
      hasMore = !!data.hasMore;
      page++;
    } else {
      hasMore = false;
    }
  }
  return allReceipts;
}