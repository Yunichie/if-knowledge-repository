CREATE TABLE resources (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category_id   UUID        NOT NULL REFERENCES categories(id),
  type          TEXT        NOT NULL CHECK (type IN ('pdf', 'youtube', 'article')),
  title         TEXT        NOT NULL,
  description   TEXT,
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  r2_key        TEXT,
  file_url      TEXT,
  file_size     BIGINT,
  youtube_url   TEXT,
  thumbnail_url TEXT,
  content       TEXT,
  search_vector TSVECTOR,              -- no longer generated
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pdf_requires_url      CHECK (type != 'pdf'     OR file_url IS NOT NULL),
  CONSTRAINT youtube_requires_url  CHECK (type != 'youtube' OR youtube_url IS NOT NULL),
  CONSTRAINT article_requires_body CHECK (type != 'article' OR content IS NOT NULL)
);

-- Trigger function to maintain search_vector
CREATE OR REPLACE FUNCTION resources_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.content, '') || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resources_search_vector_trigger
  BEFORE INSERT OR UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION resources_search_vector_update();

CREATE INDEX idx_resources_fts      ON resources USING GIN(search_vector);
CREATE INDEX idx_resources_type     ON resources(type);
CREATE INDEX idx_resources_category ON resources(category_id);
CREATE INDEX idx_resources_author   ON resources(author_id);
CREATE INDEX idx_resources_tags     ON resources USING GIN(tags);
CREATE INDEX idx_resources_created  ON resources(created_at DESC);
