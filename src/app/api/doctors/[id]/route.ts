import { NextResponse } from 'next/server';

import { TDoctorPayload } from '@/api/hooks/doctor/schema';
import { deleteDoctorWithAuth, updateDoctorWithAuth } from '@/lib/doctor-management';

type TParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: TParams) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as TDoctorPayload;
    const doctor = await updateDoctorWithAuth(id, payload);

    return NextResponse.json(doctor);
  } catch (error: any) {
    const message = error?.message || 'Failed to update doctor';

    let status = 500;
    if (message.toLowerCase().includes('unauthorized')) status = 401;
    else if (message.toLowerCase().includes('forbidden')) status = 403;

    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_: Request, { params }: TParams) {
  try {
    const { id } = await params;
    await deleteDoctorWithAuth(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message = error?.message || 'Failed to delete doctor';

    let status = 500;
    if (message.toLowerCase().includes('unauthorized')) status = 401;
    else if (message.toLowerCase().includes('forbidden')) status = 403;

    return NextResponse.json({ message }, { status });
  }
}
