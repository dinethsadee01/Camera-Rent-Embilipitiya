-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Items table
create table if not exists items (
  id          uuid primary key default gen_random_uuid(),
  sku         text unique not null,
  name        text not null,
  category    text not null check (category in ('camera','lens','accessory','lighting','other')),
  daily_rate  numeric(10,2) not null check (daily_rate >= 0),
  quantity    int not null default 1 check (quantity >= 0),
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Customers table
create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  customer_code   text unique not null,
  full_name       text not null,
  phone           text not null,
  phone_secondary text,
  nic             text,
  address         text,
  id_photo_url    text,
  registered_at   timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Bookings table
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  booking_code    text unique not null,
  customer_id     uuid not null references customers(id) on delete restrict,
  item_id         uuid not null references items(id) on delete restrict,
  quantity        int not null default 1 check (quantity >= 1),
  start_date      date not null,
  end_date        date not null,
  daily_rate      numeric(10,2) not null,
  total_price     numeric(10,2) not null,
  status          text not null default 'upcoming' check (status in ('upcoming','active','completed','cancelled')),
  payment_status  text not null default 'pending' check (payment_status in ('paid','pending','partial')),
  payment_method  text check (payment_method in ('cash','bank_transfer')),
  advance_amount  numeric(10,2) default 0,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  constraint valid_date_range check (end_date >= start_date)
);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger to all tables
create trigger items_updated_at before update on items
  for each row execute function update_updated_at();

create trigger customers_updated_at before update on customers
  for each row execute function update_updated_at();

create trigger bookings_updated_at before update on bookings
  for each row execute function update_updated_at();

-- Indexes for common queries
create index if not exists idx_bookings_customer on bookings(customer_id);
create index if not exists idx_bookings_item on bookings(item_id);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_bookings_dates on bookings(start_date, end_date);

-- Row Level Security (disable for app-level auth pattern)
alter table items disable row level security;
alter table customers disable row level security;
alter table bookings disable row level security;

-- Storage bucket for ID photos (run in Supabase dashboard)
-- insert into storage.buckets (id, name, public) values ('id-photos', 'id-photos', false);
