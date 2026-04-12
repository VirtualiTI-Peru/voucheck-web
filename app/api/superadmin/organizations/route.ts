
export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';

// API: GET /api/superadmin/organizations
// Returns customer/organization list from the backend.
export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.API_BASE_URL;
    if (!backendUrl) throw new Error('Missing API_BASE_URL');

    const customersRes = await fetch(`${backendUrl}/api/customers`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!customersRes.ok) {
      const errText = await customersRes.text();
      throw new Error('Fetching customers failed: ' + errText);
    }
    const customers = await customersRes.json();
    return NextResponse.json(customers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
