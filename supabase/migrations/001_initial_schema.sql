create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'sales');
create type public.lead_status as enum ('New', 'Contacted', 'Qualified', 'Lost');
create type public.lead_source as enum ('Website', 'Instagram', 'Referral');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 60),
  email text not null unique,
  role public.user_role not null default 'sales',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null,
  status public.lead_status not null default 'New',
  source public.lead_source not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_filter_idx on public.leads (status, source, created_at desc);
create index leads_search_idx on public.leads using gin (to_tsvector('english', name || ' ' || email));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'sales')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table public.profiles enable row level security;
alter table public.leads enable row level security;

create policy "profiles are readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "users update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "authenticated users read leads"
on public.leads for select
to authenticated
using (true);

create policy "authenticated users create leads"
on public.leads for insert
to authenticated
with check (created_by = auth.uid());

create policy "admins update all leads, sales update their own"
on public.leads for update
to authenticated
using (public.current_user_role() = 'admin' or created_by = auth.uid())
with check (public.current_user_role() = 'admin' or created_by = auth.uid());

create policy "admins delete leads"
on public.leads for delete
to authenticated
using (public.current_user_role() = 'admin');
