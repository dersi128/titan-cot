/**
 * Notify admin when someone joins the waitlist.
 * Set WAITLIST_NOTIFY_WEBHOOK_URL on Vercel (Discord webhook URL works).
 */
export const config = { runtime: "edge" };

type Body = { email?: string };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhook = process.env.WAITLIST_NOTIFY_WEBHOOK_URL?.trim();
  if (!webhook) {
    return Response.json({ ok: true, skipped: true });
  }

  let email = "";
  try {
    const body = (await req.json()) as Body;
    email = String(body.email ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 200);
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const text = `TITAN COT waitlist: ${email} čeká na schválení.`;

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        username: "TITAN Waitlist",
      }),
    });
    if (!res.ok) {
      return Response.json({ ok: false, status: res.status }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "webhook_failed" }, { status: 502 });
  }
}
