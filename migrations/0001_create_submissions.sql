-- Join / contact form submissions from /get-involved/.
-- Timestamps are ISO-8601 UTC strings so they sort and compare lexically.
CREATE TABLE IF NOT EXISTS submissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  role        TEXT    NOT NULL,
  grade       TEXT,
  school      TEXT,
  city        TEXT,
  interests   TEXT,             -- comma-separated interest keys
  message     TEXT,
  source      TEXT,             -- page the form was submitted from
  ip_hash     TEXT              -- salted SHA-256 of the client IP, used only for rate limiting
);

CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions (created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_ip ON submissions (ip_hash, created_at);
