-- Rename marcas.owner_id to profile_id
-- Reflects the brand model decision: a brand is an independent account (not an extension of a user)
ALTER TABLE marcas RENAME COLUMN owner_id TO profile_id;
