import { NextResponse } from 'next/server';

import { TDoctorPayload } from '@/api/hooks/doctor/schema';
import { createDoctorWithAuth } from '@/lib/doctor-management';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TDoctorPayload;
    const { doctor, tempPassword } = await createDoctorWithAuth(payload);

    return NextResponse.json({ doctor, tempPassword }, { status: 201 });
  } catch (error: any) {
    const message = error?.message || 'Failed to create doctor';

    let status = 500;
    if (message.toLowerCase().includes('unauthorized')) status = 401;
    else if (message.toLowerCase().includes('forbidden')) status = 403;
    else if (
      message.toLowerCase().includes('already exists') ||
      message.toLowerCase().includes('already registered')
    )
      status = 400;

    return NextResponse.json({ message }, { status });
  }
}
