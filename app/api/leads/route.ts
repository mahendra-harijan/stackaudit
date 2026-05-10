import { NextRequest, NextResponse } from 'next/server';

import { LeadCaptureSchema } from '@/lib/schemas';
import { sendLeadConfirmationEmail } from '@/lib/server/email';
import { rateLimitByIp } from '@/lib/server/rate-limit';
import { upsertLead } from '@/lib/server/supabase';

const LEAD_SOURCE = 'landing_hero';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimit = rateLimitByIp(request.headers, 'api_leads_post');

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = LeadCaptureSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { email, companyName, role, teamSize, website } = parsed.data;

  // Honeypot behavior: return success without processing to reduce bot feedback loops.
  if (typeof website === 'string' && website.trim().length > 0) {
    return NextResponse.json({ success: true });
  }

  try {
    await upsertLead({
      email: email.toLowerCase(),
      company_name: companyName?.trim() ? companyName.trim() : null,
      role: role?.trim() ? role.trim() : null,
      team_size: typeof teamSize === 'number' ? teamSize : null,
      source: LEAD_SOURCE,
    });

    await sendLeadConfirmationEmail({
      to: email,
      companyName: companyName || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[POST /api/leads] Failed:', message);

    return NextResponse.json(
      {
        error: 'Unable to process your request at this time.',
      },
      { status: 500 }
    );
  }
}
