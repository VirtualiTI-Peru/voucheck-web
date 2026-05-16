import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!user.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
    }

    const universalAuthApiBaseUrl = process.env.UNIVERSALAUTH_API_BASE_URL;
    if (!universalAuthApiBaseUrl) {
      return NextResponse.json({ error: 'Missing UNIVERSALAUTH_API_BASE_URL configuration' }, { status: 500 });
    }

    const response = await fetch(`${universalAuthApiBaseUrl.replace(/\/$/, '')}/api/auth/password-reset/request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirectBaseUrl: req.nextUrl.origin,
        applicationName: 'VouChek',
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data?.message || data?.error || 'Failed to request password reset' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
