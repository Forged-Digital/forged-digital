create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "Users can read their push subscriptions"
on public.push_subscriptions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their push subscriptions"
on public.push_subscriptions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their push subscriptions"
on public.push_subscriptions for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their push subscriptions"
on public.push_subscriptions for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.push_subscriptions from anon;
grant select, insert, update, delete on public.push_subscriptions to authenticated;

create or replace function public.save_push_subscription(
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

revoke all on function public.save_push_subscription(text, text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text, text) to authenticated;

alter table public.messages
add column if not exists push_dispatched_at timestamptz;

create or replace function private.claim_message_push_recipients(
  target_message uuid,
  dispatch_secret text
)
returns table (
  subscription_id uuid,
  endpoint text,
  p256dh text,
  auth text,
  title text,
  body text,
  href text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_message public.messages%rowtype;
  sender_role text;
  recipient_user uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if encode(extensions.digest(coalesce(dispatch_secret, ''), 'sha256'), 'hex')
    <> '5ab56221fe6ecbb2ba076e22b4c7014a1f1defddd20d504de88f41604dcd1a89' then
    raise exception 'Invalid dispatch secret';
  end if;

  update public.messages
  set push_dispatched_at = now()
  where id = target_message
    and sender_id = auth.uid()
    and push_dispatched_at is null
  returning * into claimed_message;

  if claimed_message.id is null then
    return;
  end if;

  select role into sender_role
  from public.profiles
  where id = claimed_message.sender_id;

  if sender_role = 'admin' then
    select user_id into recipient_user
    from public.client_accounts
    where id = claimed_message.client_id;

    return query
      select ps.id, ps.endpoint, ps.p256dh, ps.auth,
        'New private message'::text,
        'Forged Digital sent you a new private message.'::text,
        '/portal'::text
      from public.push_subscriptions ps
      where ps.user_id = recipient_user;
  else
    return query
      select ps.id, ps.endpoint, ps.p256dh, ps.auth,
        'New client message'::text,
        'A client sent a new private message.'::text,
        '/admin'::text
      from public.push_subscriptions ps
      join public.profiles p on p.id = ps.user_id
      where p.role = 'admin';
  end if;
end;
$$;

create or replace function public.claim_message_push_recipients(
  target_message uuid,
  dispatch_secret text
)
returns table (
  subscription_id uuid,
  endpoint text,
  p256dh text,
  auth text,
  title text,
  body text,
  href text
)
language sql
security definer
set search_path = ''
as $$
  select * from private.claim_message_push_recipients(target_message, dispatch_secret);
$$;

create or replace function private.remove_expired_push_subscription(
  target_subscription uuid,
  dispatch_secret text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if encode(extensions.digest(coalesce(dispatch_secret, ''), 'sha256'), 'hex')
    <> '5ab56221fe6ecbb2ba076e22b4c7014a1f1defddd20d504de88f41604dcd1a89' then
    raise exception 'Invalid dispatch secret';
  end if;

  delete from public.push_subscriptions where id = target_subscription;
end;
$$;

create or replace function public.remove_expired_push_subscription(
  target_subscription uuid,
  dispatch_secret text
)
returns void
language sql
security definer
set search_path = ''
as $$
  select private.remove_expired_push_subscription(target_subscription, dispatch_secret);
$$;

revoke all on function private.claim_message_push_recipients(uuid, text) from public;
revoke all on function private.remove_expired_push_subscription(uuid, text) from public;
revoke all on function public.claim_message_push_recipients(uuid, text) from public, anon;
revoke all on function public.remove_expired_push_subscription(uuid, text) from public, anon;
grant execute on function public.claim_message_push_recipients(uuid, text) to authenticated;
grant execute on function public.remove_expired_push_subscription(uuid, text) to authenticated;
