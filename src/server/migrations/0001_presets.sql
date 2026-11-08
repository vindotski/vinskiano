-- Saved sounds, one row per preset, owned by a guest (or later a registered user).
-- Migrations only ever add: never drop or rename in a later file.

CREATE TABLE presets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name       text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  settings   jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Saving under a name a visitor already used replaces that preset.
  UNIQUE (user_id, name)
);
