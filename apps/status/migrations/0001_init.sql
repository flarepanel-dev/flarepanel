-- One row per check, kept 48 hours (response-time chart, latest state).
CREATE TABLE checks (
  monitor TEXT NOT NULL,
  at INTEGER NOT NULL,
  state TEXT NOT NULL,          -- up | degraded | down
  latency_ms INTEGER,
  status_code INTEGER,
  error TEXT,
  PRIMARY KEY (monitor, at)
);

-- One row per monitor and UTC day, kept 90 days (uptime bars and %).
CREATE TABLE daily (
  monitor TEXT NOT NULL,
  day TEXT NOT NULL,            -- YYYY-MM-DD (UTC)
  checks INTEGER NOT NULL DEFAULT 0,
  down INTEGER NOT NULL DEFAULT 0,
  degraded INTEGER NOT NULL DEFAULT 0,
  latency_sum INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (monitor, day)
);

-- Consecutive results per monitor; opens and resolves automatic incidents.
CREATE TABLE monitor_state (
  monitor TEXT PRIMARY KEY,
  fails INTEGER NOT NULL DEFAULT 0,
  oks INTEGER NOT NULL DEFAULT 0,
  incident_id TEXT
);

CREATE TABLE incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  impact TEXT NOT NULL,         -- minor | major | maintenance
  status TEXT NOT NULL,         -- investigating | identified | monitoring | resolved | scheduled | in_progress | completed
  monitors TEXT NOT NULL,       -- JSON array of monitor ids
  auto INTEGER NOT NULL DEFAULT 0,
  started_at INTEGER NOT NULL,
  resolved_at INTEGER,
  scheduled_until INTEGER
);
CREATE INDEX incidents_started ON incidents (started_at);

CREATE TABLE incident_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id TEXT NOT NULL,
  at INTEGER NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL
);
CREATE INDEX incident_updates_incident ON incident_updates (incident_id, at);
