import nodemailer from 'nodemailer';

import { buildEmailTemplate } from './templates';

type EmailTemplate = {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
};

type SendTemplatedEmailPayload = {
  email: string;
  template: EmailTemplate;
};

const parseBoolean = (value: string | undefined) => {
  if (!value) return undefined;
  return value.toLowerCase() === 'true';
};

export async function sendTemplatedEmail({ email, template }: SendTemplatedEmailPayload) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD;
  const secure = parseBoolean(process.env.SMTP_SECURE) ?? port === 465;

  if (!host || !user || !pass || Number.isNaN(port)) {
    throw new Error('SMTP email configuration is incomplete');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"Curemos Admin" <${user}>`,
    to: email,
    subject: template.title,
    html: buildEmailTemplate(template),
  });
}
