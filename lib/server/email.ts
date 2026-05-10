import { Resend } from 'resend';

import { getServerEnv } from './env';

type LeadConfirmationArgs = {
  to: string;
  companyName?: string;
};

export async function sendLeadConfirmationEmail({
  to,
  companyName,
}: LeadConfirmationArgs): Promise<void> {
  const env = getServerEnv();
  const resend = new Resend(env.RESEND_API_KEY);

  const greetingName = companyName?.trim() ? companyName.trim() : 'there';

  const { error } = await resend.emails.send({
    from: env.LEADS_FROM_EMAIL,
    to,
    subject: 'Your AI spend audit early-access request is confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Thanks for your interest, ${greetingName}.</h2>
        <p>We have received your early-access request for Credex AI Spend Audit.</p>
        <p>We will share next steps and product updates soon.</p>
        <p style="margin-top: 20px;">- Credex Team</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
