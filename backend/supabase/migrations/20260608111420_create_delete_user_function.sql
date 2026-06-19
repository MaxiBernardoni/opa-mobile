
-- delete_user(): borra todos los datos del usuario autenticado y su cuenta auth.
--
-- Orden de borrado para respetar FKs sin CASCADE:
--   1. reseñas           (NO CASCADE → user_id → perfiles)
--   2. productos_orden   (NO CASCADE → order_id → orders; orders NO CASCADE → user_id → perfiles)
--   3. orders            (NO CASCADE → user_id → perfiles)
--   4. marcas.owner_id   (NO CASCADE → owner_id → perfiles — nullify, no borrar la marca)
--   5. outfits           (NO CASCADE → creator_id → perfiles; sus outfit_items/likes/guardados
--                         tienen CASCADE desde outfits, así que se limpian solos)
--   6. perfiles          (CASCADE → auth.users, por eso va antes de auth.users)
--   7. auth.users        (perfiles tiene CASCADE desde auth.users, pero borramos perfiles
--                         explícitamente primero para asegurarnos)
--
-- Tablas que NO necesitan borrado explícito (tienen ON DELETE CASCADE desde perfiles o auth.users):
--   follows, outfit_likes, outfits_guardados, prendas_armario, productos_carrito,
--   sessions, identities, mfa_factors, one_time_tokens

create or replace function delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Nullify brand ownership (don't delete the brand itself)
  update marcas set owner_id = null where owner_id = uid;

  -- Clean up orders and their line items
  delete from productos_orden
    where order_id in (select id from orders where user_id = uid);
  delete from reseñas where user_id = uid;
  delete from orders where user_id = uid;

  -- Delete outfits (outfit_items, outfit_likes, outfits_guardados cascade from outfits)
  delete from outfits where creator_id = uid;

  -- Delete profile (follows, outfit_likes, outfits_guardados, prendas_armario,
  -- productos_carrito cascade from perfiles)
  delete from perfiles where id = uid;

  -- Delete auth account (sessions, identities, etc. cascade from auth.users)
  delete from auth.users where id = uid;
end;
$$;

-- Only authenticated users can call this function
revoke all on function delete_user() from public;
grant execute on function delete_user() to authenticated;
