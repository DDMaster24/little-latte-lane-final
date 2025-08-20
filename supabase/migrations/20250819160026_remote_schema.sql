drop extension if exists "pg_net";


  create table "public"."bookings" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "name" text not null,
    "email" text not null,
    "phone" text,
    "booking_date" date not null,
    "booking_time" time without time zone not null,
    "party_size" integer not null,
    "status" text default 'pending'::text,
    "special_requests" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."bookings" enable row level security;


  create table "public"."events" (
    "id" uuid not null default uuid_generate_v4(),
    "title" text not null,
    "description" text,
    "event_type" text default 'special'::text,
    "start_date" date,
    "end_date" date,
    "is_active" boolean default true,
    "image_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."events" enable row level security;


  create table "public"."menu_categories" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "display_order" integer default 0,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."menu_categories" enable row level security;


  create table "public"."menu_items" (
    "id" uuid not null default uuid_generate_v4(),
    "category_id" uuid,
    "name" text not null,
    "description" text,
    "price" numeric(10,2) not null,
    "is_available" boolean default true,
    "image_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."menu_items" enable row level security;


  create table "public"."order_items" (
    "id" uuid not null default uuid_generate_v4(),
    "order_id" uuid,
    "menu_item_id" uuid,
    "quantity" integer not null default 1,
    "price" numeric(10,2) not null,
    "special_instructions" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."order_items" enable row level security;


  create table "public"."orders" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "order_number" text,
    "status" text default 'pending'::text,
    "total_amount" numeric(10,2) default 0,
    "payment_status" text default 'pending'::text,
    "special_instructions" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."orders" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "role" text default 'customer'::text,
    "phone" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "email" text,
    "phone_number" text,
    "is_admin" boolean default false,
    "is_staff" boolean default false,
    "address" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."staff_requests" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "request_type" text default 'general'::text,
    "message" text not null,
    "status" text default 'pending'::text,
    "priority" text default 'normal'::text,
    "assigned_to" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."staff_requests" enable row level security;

CREATE UNIQUE INDEX bookings_pkey ON public.bookings USING btree (id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE UNIQUE INDEX menu_categories_pkey ON public.menu_categories USING btree (id);

CREATE UNIQUE INDEX menu_items_pkey ON public.menu_items USING btree (id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX staff_requests_pkey ON public.staff_requests USING btree (id);

alter table "public"."bookings" add constraint "bookings_pkey" PRIMARY KEY using index "bookings_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."menu_categories" add constraint "menu_categories_pkey" PRIMARY KEY using index "menu_categories_pkey";

alter table "public"."menu_items" add constraint "menu_items_pkey" PRIMARY KEY using index "menu_items_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."staff_requests" add constraint "staff_requests_pkey" PRIMARY KEY using index "staff_requests_pkey";

alter table "public"."bookings" add constraint "bookings_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text]))) not valid;

alter table "public"."bookings" validate constraint "bookings_status_check";

alter table "public"."bookings" add constraint "bookings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) not valid;

alter table "public"."bookings" validate constraint "bookings_user_id_fkey";

alter table "public"."events" add constraint "events_event_type_check" CHECK ((event_type = ANY (ARRAY['special'::text, 'promotion'::text, 'announcement'::text]))) not valid;

alter table "public"."events" validate constraint "events_event_type_check";

alter table "public"."menu_items" add constraint "menu_items_category_id_fkey" FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE not valid;

alter table "public"."menu_items" validate constraint "menu_items_category_id_fkey";

alter table "public"."order_items" add constraint "order_items_menu_item_id_fkey" FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) not valid;

alter table "public"."order_items" validate constraint "order_items_menu_item_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."orders" add constraint "orders_order_number_key" UNIQUE using index "orders_order_number_key";

alter table "public"."orders" add constraint "orders_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'pending'::text, 'confirmed'::text, 'preparing'::text, 'ready'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_status_check";

alter table "public"."orders" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) not valid;

alter table "public"."orders" validate constraint "orders_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['customer'::text, 'staff'::text, 'admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."staff_requests" add constraint "staff_requests_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES profiles(id) not valid;

alter table "public"."staff_requests" validate constraint "staff_requests_assigned_to_fkey";

alter table "public"."staff_requests" add constraint "staff_requests_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]))) not valid;

alter table "public"."staff_requests" validate constraint "staff_requests_priority_check";

alter table "public"."staff_requests" add constraint "staff_requests_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."staff_requests" validate constraint "staff_requests_status_check";

alter table "public"."staff_requests" add constraint "staff_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) not valid;

alter table "public"."staff_requests" validate constraint "staff_requests_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_role')::text,
    'customer'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    phone_number,
    role,
    is_admin,
    is_staff,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'phone_number'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.raw_user_meta_data->>'phone'),
    'customer',
    false,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    updated_at = NOW();
    
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT public.get_user_role() = 'admin';
$function$
;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT public.get_user_role() IN ('staff', 'admin');
$function$
;

grant delete on table "public"."bookings" to "anon";

grant insert on table "public"."bookings" to "anon";

grant references on table "public"."bookings" to "anon";

grant select on table "public"."bookings" to "anon";

grant trigger on table "public"."bookings" to "anon";

grant truncate on table "public"."bookings" to "anon";

grant update on table "public"."bookings" to "anon";

grant delete on table "public"."bookings" to "authenticated";

grant insert on table "public"."bookings" to "authenticated";

grant references on table "public"."bookings" to "authenticated";

grant select on table "public"."bookings" to "authenticated";

grant trigger on table "public"."bookings" to "authenticated";

grant truncate on table "public"."bookings" to "authenticated";

grant update on table "public"."bookings" to "authenticated";

grant delete on table "public"."bookings" to "service_role";

grant insert on table "public"."bookings" to "service_role";

grant references on table "public"."bookings" to "service_role";

grant select on table "public"."bookings" to "service_role";

grant trigger on table "public"."bookings" to "service_role";

grant truncate on table "public"."bookings" to "service_role";

grant update on table "public"."bookings" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."menu_categories" to "anon";

grant insert on table "public"."menu_categories" to "anon";

grant references on table "public"."menu_categories" to "anon";

grant select on table "public"."menu_categories" to "anon";

grant trigger on table "public"."menu_categories" to "anon";

grant truncate on table "public"."menu_categories" to "anon";

grant update on table "public"."menu_categories" to "anon";

grant delete on table "public"."menu_categories" to "authenticated";

grant insert on table "public"."menu_categories" to "authenticated";

grant references on table "public"."menu_categories" to "authenticated";

grant select on table "public"."menu_categories" to "authenticated";

grant trigger on table "public"."menu_categories" to "authenticated";

grant truncate on table "public"."menu_categories" to "authenticated";

grant update on table "public"."menu_categories" to "authenticated";

grant delete on table "public"."menu_categories" to "service_role";

grant insert on table "public"."menu_categories" to "service_role";

grant references on table "public"."menu_categories" to "service_role";

grant select on table "public"."menu_categories" to "service_role";

grant trigger on table "public"."menu_categories" to "service_role";

grant truncate on table "public"."menu_categories" to "service_role";

grant update on table "public"."menu_categories" to "service_role";

grant delete on table "public"."menu_items" to "anon";

grant insert on table "public"."menu_items" to "anon";

grant references on table "public"."menu_items" to "anon";

grant select on table "public"."menu_items" to "anon";

grant trigger on table "public"."menu_items" to "anon";

grant truncate on table "public"."menu_items" to "anon";

grant update on table "public"."menu_items" to "anon";

grant delete on table "public"."menu_items" to "authenticated";

grant insert on table "public"."menu_items" to "authenticated";

grant references on table "public"."menu_items" to "authenticated";

grant select on table "public"."menu_items" to "authenticated";

grant trigger on table "public"."menu_items" to "authenticated";

grant truncate on table "public"."menu_items" to "authenticated";

grant update on table "public"."menu_items" to "authenticated";

grant delete on table "public"."menu_items" to "service_role";

grant insert on table "public"."menu_items" to "service_role";

grant references on table "public"."menu_items" to "service_role";

grant select on table "public"."menu_items" to "service_role";

grant trigger on table "public"."menu_items" to "service_role";

grant truncate on table "public"."menu_items" to "service_role";

grant update on table "public"."menu_items" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."staff_requests" to "anon";

grant insert on table "public"."staff_requests" to "anon";

grant references on table "public"."staff_requests" to "anon";

grant select on table "public"."staff_requests" to "anon";

grant trigger on table "public"."staff_requests" to "anon";

grant truncate on table "public"."staff_requests" to "anon";

grant update on table "public"."staff_requests" to "anon";

grant delete on table "public"."staff_requests" to "authenticated";

grant insert on table "public"."staff_requests" to "authenticated";

grant references on table "public"."staff_requests" to "authenticated";

grant select on table "public"."staff_requests" to "authenticated";

grant trigger on table "public"."staff_requests" to "authenticated";

grant truncate on table "public"."staff_requests" to "authenticated";

grant update on table "public"."staff_requests" to "authenticated";

grant delete on table "public"."staff_requests" to "service_role";

grant insert on table "public"."staff_requests" to "service_role";

grant references on table "public"."staff_requests" to "service_role";

grant select on table "public"."staff_requests" to "service_role";

grant trigger on table "public"."staff_requests" to "service_role";

grant truncate on table "public"."staff_requests" to "service_role";

grant update on table "public"."staff_requests" to "service_role";


  create policy "Staff can view all bookings"
  on "public"."bookings"
  as permissive
  for select
  to public
using (is_staff_or_admin());



  create policy "Users can manage their bookings"
  on "public"."bookings"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Anyone can view active events"
  on "public"."events"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "Staff can manage events"
  on "public"."events"
  as permissive
  for all
  to public
using (is_staff_or_admin());



  create policy "Anyone can view active categories"
  on "public"."menu_categories"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "Staff can manage categories"
  on "public"."menu_categories"
  as permissive
  for all
  to public
using (is_staff_or_admin());



  create policy "Anyone can view available items"
  on "public"."menu_items"
  as permissive
  for select
  to public
using ((is_available = true));



  create policy "Staff can manage items"
  on "public"."menu_items"
  as permissive
  for all
  to public
using (is_staff_or_admin());



  create policy "Staff can manage all order items"
  on "public"."order_items"
  as permissive
  for all
  to public
using (is_staff_or_admin());



  create policy "Users can manage their order items"
  on "public"."order_items"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid()) AND (orders.status = ANY (ARRAY['draft'::text, 'pending'::text]))))));



  create policy "Users can view their order items"
  on "public"."order_items"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));



  create policy "Staff can update orders"
  on "public"."orders"
  as permissive
  for update
  to public
using (is_staff_or_admin());



  create policy "Staff can view all orders"
  on "public"."orders"
  as permissive
  for select
  to public
using (is_staff_or_admin());



  create policy "Users can create orders"
  on "public"."orders"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their pending orders"
  on "public"."orders"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) AND (status = ANY (ARRAY['draft'::text, 'pending'::text]))));



  create policy "Users can view their own orders"
  on "public"."orders"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins can view all profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using (is_admin());



  create policy "Service role can manage profiles"
  on "public"."profiles"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view their own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "Staff can manage requests"
  on "public"."staff_requests"
  as permissive
  for all
  to public
using (is_staff_or_admin());



