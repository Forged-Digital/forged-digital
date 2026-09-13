create or replace function public.fd_notify_private_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  sender_role text;
  client_user uuid;
  admin_row record;
begin
  select role into sender_role from public.profiles where id = new.sender_id;
  select user_id into client_user from public.client_accounts where id = new.client_id;

  if sender_role = 'admin' then
    if client_user is not null then
      insert into public.notifications (user_id, client_id, kind, title, body, href)
      values (client_user, new.client_id, 'message', 'New private message', 'Forged Digital sent you a new private message.', '/portal');
    end if;
  else
    for admin_row in select id from public.profiles where role = 'admin' loop
      insert into public.notifications (user_id, client_id, kind, title, body, href)
      values (admin_row.id, new.client_id, 'message', 'New client message', 'A client sent a new private message.', '/admin');
    end loop;
  end if;

  return new;
end;
$$;
