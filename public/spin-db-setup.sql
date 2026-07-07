-- ============================================================
-- Lucky Spin Wheel — Supabase Database Setup
-- Run this in your Supabase SQL editor (once only)
-- ============================================================

-- Users for the spin game (separate from newsletter subscribers)
CREATE TABLE IF NOT EXISTS spin_users (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        UNIQUE NOT NULL,
  password_hash    TEXT        NOT NULL,
  display_name     TEXT,
  total_points     INTEGER     NOT NULL DEFAULT 0,
  monthly_points   INTEGER     NOT NULL DEFAULT 0,
  last_spin_at     TIMESTAMPTZ,
  bonus_spin_available BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If the table already exists, add the monthly_points column:
ALTER TABLE spin_users ADD COLUMN IF NOT EXISTS monthly_points INTEGER NOT NULL DEFAULT 0;

-- Full history of every spin (for analytics / admin)
CREATE TABLE IF NOT EXISTS spin_history (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES spin_users(id) ON DELETE CASCADE,
  segment_label TEXT        NOT NULL,
  points_won    INTEGER     NOT NULL,
  is_bonus_spin BOOLEAN     NOT NULL DEFAULT FALSE,
  spun_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Monthly top-3 archive (populated automatically on the 1st of each month)
CREATE TABLE IF NOT EXISTS spin_leaderboard_archive (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  month         TEXT    NOT NULL,   -- "YYYY-MM"
  rank          INTEGER NOT NULL,   -- 1, 2 or 3
  user_id       UUID,
  email         TEXT    NOT NULL,
  display_name  TEXT,
  points        INTEGER NOT NULL,
  archived_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (month, rank)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_spin_users_email        ON spin_users(email);
CREATE INDEX IF NOT EXISTS idx_spin_users_points       ON spin_users(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_spin_history_user_id    ON spin_history(user_id);
CREATE INDEX IF NOT EXISTS idx_spin_history_spun_at    ON spin_history(spun_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_archive_month ON spin_leaderboard_archive(month);
