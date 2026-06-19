-- Seed: perfiles
-- 2 users seeded; @chechuabb pending
INSERT INTO perfiles (id, username, display_name, bio, avatar_url, instagram_handle, tags, is_brand)
VALUES
  ('36392f8d-a03a-4779-a4c2-1011c37e2fc8', 'vale.rios', 'Valentina Ríos',
   'outfits que cuentan algo. construyendo mi estilo de a poco ✦',
   'https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/avatars/users/vale_rios_avatar.png',
   'vale.rios', ARRAY['minimal','street','vintage'], false),
  ('9e72d1f5-9b8b-4cb1-982e-06c9109355f0', 'mateo.h', 'Mateo Herrera',
   'construyendo el look de a poco. street es el idioma ✦',
   'https://vecnktrbjolahcalkbml.supabase.co/storage/v1/object/public/avatars/users/mateo.h_avatar.png',
   'mateo.h', ARRAY['street','urban','oversized'], false)
ON CONFLICT (id) DO NOTHING;
