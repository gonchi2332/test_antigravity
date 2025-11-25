-- Drop existing tables if they exist to ensure clean state (Optional, be careful in production)
-- drop table if exists public.citas;
-- drop table if exists public.employees;

-- 1. Create Employees Table
create table if not exists public.employees (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text not null unique,
  specialty text,
  created_at timestamp with time zone default now()
);

-- Enable RLS for Employees
alter table public.employees enable row level security;

-- Policies for Employees
create policy "Employees are viewable by everyone"
  on public.employees for select
  using ( true );

-- Seed Data for Employees
insert into public.employees (full_name, email, specialty)
values 
  ('Dr. Sarah Smith', 'sarah@example.com', 'General Consultation'),
  ('Eng. John Doe', 'john@example.com', 'Technical Support'),
  ('Alice Johnson', 'alice@example.com', 'Sales Representative')
on conflict (email) do nothing;


-- 2. Update Citas Table
-- If table exists, we add columns. If not, we create it.
create table if not exists public.citas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  empresa text,
  tipo_consulta text,
  descripcion text,
  fecha_consulta timestamptz not null,
  modalidad text,
  direccion text,
  created_at timestamp with time zone default now()
);

-- Add new columns if they don't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'citas' and column_name = 'employee_id') then
        alter table public.citas add column employee_id uuid references public.employees(id);
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'citas' and column_name = 'status') then
        alter table public.citas add column status text default 'pending' check (status in ('pending', 'approved', 'rejected'));
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'citas' and column_name = 'end_time') then
        alter table public.citas add column end_time timestamptz;
    end if;
end $$;

-- Enable RLS (if not already)
alter table public.citas enable row level security;

-- Drop existing policies to recreate them correctly
drop policy if exists "Users can view their own appointments" on public.citas;
drop policy if exists "Users can insert their own appointments" on public.citas;
drop policy if exists "Users can update their own appointments" on public.citas;
drop policy if exists "Users can delete their own appointments" on public.citas;

-- Policies

-- SELECT: Users see their own. Employees (identified by email matching auth.email) see ALL.
-- Note: In a real app, we'd link auth.users to employees table. Here we'll use a simple email check or just allow public read for simplicity if needed, but let's try to be secure.
-- We will assume the Edge Function handles the "Employee View" logic securely, but for RLS:
-- Let's allow users to see their own.
create policy "Users can view their own appointments"
  on public.citas for select
  using ( auth.uid() = user_id );

-- INSERT: Users can insert their own.
create policy "Users can insert their own appointments"
  on public.citas for insert
  with check ( auth.uid() = user_id );

-- UPDATE: Employees can update status (handled via Edge Function usually, but if direct DB access needed:
-- We'll restrict direct updates to users only for their own data if needed, but mostly we want the Edge Function to handle status changes).
-- Let's allow users to update their own pending appointments (e.g. reschedule).
create policy "Users can update their own pending appointments"
  on public.citas for update
  using ( auth.uid() = user_id and status = 'pending' );

-- DELETE: Users can delete their own pending appointments.
create policy "Users can delete their own pending appointments"
  on public.citas for delete
  using ( auth.uid() = user_id and status = 'pending' );

-- Index for performance
create index if not exists idx_citas_employee_date on public.citas(employee_id, fecha_consulta);
