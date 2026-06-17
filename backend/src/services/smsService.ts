const FITSMS_API_URL = 'https://app.fitsms.lk/api/v4/sms/send';
const FITSMS_API_KEY = process.env.FITSMS_API_KEY || '';
const SENDER_ID = 'BloomTech';

export async function sendQuoteSMS(
  phone: string,
  data: {
    companyName: string | null;
    partName: string;
    price: number | null;
    ticketNumber: string;
    date: string;
  }
): Promise<void> {
  if (!FITSMS_API_KEY) {
    console.warn('[sms] FITSMS_API_KEY not set — skipping SMS');
    return;
  }

  const priceText = data.price !== null ? `Rs.${Number(data.price).toLocaleString('si-LK')}` : 'Price on request';
  const supplier = data.companyName || 'A supplier';

  const message =
    `CarParts Finder: ${supplier} quoted ${priceText} for your ${data.partName} request ` +
    `(${data.ticketNumber}) on ${data.date}. Our team will be in touch soon.`;

  try {
    const res = await fetch(FITSMS_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FITSMS_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        recipient: phone,
        sender_id: SENDER_ID,
        type: 'plain',
        message,
      }),
    });

    const json = await res.json() as { status: string; message?: string };
    if (json.status !== 'success') {
      console.error('[sms] FitSMS error:', json.message);
    } else {
      console.log(`[sms] Quote SMS sent to ${phone} (${data.ticketNumber})`);
    }
  } catch (err) {
    console.error('[sms] Failed to send SMS:', err);
  }
}
