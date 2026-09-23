import { equal } from '../../lib/security';
import { sendDueEmails } from '../../lib/emails';

export default async (request: Request) => {
  const secret = process.env.CRON_SECRET;
  if (request.method !== 'POST' || !secret ||
      !equal(request.headers.get('authorization') || '', `Bearer ${secret}`)) return;
  if (process.env.LIVE_CHECKOUT_ENABLED !== 'true') return;
  await sendDueEmails();
};
export const config = { background: true };
