import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const startTime = Date.now();
    
    const { error: dbError } = await supabase
      .from('user_roles')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: dbError ? 'down' : latency > 1000 ? 'degraded' : 'healthy',
      latency,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch system latency';
    return NextResponse.json(
      {
        status: 'down',
        latency: -1,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
