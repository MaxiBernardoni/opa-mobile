
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. size_guides
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE size_guides (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       varchar NOT NULL,
  category   varchar NOT NULL CHECK (category IN ('tops', 'bottoms')),
  fit_type   varchar NOT NULL CHECK (fit_type IN ('oversize','boxy','relaxed','baggy','straight','skinny')),
  brand_id   uuid REFERENCES marcas(id) ON DELETE SET NULL,
  created_at timestamp DEFAULT now()
);

ALTER TABLE size_guides ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read_size_guides" ON size_guides FOR SELECT USING (true);

-- Brand owner can insert/update their own guides; service_role bypasses RLS
CREATE POLICY "brand_owner_insert_size_guides" ON size_guides
  FOR INSERT TO authenticated
  WITH CHECK (
    brand_id IS NULL OR
    EXISTS (SELECT 1 FROM marcas WHERE id = brand_id AND profile_id = auth.uid())
  );

CREATE POLICY "brand_owner_update_size_guides" ON size_guides
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM marcas WHERE id = brand_id AND profile_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. size_guide_entries
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE size_guide_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id    uuid NOT NULL REFERENCES size_guides(id) ON DELETE CASCADE,
  size_label  varchar NOT NULL,
  chest_min   numeric,
  chest_max   numeric,
  waist_min   numeric,
  waist_max   numeric,
  hip_min     numeric,
  hip_max     numeric,
  height_min  numeric,
  height_max  numeric,
  thigh_min   numeric,
  thigh_max   numeric,
  rise_min    numeric,
  rise_max    numeric,
  sort_order  int NOT NULL
);

ALTER TABLE size_guide_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_size_guide_entries" ON size_guide_entries FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. user_measurements
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE user_measurements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid UNIQUE NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  chest      numeric,
  waist      numeric,
  hip        numeric,
  height     numeric,
  thigh      numeric,
  updated_at timestamp DEFAULT now()
);

