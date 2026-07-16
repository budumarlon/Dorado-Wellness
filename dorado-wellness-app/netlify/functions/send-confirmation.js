function jsonResponse(statusCode, payload) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

async function parsePayload(requestOrEvent) {
  try {
    // If it's a Request object (new Netlify format)
    if (requestOrEvent instanceof Request) {
      const text = await requestOrEvent.text();
      return text ? JSON.parse(text) : {};
    }

    // If it's an event object (old format)
    if (requestOrEvent?.body) {
      const bodyStr = typeof requestOrEvent.body === "string" 
        ? requestOrEvent.body 
        : JSON.stringify(requestOrEvent.body);
      return JSON.parse(bodyStr);
    }

    return {};
  } catch (e) {
    console.error("Parse error:", e.message);
    return {};
  }
}

export async function handler(event, context) {
  // Determine if we're in the new Netlify format (event is a Request)
  const isNewFormat = event instanceof Request;
  const request = isNewFormat ? event : null;
  const method = isNewFormat 
    ? request.method 
    : (event?.httpMethod || "GET");

  if (method !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" });
  }

  try {
    const payload = await parsePayload(isNewFormat ? request : event);
    const { phone, name, service, dateLabel, time } = payload;


    if (!phone || !name || !service || !dateLabel || !time) {
      return jsonResponse(400, { ok: false, error: "Missing booking details" });
    }

    const smsApiKey = process.env.SMS_API_KEY || process.env.TWILIO_ACCOUNT_SID;
    const senderId = process.env.SMS_SENDER_ID || process.env.TWILIO_FROM_NUMBER;

    if (!smsApiKey) {
      return jsonResponse(200, { ok: false, skipped: true, reason: "SMS credentials not configured" });
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

    return jsonResponse(response.ok ? 200 : 500, { ok: response.ok, details: text });
  } catch (error) {
    return jsonResponse(500, { ok: false, error: error.message });
  }
}

export default handler;
