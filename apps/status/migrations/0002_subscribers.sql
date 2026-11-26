-- Email subscribers. Double opt-in: a row counts only once confirmed_at is
-- set. Tokens are stored as SHA-256 hashes; the emails carry the token.
CREATE TABLE subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  monitors TEXT,                -- JSON array of monitor ids; NULL = all
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER,
  last_sent_at INTEGER,         -- last confirmation email, for resend limits
  sends INTEGER NOT NULL DEFAULT 0 -- confirmation emails sent; capped
);
CREATE INDEX subscribers_confirmed ON subscribers (confirmed_at);

-- Subscribe attempts per hashed client IP, so the form cannot be used to
-- flood someone else's inbox. Pruned with the checks.
CREATE TABLE subscribe_attempts (
  ip_hash TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX subscribe_attempts_ip ON subscribe_attempts (ip_hash, at);

-- Emails waiting to go out: one row per subscriber per round of incident
-- changes. The minute cron sends a bounded batch, so a large list is never
-- cut off by a request's time limit.
CREATE TABLE email_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id TEXT NOT NULL,
  incident_ids TEXT NOT NULL,   -- JSON array
  created_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);

-- Whether subscribers were told about an incident, so a flapping service's
-- unannounced incident is not announced as resolved either.
ALTER TABLE incidents ADD COLUMN notified INTEGER NOT NULL DEFAULT 0;
