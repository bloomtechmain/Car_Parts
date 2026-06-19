const FITSMS_API_URL = 'https://app.fitsms.lk/api/v4/sms/send';
const FITSMS_API_KEY = process.env.FITSMS_API_KEY || '';
const SENDER_ID = 'BloomTech';

async function sendSMS(phone: string, message: string): Promise<void> {
  if (!FITSMS_API_KEY) {
    console.warn('[sms] FITSMS_API_KEY not set — skipping SMS');
    return;
  }

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
      console.log(`[sms] SMS sent to ${phone}`);
    }
  } catch (err) {
    console.error('[sms] Failed to send SMS:', err);
  }
}

export async function sendOrderConfirmationSMS(
  phone: string,
  data: {
    partName: string;
    ticketNumber: string;
    adminPrice: number;
    deliveryDays: number;
    optionNumber: number;
  }
): Promise<void> {
  const priceText = `Rs.${Number(data.adminPrice).toLocaleString('si-LK')}`;
  const message =
    `CarParts Finder: Great choice! Option ${data.optionNumber} for your ${data.partName} ` +
    `(${data.ticketNumber}) is reserved. Amount due: ${priceText}. ` +
    `Please complete your payment to finalise your order. Delivery: ${data.deliveryDays} day${data.deliveryDays !== 1 ? 's' : ''} after payment.`;

  await sendSMS(phone, message);
}
