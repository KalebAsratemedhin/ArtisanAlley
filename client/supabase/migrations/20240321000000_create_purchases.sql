-- Create purchases table
create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  artwork_id uuid references public."ArtPiece" on delete set null,
  artist_id uuid references auth.users on delete set null,
  stripe_session_id text not null,
  stripe_payment_intent_id text,
  amount decimal(10,2) not null,
  status text not null default 'pending',
  drop_off_location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.purchases enable row level security;

-- Create policies
create policy "Users can view their own purchases"
  on purchases for select
  using (auth.uid() = user_id);

create policy "Artists can view purchases of their artworks"
  on purchases for select
  using (auth.uid() = artist_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on purchases
  for each row
  execute procedure public.handle_updated_at(); 