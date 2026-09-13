import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";

export const runtime = "nodejs";

type Recipient = {
  subscription_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
  href: string;
};

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  const dispatchSecret = process.env.PUSH_DISPATCH_SECRET;
  if (!supabaseUrl || !supabaseKey || !publicKey || !privateKey || !subject || !dispatchSecret) {
    return Response.json({ error: "Push notifications are not configured." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!accessToken) return Response.json({ error: "Authentication required." }, { status: 401 });

  let messageId: string | undefined;
  try {
    messageId = (await request.json()).messageId;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!messageId) return Response.json({ error: "Message ID is required." }, { status: 400 });

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error: authError } = await supabase.auth.getUser(accessToken);
  if (authError) return Response.json({ error: "Invalid session." }, { status: 401 });

  const { data, error } = await supabase.rpc("claim_message_push_recipients", {
    target_message: messageId,
    dispatch_secret: dispatchSecret,
  });
  if (error) return Response.json({ error: "Unable to dispatch notification." }, { status: 403 });

  webPush.setVapidDetails(subject, publicKey, privateKey);
  let sent = 0;
  const recipients = (data || []) as Recipient[];
  await Promise.all(recipients.map(async recipient => {
    try {
      await webPush.sendNotification(
        { endpoint: recipient.endpoint, keys: { p256dh: recipient.p256dh, auth: recipient.auth } },
        JSON.stringify({ title: recipient.title, body: recipient.body, href: recipient.href }),
        { TTL: 60 * 60 }
      );
      sent += 1;
    } catch (pushError) {
      const statusCode = typeof pushError === "object" && pushError && "statusCode" in pushError
        ? Number(pushError.statusCode)
        : 0;
      if (statusCode === 404 || statusCode === 410) {
        await supabase.rpc("remove_expired_push_subscription", {
          target_subscription: recipient.subscription_id,
          dispatch_secret: dispatchSecret,
        });
      }
    }
  }));

  return Response.json({ sent });
}
