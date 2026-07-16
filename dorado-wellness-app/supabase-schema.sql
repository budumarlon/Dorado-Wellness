-- Run this once in your Supabase project's SQL Editor (Project > SQL Editor > New query).
-- It creates the two tables the site needs and locks them down properly:
-- anyone can submit a booking or message (INSERT), but only a logged-in
-- staff account can read or update them (SELECT/UPDATE).

create extension if not exists "pgcrypto";

-- BOOKINGS ---------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  service text not null,
  date_key text not null,
  date_label text not null,
  time text not null,
  name text not null,
  email text not null,
  phone text not null,
  notes text,
  status text not null default 'Pending'
);

alter table public.bookings enable row level security;

drop policy if exists "Public can submit a booking" on public.bookings;
drop policy if exists "Staff can view bookings" on public.bookings;
drop policy if exists "Staff can update bookings" on public.bookings;

create policy "Public can submit a booking"
  on public.bookings for insert
  to anon
  with check (true);

drop policy if exists "Public can submit a booking (authenticated)" on public.bookings;

create policy "Public can submit a booking (authenticated)"
  on public.bookings for insert
  to authenticated
  with check (true);

create policy "Staff can view bookings"
  on public.bookings for select
  to authenticated
  using (true);

create policy "Staff can update bookings"
  on public.bookings for update
  to authenticated
  using (true);

-- CONTACT MESSAGES --------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  subject text,
  message text not null
);

alter table public.contact_messages enable row level security;

drop policy if exists "Public can send a message" on public.contact_messages;
drop policy if exists "Staff can view messages" on public.contact_messages;

create policy "Public can send a message"
  on public.contact_messages for insert
  to anon
  with check (true);

create policy "Staff can view messages"
  on public.contact_messages for select
  to authenticated
  using (true);
