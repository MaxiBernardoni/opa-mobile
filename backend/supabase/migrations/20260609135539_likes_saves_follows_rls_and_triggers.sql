
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add saves_count to outfits
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE outfits ADD COLUMN IF NOT EXISTS saves_count int NOT NULL DEFAULT 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RLS — outfit_likes (INSERT / DELETE)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "users_insert_own_likes" ON outfit_likes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_likes" ON outfit_likes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RLS — outfits_guardados (INSERT / DELETE)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "users_insert_own_saves" ON outfits_guardados
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_saves" ON outfits_guardados
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RLS — follows (SELECT público + INSERT/DELETE propios)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "public_read_follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "users_insert_own_follows" ON follows
  FOR INSERT TO authenticated
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "users_delete_own_follows" ON follows
  FOR DELETE TO authenticated
  USING (follower_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Trigger function — likes_count en outfits
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_outfit_like()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE outfits SET likes_count = likes_count + 1 WHERE id = NEW.outfit_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE outfits SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.outfit_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_outfit_like
  AFTER INSERT OR DELETE ON outfit_likes
  FOR EACH ROW EXECUTE FUNCTION handle_outfit_like();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Trigger function — saves_count en outfits
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_outfit_save()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE outfits SET saves_count = saves_count + 1 WHERE id = NEW.outfit_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE outfits SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = OLD.outfit_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_outfit_save
  AFTER INSERT OR DELETE ON outfits_guardados
  FOR EACH ROW EXECUTE FUNCTION handle_outfit_save();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Trigger function — followers_count / following_count en perfiles
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_follow()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE perfiles SET following_count  = following_count  + 1 WHERE id = NEW.follower_id;
    UPDATE perfiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE perfiles SET following_count  = GREATEST(following_count  - 1, 0) WHERE id = OLD.follower_id;
    UPDATE perfiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_follow
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION handle_follow();

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Recalcular contadores existentes desde cero (por si ya había datos)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE outfits o
SET likes_count = (SELECT COUNT(*) FROM outfit_likes WHERE outfit_id = o.id);

UPDATE outfits o
SET saves_count = (SELECT COUNT(*) FROM outfits_guardados WHERE outfit_id = o.id);

UPDATE perfiles p
SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = p.id);

UPDATE perfiles p
SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = p.id);
