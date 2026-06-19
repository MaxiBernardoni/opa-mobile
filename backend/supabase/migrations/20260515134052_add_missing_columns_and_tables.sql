
-- === COLUMNAS FALTANTES ===

ALTER TABLE public.outfits
  ADD COLUMN IF NOT EXISTS occasion   varchar,
  ADD COLUMN IF NOT EXISTS style      varchar,
  ADD COLUMN IF NOT EXISTS likes_count int DEFAULT 0;

ALTER TABLE public.garments
  ADD COLUMN IF NOT EXISTS available_sizes text[],
  ADD COLUMN IF NOT EXISTS talle      varchar;

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS instagram_handle varchar,
  ADD COLUMN IF NOT EXISTS tags        text[],
  ADD COLUMN IF NOT EXISTS website     varchar,
  ADD COLUMN IF NOT EXISTS location    varchar;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS instagram_handle varchar,
  ADD COLUMN IF NOT EXISTS tags        text[],
  ADD COLUMN IF NOT EXISTS followers_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outfits_count  int DEFAULT 0;

-- === TABLAS NUEVAS ===

CREATE TABLE IF NOT EXISTS public.follows (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id  uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   timestamp DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  garment_id uuid REFERENCES public.garments(id) ON DELETE CASCADE,
  quantity   int DEFAULT 1,
  size       varchar,
  added_at   timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES public.profiles(id),
  status           varchar NOT NULL DEFAULT 'pending',
  total            numeric NOT NULL,
  discount         numeric DEFAULT 0,
  shipping_address text,
  tracking_code    varchar,
  estimated_delivery date,
  created_at       timestamp DEFAULT now(),
  updated_at       timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id   uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  garment_id uuid REFERENCES public.garments(id),
  quantity   int DEFAULT 1,
  size       varchar,
  unit_price numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES public.profiles(id),
  order_id   uuid REFERENCES public.orders(id),
  garment_id uuid REFERENCES public.garments(id),
  rating     int CHECK (rating BETWEEN 1 AND 5),
  comment    text,
  created_at timestamp DEFAULT now()
);

-- RLS en tablas nuevas
ALTER TABLE public.follows     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews     ENABLE ROW LEVEL SECURITY;
