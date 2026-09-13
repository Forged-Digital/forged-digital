import { supabase } from "@/lib/supabase";

export async function dispatchMessagePush(messageId: string) {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) return;

  const response = await fetch("/api/push/notify", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messageId }),
  });

  if (!response.ok) {
    console.error("Push notification dispatch failed", await response.text());
  }
}
