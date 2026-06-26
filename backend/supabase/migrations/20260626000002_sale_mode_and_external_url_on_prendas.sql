-- Add sale_mode and external_url to prendas
-- Enables hybrid sales model: direct (OPA processes payment) or redirect (external URL)
ALTER TABLE prendas
  ADD COLUMN IF NOT EXISTS sale_mode text DEFAULT 'direct'
    CHECK (sale_mode IN ('direct', 'redirect')),
  ADD COLUMN IF NOT EXISTS external_url text;
