alter table public.notifications
add column if not exists email_magic_link_sent_at timestamptz;

create or replace function public.send_admin_chat_magic_email(
  target_notification uuid,
  action_link text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
  recipient text;
  notification_title text;
  notification_body text;
  safe_title text;
  safe_body text;
  email_html text;
begin
  if action_link not like 'https://stnfvpldgcsysgfgzctw.supabase.co/auth/v1/verify?%'
    or length(action_link) > 4000 then
    raise exception 'Invalid authentication link';
  end if;

  update public.notifications n
  set email_magic_link_sent_at = now()
  from public.profiles p
  where n.id = target_notification
    and n.user_id = p.id
    and p.role = 'admin'
    and n.kind = 'message'
    and n.href = '/admin'
    and n.email_magic_link_sent_at is null
  returning p.email, n.title, n.body
  into recipient, notification_title, notification_body;

  if recipient is null or btrim(recipient) = '' then
    return false;
  end if;

  select ds.decrypted_secret into api_key
  from vault.decrypted_secrets ds
  where ds.name = 'forged_resend_api_key'
  order by ds.created_at desc
  limit 1;

  if api_key is null or api_key = '' then
    raise exception 'Email provider is not configured';
  end if;

  safe_title := replace(replace(replace(replace(coalesce(notification_title, 'New client message'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;');
  safe_body := replace(replace(replace(replace(coalesce(notification_body, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;');
  email_html := '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#070808;font-family:Arial,Helvetica,sans-serif;color:#f3f3f3"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#070808"><tr><td align="center" style="padding:30px 12px"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0c0c;max-width:620px;border:1px solid #292b2b"><tr><td style="padding:28px"><img src="https://forged-digital.com/assets/forged-logo-wide.webp" width="190" alt="Forged Digital" style="display:block;width:190px;height:auto"></td></tr><tr><td style="padding:8px 28px 32px"><p style="color:#df2b2b;font-size:10px;font-weight:800;letter-spacing:2px">PRIVATE CHAT</p><h1 style="margin:12px 0;color:#fff;font-size:30px">' || safe_title || '</h1><p style="color:#aaa;font-size:14px;line-height:1.6">' || safe_body || '</p><p style="margin-top:28px"><a href="' || action_link || '" style="display:inline-block;background:#a91414;border:1px solid #d52a2a;color:#fff;text-decoration:none;padding:14px 20px;font-size:10px;font-weight:800;letter-spacing:1px">OPEN ADMIN CHAT</a></p><p style="margin-top:20px;color:#666;font-size:10px;line-height:1.5">This secure sign-in link is for the Forged Digital administrator, expires shortly, and can only be used once.</p></td></tr></table></td></tr></table></body></html>';

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || api_key, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', 'Forged Digital <notifications@forged-digital.com>',
      'to', jsonb_build_array(recipient),
      'subject', 'Forged Digital — ' || coalesce(notification_title, 'New client message'),
      'html', email_html,
      'text', coalesce(notification_title, 'New client message') || E'\n\n' || coalesce(notification_body, '') || E'\n\nOpen the admin chat using the secure one-time link in this email.'
    )
  );

  return true;
end;
$$;

revoke all on function public.send_admin_chat_magic_email(uuid, text) from public, anon, authenticated;
grant execute on function public.send_admin_chat_magic_email(uuid, text) to service_role;

create or replace function public.fd_notification_email_dispatch()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
  recipient text;
  recipient_role text;
  safe_title text;
  safe_body text;
  target_url text;
  email_html text;
begin
  select p.email, p.role into recipient, recipient_role
  from public.profiles p
  where p.id = new.user_id;

  if recipient is null or btrim(recipient) = '' then return new; end if;

  if new.kind = 'message' and new.href = '/admin' and recipient_role = 'admin' then
    perform net.http_post(
      url := 'https://stnfvpldgcsysgfgzctw.supabase.co/functions/v1/admin-chat-magic-email',
      headers := jsonb_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bmZ2cGxkZ2NzeXNnZmd6Y3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNTgzMDcsImV4cCI6MjEwNDYzNDMwN30.NFAyHu83x_Kz6CXZwsINmE9j8Q_yLmtWawcZVTJ3OCM',
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('notificationId', new.id)
    );
    return new;
  end if;

  select ds.decrypted_secret into api_key
  from vault.decrypted_secrets ds
  where ds.name = 'forged_resend_api_key'
  order by ds.created_at desc
  limit 1;
  if api_key is null or api_key = '' then return new; end if;

  safe_title := replace(replace(replace(replace(coalesce(new.title, 'Forged Digital Update'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;');
  safe_body := replace(replace(replace(replace(coalesce(new.body, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;');
  target_url := case when coalesce(new.href, '') like '/%' then 'https://forged-digital.com' || new.href else 'https://forged-digital.com/portal' end;
  email_html := '<!doctype html><html><body style="margin:0;background:#070808;color:#f3f3f3;font-family:Arial,sans-serif"><div style="max-width:620px;margin:auto;padding:32px"><img src="https://forged-digital.com/assets/forged-logo-wide.webp" width="190" alt="Forged Digital"><h1>' || safe_title || '</h1><p style="color:#aaa">' || safe_body || '</p><a href="' || target_url || '" style="display:inline-block;background:#a91414;color:#fff;padding:14px 20px;text-decoration:none">OPEN CLIENT PORTAL</a></div></body></html>';

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || api_key, 'Content-Type', 'application/json'),
    body := jsonb_build_object('from', 'Forged Digital <notifications@forged-digital.com>', 'to', jsonb_build_array(recipient), 'subject', 'Forged Digital — ' || coalesce(new.title, 'Update'), 'html', email_html, 'text', coalesce(new.title, 'Update') || E'\n\n' || coalesce(new.body, '') || E'\n\n' || target_url)
  );
  return new;
exception when others then
  return new;
end;
$$;
