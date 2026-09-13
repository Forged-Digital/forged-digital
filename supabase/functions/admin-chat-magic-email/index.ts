import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const jsonHeaders = { "Content-Type": "application/json" };

Deno.serve(async request => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: jsonHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: jsonHeaders });
  }

  let notificationId = "";
  try {
    notificationId = String((await request.json()).notificationId || "");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: jsonHeaders });
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(notificationId)) {
    return new Response(JSON.stringify({ error: "Invalid notification" }), { status: 400, headers: jsonHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: notification, error: notificationError } = await supabase
    .from("notifications")
    .select("id,user_id,kind,href,email_magic_link_sent_at")
    .eq("id", notificationId)
    .maybeSingle();

  if (notificationError || !notification || notification.kind !== "message" || notification.href !== "/admin") {
    return new Response(JSON.stringify({ error: "Notification not found" }), { status: 404, headers: jsonHeaders });
  }
  const { data: profile } = await supabase.from("profiles").select("email,role").eq("id", notification.user_id).maybeSingle();
  if (profile?.role !== "admin" || !profile.email) {
    return new Response(JSON.stringify({ error: "Notification not found" }), { status: 404, headers: jsonHeaders });
  }
  if (notification.email_magic_link_sent_at) {
    return new Response(JSON.stringify({ sent: false, reason: "already_sent" }), { status: 200, headers: jsonHeaders });
  }

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: profile.email,
    options: { redirectTo: "https://forged-digital.com/admin" },
  });
  if (linkError || !linkData.properties?.action_link) {
    return new Response(JSON.stringify({ error: "Unable to create sign-in link" }), { status: 500, headers: jsonHeaders });
  }

  const { data: sent, error: sendError } = await supabase.rpc("send_admin_chat_magic_email", {
    target_notification: notificationId,
    action_link: linkData.properties.action_link,
  });
  if (sendError) {
    return new Response(JSON.stringify({ error: "Unable to send email" }), { status: 500, headers: jsonHeaders });
  }

  return new Response(JSON.stringify({ sent: Boolean(sent) }), { status: 200, headers: jsonHeaders });
});
