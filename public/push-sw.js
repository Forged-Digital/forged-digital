self.addEventListener("push", event => {
  let payload = { title: "Forged Digital", body: "You have a new portal notification.", href: "/portal" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {}

  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: "/assets/forged-logo-mark.webp",
    badge: "/assets/forged-logo-mark.webp",
    data: { href: payload.href },
    tag: "forged-private-chat",
    renotify: true,
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.href || "/portal", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(windows => {
    const existing = windows.find(windowClient => windowClient.url === target);
    return existing ? existing.focus() : clients.openWindow(target);
  }));
});
