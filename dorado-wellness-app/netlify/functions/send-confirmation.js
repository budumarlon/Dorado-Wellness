function jsonResponse(statusCode, payload) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

async function getPayload(event) {
  if (event?.body && typeof event.body === "object" && !ArrayBuffer.isView(event.body) && !(event.body instanceof ArrayBuffer)) {
    return event.body;
  }

  if (typeof event?.json === "function") {
    return event.json();
  }

  if (event?.request && typeof event.request.json === "function") {
    return event.request.json();
  }

  if (typeof event?.body === "string") {
    return event.body;
  }

  if (event?.body instanceof Uint8Array) {
    return Buffer.from(event.body).toString("utf8");
  }

  if (typeof event?.rawBody === "string") {
    return event.rawBody;
  }

  if (typeof event?.text === "function") {
    return event.text();
  }

  return {};
}

function normalizePayload(payloadValue) {
  if (payloadValue === null || payloadValue === undefined) {
    return {};
  }

  if (typeof payloadValue === "string") {
    try {
      return JSON.parse(payloadValue.trim());
    } catch {
      return {};
    }
  }

  if (typeof payloadValue === "object") {
    if (payloadValue.body && typeof payloadValue.body === "object") {
      return payloadValue.body;
    }
    if (payloadValue.payload && typeof payloadValue.payload === "object") {
      return payloadValue.payload;
    }
    if (payloadValue.data && typeof payloadValue.data === "object") {
      return payloadValue.data;
    }
    if (payloadValue.fields && typeof payloadValue.fields === "object") {
      return payloadValue.fields;
    }
    return payloadValue;
  }

  return {};
}

export async function handler(event) {
  const method = event?.httpMethod || event?.method || "";

  if (method !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" });
  }

  try {
    const payloadValue = await getPayload(event);
    const payload = normalizePayload(payloadValue);
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
