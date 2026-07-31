-- PostgreSQL Schema for Antiquitäten-Scannerkasse
-- Erstellt die Tabellen: items, price_snapshots, offers, scans

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  epoch VARCHAR(100),
  material VARCHAR(100),
  origin VARCHAR(100),
  image_hash VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS price_snapshots (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  ts TIMESTAMP NOT NULL DEFAULT NOW(),
  price_min NUMERIC(10, 2),
  price_max NUMERIC(10, 2),
  price_median NUMERIC(10, 2),
  platform_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  snapshot_id INTEGER REFERENCES price_snapshots(id) ON DELETE CASCADE,
  platform VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  condition VARCHAR(100),
  url TEXT
);

CREATE TABLE IF NOT EXISTS scans (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) DEFAULT 'guest_user',
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  snapshot_id INTEGER REFERENCES price_snapshots(id) ON DELETE CASCADE,
  ts TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- Indizes für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_ts ON scans(ts DESC);
CREATE INDEX IF NOT EXISTS idx_offers_snapshot_id ON offers(snapshot_id);
