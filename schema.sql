create extension if not exists pgcrypto;

create type role_type as enum ('ADMIN','MANAGER','AGENT');
create type lead_stage as enum ('PIPELINE','APPOINTMENT','PREZENTARE','CONTRACT','ONBOARDING');
create type lead_status as enum ('ACTIV','PIERDUT','AMANAT');
create type activity_type as enum ('CALL','MEETING','EMAIL','WHATSAPP','PREZENTARE','NOTE','OTHER');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role role_type not null default 'AGENT',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.stage_probabilities (
  stage lead_stage primary key,
  probability numeric not null check (probability >= 0 and probability <= 1)
);

insert into public.stage_probabilities(stage, probability) values
('PIPELINE',0.10),('APPOINTMENT',0.25),('PREZENTARE',0.50),('CONTRACT',0.80),('ONBOARDING',1.00)
on conflict (stage) do nothing;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  nume_prenume text not null,
  telefon text not null,
  email text,
  organizatie text not null,
  localitate text not null,
  ranking integer not null default 50 check (ranking >= 1 and ranking <= 100),
  potential_eur numeric not null default 0,
  etapa lead_stage not null default 'PIPELINE',
  status lead_status not null default 'ACTIV',
  motiv_pierdere text,
  owner_id uuid not null references public.profiles(id),
  next_action_at timestamptz,
  next_action_type activity_type not null default 'OTHER',
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  tip activity_type not null,
  occurred_at timestamptz not null default now(),
  rezultat text,
  next_step text,
  next_action_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.stage_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  from_stage lead_stage,
  to_stage lead_stage not null,
  changed_by uuid not null references public.profiles(id),
  changed_at timestamptz not null default now()
);