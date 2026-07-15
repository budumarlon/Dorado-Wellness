export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const { phone, name, service, dateLabel, time } = payload;

    if (!phone || !name || !service || !dateLabel || !time) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing booking details" }),
      };
    }

    const smsApiKey = process.env.SMS_API_KEY || process.env.TWILIO_ACCOUNT_SID;
    const senderId = process.env.SMS_SENDER_ID || process.env.TWILIO_FROM_NUMBER;

    if (!smsApiKey) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, skipped: true, reason: "SMS credentials not configured" }),
      };
    }

    const normalizedPhone = String(phone).replace(/[^\d+]/g, "").replace(/^00/, "+");
    const message = `Hi ${name}, your appointment request for ${service} on ${dateLabel} at ${time} has been received by Dorado Wellness. We will confirm shortly.`;

    const response = await fetch("https://api.smsonlinegh.com/v5/message/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        api_key: smsApiKey,
        recipient: normalizedPhone,
        message,
        sender_id: senderId,
      }),
    });

    const text = await response.text();

    return {
      statusCode: response.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: response.ok, details: text }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: error.message }),
    };
  }
}

export default handler;
