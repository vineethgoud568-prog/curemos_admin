type EmailTemplateProps = {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
};

export const buildEmailTemplate = ({
  title,
  description,
  buttonText,
  buttonLink,
}: EmailTemplateProps) => {
  return `
  <div style="background:#f1f5f9; padding:50px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

    <div style="
      max-width:600px;
      margin:auto;
      background:white;
      border-radius:12px;
      padding:40px;
      box-shadow:0 10px 25px rgba(0,0,0,0.03);
    ">

      <!-- Logo -->
      <div style="margin-bottom: 32px;">
        <img 
          src="https://hbdinpejzjweklkbyydz.supabase.co/storage/v1/object/public/email/curemos_logo.png" 
          alt="Curemos" 
          style="height: 32px; width: auto;"
        >
      </div>

      <!-- Badge -->
      <p style="
        display:inline-block;
        background:#eff6ff;
        color:#1e40af;
        padding:6px 14px;
        border-radius:8px;
        font-size:12px;
        font-weight:700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 24px;
      ">
        Notification
      </p>

      <!-- Title -->
      <h1 style="
        font-size:28px;
        margin:0 0 16px 0;
        color:#0f172a;
        font-weight:700;
      ">
        ${title}
      </h1>

      <!-- Description -->
      <div style="
        font-size:16px;
        line-height:1.6;
        color:#475569;
        margin-bottom:24px;
      ">
        ${description}
      </div>

      ${
  buttonText && buttonLink
    ? `
        <div style="margin:32px 0;">
          <a href="${buttonLink}"
            style="
              background:#001f3f;
              color:white;
              padding:16px 32px;
              border-radius:8px;
              text-decoration:none;
              font-weight:600;
              display:inline-block;
              font-size:16px;
            ">
            ${buttonText}
          </a>
        </div>
      `
    : ''
}

      <!-- Footer Note -->
      <div style="border-top:1px solid #e2e8f0; margin-top:32px; padding-top:24px;">
        <p style="font-size:13px; color:#94a3b8; text-align:center; margin:0;">
          © ${new Date().getFullYear()} Curemos. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `;
};
