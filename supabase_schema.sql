-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  age integer,
  education text,
  percentage integer,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create User Applications Tracking Table
create table public.user_applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  opportunity_id text not null, -- Links to the backend mock/scraped ID
  status text not null check (status in ('Saved', 'Applied', 'Shortlisted', 'Rejected')),
  applied_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate tracking records for the same opportunity
  unique(user_id, opportunity_id)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_applications enable row level security;

-- Profiles: Users can only see and update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to automatically create a profile row when a user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Applications: Users can only see and manage their own applications
create policy "Users can manage their own applications" on user_applications for all using (auth.uid() = user_id);

-- Create User Documents Table (Phase 4: Vault)
create table public.user_documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  document_type text not null check (document_type in ('ID Proof', '10th Marksheet', '12th Marksheet', 'Degree/UG', 'Caste Certificate', 'Income Certificate', 'Passport Photo', 'Signature', 'Other')),
  file_name text not null,
  file_path text not null, -- Path inside the Supabase Storage bucket
  file_size integer not null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for user_documents
alter table public.user_documents enable row level security;
create policy "Users can manage their own documents" on user_documents for all using (auth.uid() = user_id);
