-- NOTE: already applied manually. Do not re-run against production.
-- prendas_guardadas: garments saved by users to buy later
CREATE TABLE IF NOT EXISTS prendas_guardadas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garment_id uuid NOT NULL REFERENCES prendas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT prendas_guardadas_user_garment_unique UNIQUE (user_id, garment_id)
);

ALTER TABLE prendas_guardadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_prendas_guardadas" ON prendas_guardadas
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_prendas_guardadas" ON prendas_guardadas
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_prendas_guardadas" ON prendas_guardadas
  FOR DELETE TO authenticated USING (user_id = auth.uid());
