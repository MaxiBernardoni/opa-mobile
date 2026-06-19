
-- Un usuario no puede dar like dos veces al mismo outfit
ALTER TABLE outfit_likes
  ADD CONSTRAINT outfit_likes_user_outfit_unique UNIQUE (user_id, outfit_id);

-- Un usuario no puede guardar dos veces el mismo outfit
ALTER TABLE outfits_guardados
  ADD CONSTRAINT outfits_guardados_user_outfit_unique UNIQUE (user_id, outfit_id);
