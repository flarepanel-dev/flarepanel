-- Email subscribers. Double opt-in: a row counts only once confirmed_at is
-- set. Tokens are stored as SHA-256 hashes; the emails carry the token.
CREATE TABLE subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  monitors TEXT,                -- JSON array of monitor ids; NULL = all
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER,
  last_sent_at INTEGER          -- last confirmation email, for resend limits
);
CREATE INDEX subscribers_confirmed ON subscribers (confirmed_at);

-- Subscribe attempts per hashed client IP, so the form cannot be used to
-- flood someone else's inbox. Pruned with the checks.
CREATE TABLE subscribe_attempts (
  ip_hash TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX subscribe_attempts_ip ON subscribe_attempts (ip_hash, at);
