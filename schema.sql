-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Restaurants Table
create table restaurants (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  owner_id uuid references auth.users,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Menu Items Table
create table menu_items (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references restaurants(id) not null,
  name text not null,
  description text,
  price numeric not null,
  category text not null,
  image_url text,
  is_vegetarian boolean default false,
  is_spicy boolean default false,
  available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references restaurants(id) not null,
  table_number int not null,
  status text not null default 'PENDING', -- PENDING, PREPARING, READY, COMPLETED, CANCELLED
  total numeric not null,
  customer_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) not null,
  menu_item_id uuid references menu_items(id) not null,
  quantity int not null,
  price_at_time numeric not null
);

-- Enable Realtime for Orders
alter publication supabase_realtime add table orders;

-- Row Level Security (RLS) Policies
-- For MVP, we will allow public read access to restaurants and menu items
-- and public insert access to orders.

alter table restaurants enable row level security;
create policy "Public restaurants are viewable by everyone." on restaurants for select using (true);

alter table menu_items enable row level security;
create policy "Public menu items are viewable by everyone." on menu_items for select using (true);

alter table orders enable row level security;
create policy "Anyone can create an order." on orders for insert with check (true);
create policy "Anyone can view their order (by ID)." on orders for select using (true); -- In real app, secure this!

alter table order_items enable row level security;
create policy "Anyone can create order items." on order_items for insert with check (true);
create policy "Anyone can view order items." on order_items for select using (true);

-- Seed Data (Demo Restaurant)
insert into restaurants (slug, name) values ('demo-restaurant', 'The Obsidian Fork');

-- Insert Menu Items (You can run this after getting the restaurant ID, or use a subquery)
insert into menu_items (restaurant_id, name, description, price, category, image_url, is_vegetarian, available)
select id, 'Truffle Mushroom Risotto', 'Arborio rice slowly cooked with porcini broth, finished with truffle oil and aged parmesan.', 24, 'Mains', 'https://picsum.photos/seed/risotto/400/300', true, true
from restaurants where slug = 'demo-restaurant';

insert into menu_items (restaurant_id, name, description, price, category, image_url, available)
select id, 'Crispy Pork Belly', 'Slow-roasted pork belly with a crackling skin, served on a bed of apple fennel slaw.', 28, 'Mains', 'https://picsum.photos/seed/pork/400/300', true
from restaurants where slug = 'demo-restaurant';

insert into menu_items (restaurant_id, name, description, price, category, image_url, is_vegetarian, available)
select id, 'Burrata & Heirloom', 'Fresh burrata cheese with heirloom tomatoes, basil pesto, and balsamic glaze.', 18, 'Starters', 'https://picsum.photos/seed/burrata/400/300', true, true
from restaurants where slug = 'demo-restaurant';
