import { NextResponse } from 'next/server';

import { updateReferralStatus } from '@/lib/referral-management';

type TParams = {
  params: Promise<{
    id: string;
  }>;
};


const UI_TO_DB_STATUS: Record<string, string> = {
  referralSent: 'referralSent',
};

export async function PATCH(request: Request, { params }: TParams) {
  try {
    const { id } = await params;
    const { status, adminId, details } = await request.json();

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    const dbStatus = UI_TO_DB_STATUS[status] ?? status;
    const referral = await updateReferralStatus(id, dbStatus, adminId, details);

    return NextResponse.json(referral);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update referral';

    let statusCode = 500;
    if (message.toLowerCase().includes('unauthorized')) statusCode = 401;
    else if (message.toLowerCase().includes('forbidden')) statusCode = 403;

    return NextResponse.json({ message }, { status: statusCode });
  }
}
