"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

function applicationServerKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
  return bytes.buffer;
}

export function PushNotificationControl() {
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const canPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(canPush);
    if (!canPush) return;

    navigator.serviceWorker.register("/push-sw.js")
      .then(registration => registration.pushManager.getSubscription())
      .then(subscription => setEnabled(Boolean(subscription)))
      .catch(() => setMessage("Notifications are unavailable in this browser."));
  }, []);

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setMessage("Notifications are not configured yet.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Notification permission was not granted.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/push-sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey(publicKey),
      });
      const json = subscription.toJSON();
      const endpoint = json.endpoint;
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!endpoint || !p256dh || !auth) throw new Error("The browser returned an incomplete subscription.");

      const { error } = await supabase.rpc("save_push_subscription", {
        subscription_endpoint: endpoint,
        subscription_p256dh: p256dh,
        subscription_auth: auth,
        subscription_user_agent: navigator.userAgent,
      });
      if (error) throw error;
      setEnabled(true);
      setMessage("Push notifications enabled on this device.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not enable notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
        if (error) throw error;
        await subscription.unsubscribe();
      }
      setEnabled(false);
      setMessage("Push notifications disabled on this device.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not disable notifications.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return <div className="push-control"><BellOff size={16}/><span>Add this portal to your Home Screen to enable notifications on iPhone.</span><Styles/></div>;
  }

  return <div className="push-control">
    <button type="button" onClick={enabled ? disable : enable} disabled={busy}>
      {enabled ? <BellOff size={16}/> : <Bell size={16}/>} {busy ? "UPDATING..." : enabled ? "DISABLE PUSH ALERTS" : "ENABLE PUSH ALERTS"}
    </button>
    {message && <span>{message}</span>}
    <Styles/>
  </div>;
}

function Styles() {
  return <style jsx>{`.push-control{margin-top:16px;border-top:1px solid #222;padding:16px 4px 0;display:grid;gap:8px}.push-control button{border:1px solid #4a2222;background:#0d0e0e;color:#ddd;min-height:40px;padding:8px 10px;font-size:8px;font-weight:800;letter-spacing:.08em;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer}.push-control button:hover{border-color:#a12727;color:#fff}.push-control button:disabled{opacity:.55;cursor:wait}.push-control>span{font-size:8px;line-height:1.45;color:#888}`}</style>;
}
