-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  username text unique,
  website text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a trigger to create a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, updated_at)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', now());
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 