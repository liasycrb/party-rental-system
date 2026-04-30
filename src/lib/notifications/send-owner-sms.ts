"use server";

export async function sendOwnerSms(message: string): Promise<void> {
  const apiKey = process.env.TELNYX_API_KEY;
  const from = process.env.TELNYX_FROM_NUMBER;
  const to = process.env.OWNER_PHONE;

  if (!apiKey || !from || !to) {
    console.warn("[sendOwnerSms] Missing env: TELNYX_API_KEY, TELNYX_FROM_NUMBER, or OWNER_PHONE — skipping SMS.");
    return;
  }

  try {
    const res = await fetch("https://api.telnyx.com/v2/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, text: message }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[sendOwnerSms] Telnyx error ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error("[sendOwnerSms] fetch failed:", err);
  }
}
