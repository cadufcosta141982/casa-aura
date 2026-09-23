// Only runs on published production deploys. No messages are sent in demo mode.
export default async () => {
  if (process.env.LIVE_CHECKOUT_ENABLED !== 'true') return;
  const secret = process.env.CRON_SECRET;
  const origin = process.env.URL;
  if (!secret || !origin) throw new Error('Email schedule is not configured');
  const response = await fetch(new URL('/.netlify/functions/email-worker', origin), {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Email worker dispatch failed');
};
export const config = { schedule: '0 12 * * *' };