ALTER TABLE user_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_measurements" ON user_measurements
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_measurements" ON user_measurements
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_measurements" ON user_measurements
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_delete_own_measurements" ON user_measurements
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. prendas.size_guide_id
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE prendas ADD COLUMN size_guide_id uuid REFERENCES size_guides(id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Seed — OPA default guides (brand_id = NULL) + entries
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  g_oversize  uuid;
  g_boxy      uuid;
  g_relaxed   uuid;
  g_baggy     uuid;
  g_straight  uuid;
  g_skinny    uuid;
BEGIN

INSERT INTO size_guides (name, category, fit_type) VALUES ('Oversize',  'tops',    'oversize')  RETURNING id INTO g_oversize;
INSERT INTO size_guides (name, category, fit_type) VALUES ('Boxy',      'tops',    'boxy')      RETURNING id INTO g_boxy;
INSERT INTO size_guides (name, category, fit_type) VALUES ('Relaxed',   'tops',    'relaxed')   RETURNING id INTO g_relaxed;
INSERT INTO size_guides (name, category, fit_type) VALUES ('Baggy',     'bottoms', 'baggy')     RETURNING id INTO g_baggy;
INSERT INTO size_guides (name, category, fit_type) VALUES ('Straight',  'bottoms', 'straight')  RETURNING id INTO g_straight;
INSERT INTO size_guides (name, category, fit_type) VALUES ('Skinny',    'bottoms', 'skinny')    RETURNING id INTO g_skinny;

-- TOPS Oversize
INSERT INTO size_guide_entries (guide_id,sort_order,size_label,chest_min,chest_max,waist_min,waist_max,hip_min,hip_max,height_min,height_max) VALUES
  (g_oversize,0,'XS', 88, 92, 68, 72, 96,100,155,160),
  (g_oversize,1,'S',  92, 96, 72, 76,100,104,160,165),
  (g_oversize,2,'M',  96,100, 76, 80,104,108,165,170),
  (g_oversize,3,'L', 104,110, 84, 90,112,118,170,175),
  (g_oversize,4,'XL',112,120, 92,100,120,128,175,180),
  (g_oversize,5,'XXL',124,132,108,116,136,144,180,185);

-- TOPS Boxy
INSERT INTO size_guide_entries (guide_id,sort_order,size_label,chest_min,chest_max,waist_min,waist_max,hip_min,hip_max,height_min,height_max) VALUES
  (g_boxy,0,'XS', 80, 84, 66, 70, 90, 94,155,160),
  (g_boxy,1,'S',  84, 88, 70, 74, 94, 98,160,165),
  (g_boxy,2,'M',  88, 92, 74, 78, 98,102,165,170),
  (g_boxy,3,'L',  96,102, 82, 88,106,112,170,175),
  (g_boxy,4,'XL',106,112, 92, 98,116,122,175,180),
  (g_boxy,5,'XXL',118,124,104,110,128,134,180,185);

-- TOPS Relaxed
INSERT INTO size_guide_entries (guide_id,sort_order,size_label,chest_min,chest_max,waist_min,waist_max,hip_min,hip_max,height_min,height_max) VALUES
  (g_relaxed,0,'XS', 82, 86, 64, 68, 92, 96,155,160),
  (g_relaxed,1,'S',  86, 90, 68, 72, 96,100,160,165),
  (g_relaxed,2,'M',  90, 94, 72, 76,100,104,165,170),
  (g_relaxed,3,'L', 100,106, 80, 86,110,116,170,175),
  (g_relaxed,4,'XL',110,116, 90, 96,120,126,175,180),
  (g_relaxed,5,'XXL',122,128,102,108,132,138,180,185);

-- BOTTOMS Baggy
INSERT INTO size_guide_entries (guide_id,sort_order,size_label,waist_min,waist_max,hip_min,hip_max,thigh_min,thigh_max,rise_min,rise_max,height_min,height_max) VALUES
  (g_baggy,0,'XS', 58, 62, 86, 92, 58, 62,24,26,155,160),
  (g_baggy,1,'S',  62, 66, 92, 98, 62, 66,26,28,160,168),
  (g_baggy,2,'M',  68, 72,100,106, 68, 72,28,30,168,175),
  (g_baggy,3,'L',  76, 80,108,114, 76, 80,30,32,175,183),
  (g_baggy,4,'XL', 84, 90,116,124, 84, 90,32,34,183,190),
  (g_baggy,5,'XXL',96,104,128,136, 96,104,34,36,190,200);

-- BOTTOMS Straight
INSERT INTO size_guide_entries (guide_id,sort_order,size_label,waist_min,waist_max,hip_min,hip_max,thigh_min,thigh_max,rise_min,rise_max,height_min,height_max) VALUES
  (g_straight,0,'XS', 56, 60, 82, 88, 54, 58,24,26,155,160),
  (g_straight,1,'S',  60, 64, 88, 94, 58, 62,26,28,160,168),
  (g_straight,2,'M',  66, 70, 94,100, 64, 68,28,30,168,175),
  (g_straight,3,'L',  74, 78,102,108, 72, 76,30,32,175,183),
  (g_straight,4,'XL', 82, 88,110,118, 80, 86,32,34,183,190),
  (g_straight,5,'XXL',94,102,120,130, 92,100,34,36,190,200);

-- BOTTOMS Skinny
INSERT INTO size_guide_entries (guide_id,sort_order,size_label,waist_min,waist_max,hip_min,hip_max,thigh_min,thigh_max,rise_min,rise_max,height_min,height_max) VALUES
  (g_skinny,0,'XS', 54, 58, 78, 84, 50, 54,24,26,155,160),
  (g_skinny,1,'S',  58, 62, 84, 90, 54, 58,26,28,160,168),
  (g_skinny,2,'M',  64, 68, 90, 96, 60, 64,28,30,168,175),
  (g_skinny,3,'L',  72, 76, 98,104, 68, 72,30,32,175,183),
  (g_skinny,4,'XL', 80, 86,106,114, 76, 82,32,34,183,190),
  (g_skinny,5,'XXL',92,100,116,126, 88, 96,34,36,190,200);

END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. get_recommended_size function
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_recommended_size(guide_id uuid, p_user_id uuid)
RETURNS TABLE (size_label varchar, fit_preference varchar)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u user_measurements%rowtype;
  guide_cat varchar;
BEGIN
  SELECT * INTO u FROM user_measurements WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT category INTO guide_cat FROM size_guides WHERE id = guide_id;

  RETURN QUERY
  SELECT
    e.size_label,
    CASE
      WHEN (guide_cat = 'tops'    AND u.chest >= (e.chest_max * 0.85)) THEN 'ajustado'
      WHEN (guide_cat = 'tops'    AND u.chest <= (e.chest_min * 1.05)) THEN 'holgado'
      WHEN (guide_cat = 'bottoms' AND u.waist >= (e.waist_max * 0.90)) THEN 'ajustado'
      WHEN (guide_cat = 'bottoms' AND u.waist <= (e.waist_min * 1.05)) THEN 'holgado'
      ELSE 'justo'
    END::varchar AS fit_preference
  FROM size_guide_entries e
  WHERE e.guide_id = get_recommended_size.guide_id
    AND (
      (guide_cat = 'tops'    AND u.chest BETWEEN e.chest_min AND e.chest_max)
      OR
      (guide_cat = 'bottoms' AND u.waist BETWEEN e.waist_min AND e.waist_max)
    )
  ORDER BY e.sort_order
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_recommended_size(uuid, uuid) TO authenticated;
