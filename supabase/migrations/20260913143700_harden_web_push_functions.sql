create index if not exists push_subscriptions_user_id_idx
on public.push_subscriptions (user_id);

create or replace function private.save_push_subscription(
  subscription_endpoint text,
  subscription_p256dh text,
  subscription_auth text,
  subscription_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values (auth.uid(), subscription_endpoint, subscription_p256dh, subscription_auth, subscription_user_agent)
  on conflict (endpoint) do update
  set user_id = auth.uid(),
      p256dh = excluded.p256dh,
      auth = excluded.auth,
      user_agent = excluded.user_agent,
      updated_at = now()
  returning id into saved_id;

  return saved_id;
end;
$$;

create or replace function public.save_push_subscription(
  subscription_endpoint text,
  subscription_p256dh text,
  subscription_auth text,
  subscription_user_agent text default null
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.save_push_subscription(
    subscription_endpoint,
    subscription_p256dh,
    subscription_auth,
    subscription_user_agent
  );
$$;

alter function public.claim_message_push_recipients(uuid, text) security invoker;
alter function public.remove_expired_push_subscription(uuid, text) security invoker;

revoke all on function private.save_push_subscription(text, text, text, text) from public;
revoke all on function private.claim_message_push_recipients(uuid, text) from public;
revoke all on function private.remove_expired_push_subscription(uuid, text) from public;
grant execute on function private.save_push_subscription(text, text, text, text) to authenticated;
grant execute on function private.claim_message_push_recipients(uuid, text) to authenticated;
grant execute on function private.remove_expired_push_subscription(uuid, text) to authenticated;
