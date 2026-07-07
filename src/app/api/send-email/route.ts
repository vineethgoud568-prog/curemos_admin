import { sendTemplatedEmail } from '@/lib/email/send-email';

export async function POST(req: Request) {
  try {
    const { email, template } = await req.json();

    await sendTemplatedEmail({ email, template });

    return Response.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
