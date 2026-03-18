CREATE TABLE auth_credentials (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID  NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  provider      TEXT  NOT NULL CHECK (provider IN ('email', 'google')),
  provider_id   TEXT,
  password_hash TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (student_id, provider),

  CONSTRAINT google_requires_provider_id CHECK (provider != 'google' OR provider_id IS NOT NULL),
  CONSTRAINT email_requires_password     CHECK (provider != 'email'  OR password_hash IS NOT NULL)
);

CREATE INDEX idx_credentials_student ON auth_credentials(student_id);
CREATE INDEX idx_credentials_lookup  ON auth_credentials(provider, provider_id);
