-- Brand application table: users submit to become brand owners on OPA
-- On approval: OPA creates the marcas row and sets marcas.owner_id + perfiles.is_brand = true
CREATE TABLE brand_applications (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id     uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  brand_name       varchar NOT NULL,
  instagram_handle varchar,
  category         varchar,
  status           text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by      uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  reviewed_at      timestamptz,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE brand_applications ENABLE ROW LEVEL SECURITY;

-- Applicant can read their own application
CREATE POLICY "applicant_select_own" ON brand_applications
  FOR SELECT TO authenticated
  USING (applicant_id = auth.uid());

-- Applicant can insert their own application
CREATE POLICY "applicant_insert_own" ON brand_applications
  FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.uid());

-- Admins can read all applications
CREATE POLICY "admin_select_all" ON brand_applications
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND is_admin = true));

-- Admins can update (approve/reject)
CREATE POLICY "admin_update_applications" ON brand_applications
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND is_admin = true));
