-- Casa Aura / PostgreSQL Supabase. Execute once in the SQL Editor.
-- Only the server service role can write; public reads expose active products only.
create extension if not exists pgcrypto;
create table if not exists public.products (
 id text primary key, slug text unique not null, name text not null,
 category text not null check(category in ('gesso','textil')), color text not null,
 price_cents integer not null check(price_cents>0), images jsonb not null default '[]',
 description text not null, dimensions text not null default '', care text not null default '',
 stock integer not null default 1 check(stock>=0), active boolean not null default false,
 weight numeric not null check(weight>0), width numeric not null check(width>0),
 height numeric not null check(height>0), length numeric not null check(length>0),
 created_at timestamptz not null default now()
);
comment on column public.products.stock is 'Availability / maximum units per checkout, managed by the brand. Not an automatically reserved inventory count.';
create table if not exists public.app_admins(user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.orders (
 id uuid primary key, payload_hash text not null, payment_token_hash text not null,
 customer_name text not null, email text not null, address jsonb not null, items jsonb not null,
 method text not null check(method in ('pix','card')),
 subtotal_cents integer not null check(subtotal_cents>0), discount_cents integer not null default 0,
 shipping_cents integer not null check(shipping_cents>=0), shipping_name text not null,
 total_cents integer not null check(total_cents>0),
 status text not null default 'pending' check(status in ('pending','paid','shipped','delivered','rejected','cancelled','refunded','charged_back')),
 payment_id text unique, preference_id text, payment_result jsonb, payment_claimed_at timestamptz,
 tracking_code text, created_at timestamptz not null default now(), paid_at timestamptz,
 shipped_at timestamptz, delivered_at timestamptz,
 check(total_cents=subtotal_cents-discount_cents+shipping_cents)
);
create index if not exists orders_date_idx on public.orders(created_at desc);
create table if not exists public.email_outbox (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
 kind text not null check(kind in ('confirmed','shipped','aftercare')),
 scheduled_at timestamptz not null default now(), next_attempt_at timestamptz not null default now(),
 sent_at timestamptz, locked_until timestamptz, attempts integer not null default 0, last_error text,
 unique(order_id,kind)
);
create index if not exists emails_pending_idx on public.email_outbox(scheduled_at,next_attempt_at) where sent_at is null;
create table if not exists public.rate_limits(key text primary key, window_start timestamptz not null default now(), hits integer not null default 1);
alter table public.products enable row level security;
alter table public.app_admins enable row level security;
alter table public.orders enable row level security;
alter table public.email_outbox enable row level security;
alter table public.rate_limits enable row level security;
revoke all on public.products,public.app_admins,public.orders,public.email_outbox,public.rate_limits from anon,authenticated;
grant select on public.products to anon,authenticated;
grant all on public.products,public.app_admins,public.orders,public.email_outbox,public.rate_limits to service_role;
create policy "Active catalog only" on public.products for select to anon,authenticated using (active=true);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('product-images','product-images',true,4000000,array['image/webp']) on conflict(id) do nothing;
-- Uploads are performed server-side, after authentication and admin authorization.

create or replace function public.take_rate_limit(p_key text,p_limit integer) returns boolean
language plpgsql security definer set search_path=public as $$
declare r public.rate_limits;
begin
 insert into rate_limits(key) values(p_key) on conflict(key) do update set
 hits=case when rate_limits.window_start<now()-interval '1 minute' then 1 else rate_limits.hits+1 end,
 window_start=case when rate_limits.window_start<now()-interval '1 minute' then now() else rate_limits.window_start end
 returning * into r;
 delete from rate_limits where window_start<now()-interval '1 day';
 return r.hits<=p_limit;
end $$;
create or replace function public.claim_payment(p_id uuid) returns boolean
language plpgsql security definer set search_path=public as $$
begin
 update orders set payment_claimed_at=now() where id=p_id and status='pending' and payment_result is null
 and (payment_claimed_at is null or payment_claimed_at<now()-interval '2 minutes');
 return found;
end $$;
create or replace function public.apply_payment(p_order uuid,p_payment text,p_status text,p_total integer,p_method text) returns void
language plpgsql security definer set search_path=public as $$
declare o public.orders;
begin
 select * into o from orders where id=p_order for update;
 if not found then return; end if;
 if o.total_cents<>p_total or o.method<>p_method then raise exception 'Payment mismatch'; end if;
 if o.payment_id is not null and o.payment_id<>p_payment then raise exception 'Different payment: manual review required'; end if;
 if p_status='approved' then
  if o.status in ('refunded','charged_back','cancelled') then return; end if;
  update orders set status=case when status in ('shipped','delivered') then status else 'paid' end,
  payment_id=p_payment,paid_at=coalesce(paid_at,now()) where id=p_order;
  insert into email_outbox(order_id,kind) values(p_order,'confirmed') on conflict(order_id,kind) do nothing;
 elsif p_status in ('refunded','charged_back') then
  update orders set status=p_status,payment_id=p_payment where id=p_order;
  delete from email_outbox where order_id=p_order and kind='aftercare' and sent_at is null;
 elsif p_status in ('cancelled','rejected') and o.status='pending' then
  update orders set status=p_status,payment_id=p_payment where id=p_order;
 end if;
end $$;
create or replace function public.update_fulfillment(p_id uuid,p_status text,p_tracking text) returns void
language plpgsql security definer set search_path=public as $$
declare o public.orders;
begin
 select * into o from orders where id=p_id for update;
 if not found then raise exception 'Order not found'; end if;
 if p_status='shipped' and o.status='paid' and length(trim(p_tracking))>0 then
  update orders set status='shipped',tracking_code=p_tracking,shipped_at=now() where id=p_id;
  insert into email_outbox(order_id,kind) values(p_id,'shipped') on conflict(order_id,kind) do nothing;
 elsif p_status='delivered' and o.status='shipped' then
  update orders set status='delivered',delivered_at=now() where id=p_id;
  insert into email_outbox(order_id,kind,scheduled_at) values(p_id,'aftercare',now()+interval '7 days') on conflict(order_id,kind) do nothing;
 elsif p_status=o.status then return;
 else raise exception 'Invalid fulfillment transition'; end if;
end $$;
create or replace function public.claim_email_jobs()
returns table(id uuid,order_id uuid,kind text,email text,customer_name text,tracking_code text,attempts integer)
language sql security definer set search_path=public as $$
 with picked as (
  select e.id from email_outbox e where e.sent_at is null and e.scheduled_at<=now() and e.next_attempt_at<=now()
  and (e.locked_until is null or e.locked_until<now()) and e.attempts<8
  order by e.scheduled_at for update skip locked limit 8
 ), claimed as (
  update email_outbox e set locked_until=now()+interval '5 minutes',attempts=e.attempts+1
  from picked p where e.id=p.id returning e.*
 ) select c.id,c.order_id,c.kind,o.email,o.customer_name,o.tracking_code,c.attempts
 from claimed c join orders o on o.id=c.order_id;
$$;
revoke all on function public.take_rate_limit(text,integer),public.claim_payment(uuid),public.apply_payment(uuid,text,text,integer,text),public.update_fulfillment(uuid,text,text),public.claim_email_jobs() from public,anon,authenticated;
grant execute on function public.take_rate_limit(text,integer),public.claim_payment(uuid),public.apply_payment(uuid,text,text,integer,text),public.update_fulfillment(uuid,text,text),public.claim_email_jobs() to service_role;
-- Create your admin user in Supabase Auth, then explicitly authorize the UUID:
-- insert into public.app_admins(user_id) values ('YOUR_AUTH_USER_UUID');
-- No user can grant themselves admin access through the public API.
