-- KidsColorBook SQLite Schema
-- Version 1.0

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name_key TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Pages table (bundled coloring pages)
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT NOT NULL,
  name_key TEXT NOT NULL,
  svg_path TEXT NOT NULL,
  thumbnail_path TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Page progress table (stores coloring progress for each page)
CREATE TABLE IF NOT EXISTS page_progress (
  id TEXT PRIMARY KEY NOT NULL,
  page_id TEXT NOT NULL UNIQUE,
  drawing_data TEXT NOT NULL,
  last_modified INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  completed INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

-- Favorites table (for pages)
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY NOT NULL,
  page_id TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

-- Artworks table (saved drawings - both coloring and free draw)
CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('coloring', 'freedraw')),
  name TEXT NOT NULL,
  page_id TEXT,
  drawing_data TEXT NOT NULL,
  thumbnail_path TEXT,
  image_path TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_category ON pages(category_id);
CREATE INDEX IF NOT EXISTS idx_page_progress_page ON page_progress(page_id);
CREATE INDEX IF NOT EXISTS idx_artworks_type ON artworks(type);
CREATE INDEX IF NOT EXISTS idx_artworks_created ON artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_page ON favorites(page_id);

