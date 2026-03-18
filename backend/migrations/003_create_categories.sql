CREATE TABLE categories (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

INSERT INTO categories (name, slug) VALUES
  ('Algorithms', 'algorithms'),
  ('Databases', 'databases'),
  ('Operating Systems', 'operating-systems'),
  ('Computer Networks', 'computer-networks'),
  ('Software Engineering', 'software-engineering'),
  ('General', 'general');
