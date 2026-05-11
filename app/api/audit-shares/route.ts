import { NextRequest, NextResponse } from 'next/server';

import { AuditInputSchema } from '@/lib/schemas';
import { createAuditShare } from '@/lib/server/audit-shares';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = AuditInputSchema.safeParse(payload?.auditInput);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const share = await createAuditShare(parsed.data);

    return NextResponse.json(
      {
        shareId: share.shareId,
        shareUrl: share.shareUrl,
        publicPayload: share.publicPayload,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[POST /api/audit-shares] Failed:', message);

    return NextResponse.json(
      {
        error: 'Unable to create a share link right now.',
      },
      { status: 500 }
    );
  }
}
