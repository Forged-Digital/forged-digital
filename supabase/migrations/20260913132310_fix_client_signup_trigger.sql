drop trigger if exists on_profile_created_seed_portal on public.profiles;
drop function if exists public.seed_client_portal_account();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_token uuid;
  invite_row public.client_invitations%rowtype;
  client_uuid uuid;
  project_uuid uuid;
  is_admin_email boolean := lower(coalesce(new.email, '')) = 'aaron.forgeddigital@gmail.com';
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    case when is_admin_email then 'admin' else 'client' end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    role = case when is_admin_email then 'admin' else public.profiles.role end;

  if is_admin_email then
    return new;
  end if;

  begin
    invite_token := nullif(new.raw_user_meta_data->>'invite_token', '')::uuid;
  exception when others then
    invite_token := null;
  end;

  if invite_token is not null then
    select * into invite_row
    from public.client_invitations
    where token = invite_token
      and status = 'pending'
      and expires_at > now()
      and lower(email) = lower(new.email)
    for update;
  end if;

  insert into public.client_accounts (user_id, company_name, contact_name, email)
  values (
    new.id,
    coalesce(invite_row.company_name, new.raw_user_meta_data->>'company_name'),
    coalesce(invite_row.contact_name, new.raw_user_meta_data->>'full_name'),
    new.email
  )
  returning id into client_uuid;

  insert into public.business_info (client_id, public_name)
  values (client_uuid, coalesce(invite_row.company_name, new.raw_user_meta_data->>'company_name'));

  insert into public.website_info (client_id) values (client_uuid);

  insert into public.projects (client_id, name, status, progress)
  values (client_uuid, 'Website Build', 'Discovery', 0)
  returning id into project_uuid;

  insert into public.project_milestones (project_id, position, title, description, status) values
    (project_uuid, 1, 'Discovery & Planning', 'Goals, sitemap, functionality, audience and requirements', 'active'),
    (project_uuid, 2, 'Visual Direction', 'Brand direction, page structure and interface system', 'pending'),
    (project_uuid, 3, 'Development', 'Frontend build, responsive behavior and core functionality', 'pending'),
    (project_uuid, 4, 'Content & Integrations', 'Final content, forms, automations and third-party connections', 'pending'),
    (project_uuid, 5, 'QA & Launch', 'Testing, final review, DNS and production launch', 'pending');

  if invite_row.id is not null then
    update public.client_invitations
    set status = 'accepted', accepted_by = new.id, accepted_at = now()
    where id = invite_row.id;
  end if;

  return new;
end;
$$;
