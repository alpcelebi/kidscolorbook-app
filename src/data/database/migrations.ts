import type { SQLiteDatabase } from 'expo-sqlite';

export interface Migration {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
  down?: (db: SQLiteDatabase) => Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: 1,
    up: async (db: SQLiteDatabase) => {
      // Categories table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY NOT NULL,
          name_key TEXT NOT NULL,
          icon_name TEXT NOT NULL,
          display_order INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);

      // Pages table
      await db.execAsync(`
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
      `);

      // Page progress table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS page_progress (
          id TEXT PRIMARY KEY NOT NULL,
          page_id TEXT NOT NULL UNIQUE,
          drawing_data TEXT NOT NULL,
          last_modified INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
          completed INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
        );
      `);

      // Favorites table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS favorites (
          id TEXT PRIMARY KEY NOT NULL,
          page_id TEXT NOT NULL UNIQUE,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
          FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
        );
      `);

      // Artworks table
      await db.execAsync(`
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
      `);

      // Settings table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);

      // Indexes
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_pages_category ON pages(category_id);
        CREATE INDEX IF NOT EXISTS idx_page_progress_page ON page_progress(page_id);
        CREATE INDEX IF NOT EXISTS idx_artworks_type ON artworks(type);
        CREATE INDEX IF NOT EXISTS idx_artworks_created ON artworks(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_favorites_page ON favorites(page_id);
      `);
    },
  },
  {
    version: 2,
    up: async (db: SQLiteDatabase) => {
      // Usage statistics table - tracks daily usage
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS usage_stats (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          total_time_seconds INTEGER NOT NULL DEFAULT 0,
          session_count INTEGER NOT NULL DEFAULT 0,
          pages_completed INTEGER NOT NULL DEFAULT 0,
          drawings_created INTEGER NOT NULL DEFAULT 0,
          colors_used TEXT DEFAULT '[]',
          stickers_used INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);

      // Session tracking table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY NOT NULL,
          start_time INTEGER NOT NULL,
          end_time INTEGER,
          duration_seconds INTEGER DEFAULT 0,
          date TEXT NOT NULL
        );
      `);

      // Achievements table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS achievements (
          id TEXT PRIMARY KEY NOT NULL,
          achievement_key TEXT NOT NULL UNIQUE,
          unlocked INTEGER NOT NULL DEFAULT 0,
          unlocked_at INTEGER,
          progress INTEGER NOT NULL DEFAULT 0,
          target INTEGER NOT NULL DEFAULT 1
        );
      `);

      // Stickers used table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS stickers_used (
          id TEXT PRIMARY KEY NOT NULL,
          artwork_id TEXT NOT NULL,
          sticker_id TEXT NOT NULL,
          x REAL NOT NULL,
          y REAL NOT NULL,
          scale REAL NOT NULL DEFAULT 1,
          rotation REAL NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
          FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
        );
      `);

      // Parental controls table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS parental_controls (
          id TEXT PRIMARY KEY NOT NULL,
          daily_limit_minutes INTEGER DEFAULT NULL,
          break_reminder_minutes INTEGER DEFAULT NULL,
          sleep_time_start TEXT DEFAULT NULL,
          sleep_time_end TEXT DEFAULT NULL,
          sounds_enabled INTEGER NOT NULL DEFAULT 1,
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);

      // Color usage tracking
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS color_usage (
          id TEXT PRIMARY KEY NOT NULL,
          color TEXT NOT NULL,
          usage_count INTEGER NOT NULL DEFAULT 1,
          last_used INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);

      // Insert default parental controls
      await db.runAsync(`
        INSERT OR IGNORE INTO parental_controls (id) VALUES ('default');
      `);

      // Create indexes
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON usage_stats(date);
        CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
        CREATE INDEX IF NOT EXISTS idx_achievements_key ON achievements(achievement_key);
        CREATE INDEX IF NOT EXISTS idx_color_usage_count ON color_usage(usage_count DESC);
      `);

      // Seed initial achievements
      const achievements = [
        { key: 'firstDrawing', target: 1 },
        { key: 'colorMaster', target: 10 },
        { key: 'dailyArtist', target: 7 },
        { key: 'pageComplete', target: 1 },
        { key: 'tenPages', target: 10 },
        { key: 'categoryMaster', target: 1 },
        { key: 'stickerFan', target: 50 },
        { key: 'creativeSoul', target: 20 },
      ];

      for (const achievement of achievements) {
        await db.runAsync(
          `INSERT OR IGNORE INTO achievements (id, achievement_key, target) VALUES (?, ?, ?)`,
          [`ach-${achievement.key}`, achievement.key, achievement.target]
        );
      }
    },
  },
  {
    version: 3,
    up: async (db: SQLiteDatabase) => {
      // Clear existing categories and pages to reseed with only PNG-available ones
      await db.execAsync('DELETE FROM pages;');
      await db.execAsync('DELETE FROM categories;');

      const now = Date.now();

      // Insert only categories that have completed PNG images
      const categories = [
        { id: 'cat-animals', nameKey: 'categories.animals', iconName: 'paw', order: 1 },
        { id: 'cat-vehicles', nameKey: 'categories.vehicles', iconName: 'car', order: 2 },
        { id: 'cat-nature', nameKey: 'categories.nature', iconName: 'tree', order: 3 },
        { id: 'cat-space', nameKey: 'categories.space', iconName: 'rocket', order: 4 },
      ];

      for (const cat of categories) {
        await db.runAsync(
          `INSERT INTO categories (id, name_key, icon_name, display_order, created_at) VALUES (?, ?, ?, ?, ?)`,
          [cat.id, cat.nameKey, cat.iconName, cat.order, now]
        );
      }

      // Insert only pages that have completed PNG images
      const pages = [
        // Animals (20)
        { id: 'page-cat', categoryId: 'cat-animals', nameKey: 'pages.cat', svgPath: 'animals/cat' },
        { id: 'page-dog', categoryId: 'cat-animals', nameKey: 'pages.dog', svgPath: 'animals/dog' },
        { id: 'page-elephant', categoryId: 'cat-animals', nameKey: 'pages.elephant', svgPath: 'animals/elephant' },
        { id: 'page-lion', categoryId: 'cat-animals', nameKey: 'pages.lion', svgPath: 'animals/lion' },
        { id: 'page-rabbit', categoryId: 'cat-animals', nameKey: 'pages.rabbit', svgPath: 'animals/rabbit' },
        { id: 'page-butterfly', categoryId: 'cat-animals', nameKey: 'pages.butterfly', svgPath: 'animals/butterfly' },
        { id: 'page-bird', categoryId: 'cat-animals', nameKey: 'pages.bird', svgPath: 'animals/bird' },
        { id: 'page-bear', categoryId: 'cat-animals', nameKey: 'pages.bear', svgPath: 'animals/bear' },
        { id: 'page-monkey', categoryId: 'cat-animals', nameKey: 'pages.monkey', svgPath: 'animals/monkey' },
        { id: 'page-giraffe', categoryId: 'cat-animals', nameKey: 'pages.giraffe', svgPath: 'animals/giraffe' },
        { id: 'page-zebra', categoryId: 'cat-animals', nameKey: 'pages.zebra', svgPath: 'animals/zebra' },
        { id: 'page-horse', categoryId: 'cat-animals', nameKey: 'pages.horse', svgPath: 'animals/horse' },
        { id: 'page-pig', categoryId: 'cat-animals', nameKey: 'pages.pig', svgPath: 'animals/pig' },
        { id: 'page-cow', categoryId: 'cat-animals', nameKey: 'pages.cow', svgPath: 'animals/cow' },
        { id: 'page-sheep', categoryId: 'cat-animals', nameKey: 'pages.sheep', svgPath: 'animals/sheep' },
        { id: 'page-duck', categoryId: 'cat-animals', nameKey: 'pages.duck', svgPath: 'animals/duck' },
        { id: 'page-fox', categoryId: 'cat-animals', nameKey: 'pages.fox', svgPath: 'animals/fox' },
        { id: 'page-owl', categoryId: 'cat-animals', nameKey: 'pages.owl', svgPath: 'animals/owl' },
        { id: 'page-penguin', categoryId: 'cat-animals', nameKey: 'pages.penguin', svgPath: 'animals/penguin' },
        { id: 'page-koala', categoryId: 'cat-animals', nameKey: 'pages.koala', svgPath: 'animals/koala' },
        // Vehicles (20)
        { id: 'page-car', categoryId: 'cat-vehicles', nameKey: 'pages.car', svgPath: 'vehicles/car' },
        { id: 'page-airplane', categoryId: 'cat-vehicles', nameKey: 'pages.airplane', svgPath: 'vehicles/airplane' },
        { id: 'page-boat', categoryId: 'cat-vehicles', nameKey: 'pages.boat', svgPath: 'vehicles/boat' },
        { id: 'page-rocket', categoryId: 'cat-vehicles', nameKey: 'pages.rocket', svgPath: 'vehicles/rocket' },
        { id: 'page-train', categoryId: 'cat-vehicles', nameKey: 'pages.train', svgPath: 'vehicles/train' },
        { id: 'page-helicopter', categoryId: 'cat-vehicles', nameKey: 'pages.helicopter', svgPath: 'vehicles/helicopter' },
        { id: 'page-bus', categoryId: 'cat-vehicles', nameKey: 'pages.bus', svgPath: 'vehicles/bus' },
        { id: 'page-truck', categoryId: 'cat-vehicles', nameKey: 'pages.truck', svgPath: 'vehicles/truck' },
        { id: 'page-bicycle', categoryId: 'cat-vehicles', nameKey: 'pages.bicycle', svgPath: 'vehicles/bicycle' },
        { id: 'page-motorcycle', categoryId: 'cat-vehicles', nameKey: 'pages.motorcycle', svgPath: 'vehicles/motorcycle' },
        { id: 'page-tractor', categoryId: 'cat-vehicles', nameKey: 'pages.tractor', svgPath: 'vehicles/tractor' },
        { id: 'page-submarine', categoryId: 'cat-vehicles', nameKey: 'pages.submarine', svgPath: 'vehicles/submarine' },
        { id: 'page-hotairballoon', categoryId: 'cat-vehicles', nameKey: 'pages.hotairballoon', svgPath: 'vehicles/hotairballoon' },
        { id: 'page-firetruck', categoryId: 'cat-vehicles', nameKey: 'pages.firetruck', svgPath: 'vehicles/firetruck' },
        { id: 'page-ambulance', categoryId: 'cat-vehicles', nameKey: 'pages.ambulance', svgPath: 'vehicles/ambulance' },
        { id: 'page-policecar', categoryId: 'cat-vehicles', nameKey: 'pages.policecar', svgPath: 'vehicles/policecar' },
        { id: 'page-sailboat', categoryId: 'cat-vehicles', nameKey: 'pages.sailboat', svgPath: 'vehicles/sailboat' },
        { id: 'page-scooter', categoryId: 'cat-vehicles', nameKey: 'pages.scooter', svgPath: 'vehicles/scooter' },
        { id: 'page-excavator', categoryId: 'cat-vehicles', nameKey: 'pages.excavator', svgPath: 'vehicles/excavator' },
        { id: 'page-spaceship', categoryId: 'cat-vehicles', nameKey: 'pages.spaceship', svgPath: 'vehicles/spaceship' },
        // Nature (8)
        { id: 'page-sun', categoryId: 'cat-nature', nameKey: 'pages.sun', svgPath: 'nature/sun' },
        { id: 'page-tree', categoryId: 'cat-nature', nameKey: 'pages.tree', svgPath: 'nature/tree' },
        { id: 'page-flower', categoryId: 'cat-nature', nameKey: 'pages.flower', svgPath: 'nature/flower' },
        { id: 'page-rainbow', categoryId: 'cat-nature', nameKey: 'pages.rainbow', svgPath: 'nature/rainbow' },
        { id: 'page-cloud', categoryId: 'cat-nature', nameKey: 'pages.cloud', svgPath: 'nature/cloud' },
        { id: 'page-mountain', categoryId: 'cat-nature', nameKey: 'pages.mountain', svgPath: 'nature/mountain' },
        { id: 'page-mushroom', categoryId: 'cat-nature', nameKey: 'pages.mushroom', svgPath: 'nature/mushroom' },
        { id: 'page-leaf', categoryId: 'cat-nature', nameKey: 'pages.leaf', svgPath: 'nature/leaf' },
        // Space (1)
        { id: 'page-sun2', categoryId: 'cat-space', nameKey: 'pages.sun', svgPath: 'space/sun' },
      ];

      for (const page of pages) {
        await db.runAsync(
          `INSERT INTO pages (id, category_id, name_key, svg_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [page.id, page.categoryId, page.nameKey, page.svgPath, now, now]
        );
      }
    },
  },
  {
    version: 4,
    up: async (db: SQLiteDatabase) => {
      // Clear existing categories and pages to reseed with all PNG-available ones
      await db.execAsync('DELETE FROM pages;');
      await db.execAsync('DELETE FROM categories;');

      const now = Date.now();

      const categories = [
        { id: 'cat-animals', nameKey: 'categories.animals', iconName: 'paw', order: 1 },
        { id: 'cat-vehicles', nameKey: 'categories.vehicles', iconName: 'car', order: 2 },
        { id: 'cat-nature', nameKey: 'categories.nature', iconName: 'tree', order: 3 },
        { id: 'cat-dinosaurs', nameKey: 'categories.dinosaurs', iconName: 'dinosaur', order: 4 },
        { id: 'cat-sea', nameKey: 'categories.sea', iconName: 'sea', order: 5 },
        { id: 'cat-shapes', nameKey: 'categories.shapes', iconName: 'shapes', order: 6 },
        { id: 'cat-fruits', nameKey: 'categories.fruits', iconName: 'fruits', order: 7 },
        { id: 'cat-food', nameKey: 'categories.food', iconName: 'food', order: 8 },
        { id: 'cat-fantasy', nameKey: 'categories.fantasy', iconName: 'fantasy', order: 9 },
        { id: 'cat-space', nameKey: 'categories.space', iconName: 'rocket', order: 10 },
      ];

      for (const cat of categories) {
        await db.runAsync(
          `INSERT INTO categories (id, name_key, icon_name, display_order, created_at) VALUES (?, ?, ?, ?, ?)`,
          [cat.id, cat.nameKey, cat.iconName, cat.order, now]
        );
      }

      const pages = [
        // Animals (20)
        { id: 'page-cat', categoryId: 'cat-animals', nameKey: 'pages.cat', svgPath: 'animals/cat' },
        { id: 'page-dog', categoryId: 'cat-animals', nameKey: 'pages.dog', svgPath: 'animals/dog' },
        { id: 'page-elephant', categoryId: 'cat-animals', nameKey: 'pages.elephant', svgPath: 'animals/elephant' },
        { id: 'page-lion', categoryId: 'cat-animals', nameKey: 'pages.lion', svgPath: 'animals/lion' },
        { id: 'page-rabbit', categoryId: 'cat-animals', nameKey: 'pages.rabbit', svgPath: 'animals/rabbit' },
        { id: 'page-butterfly', categoryId: 'cat-animals', nameKey: 'pages.butterfly', svgPath: 'animals/butterfly' },
        { id: 'page-bird', categoryId: 'cat-animals', nameKey: 'pages.bird', svgPath: 'animals/bird' },
        { id: 'page-bear', categoryId: 'cat-animals', nameKey: 'pages.bear', svgPath: 'animals/bear' },
        { id: 'page-monkey', categoryId: 'cat-animals', nameKey: 'pages.monkey', svgPath: 'animals/monkey' },
        { id: 'page-giraffe', categoryId: 'cat-animals', nameKey: 'pages.giraffe', svgPath: 'animals/giraffe' },
        { id: 'page-zebra', categoryId: 'cat-animals', nameKey: 'pages.zebra', svgPath: 'animals/zebra' },
        { id: 'page-horse', categoryId: 'cat-animals', nameKey: 'pages.horse', svgPath: 'animals/horse' },
        { id: 'page-pig', categoryId: 'cat-animals', nameKey: 'pages.pig', svgPath: 'animals/pig' },
        { id: 'page-cow', categoryId: 'cat-animals', nameKey: 'pages.cow', svgPath: 'animals/cow' },
        { id: 'page-sheep', categoryId: 'cat-animals', nameKey: 'pages.sheep', svgPath: 'animals/sheep' },
        { id: 'page-duck', categoryId: 'cat-animals', nameKey: 'pages.duck', svgPath: 'animals/duck' },
        { id: 'page-fox', categoryId: 'cat-animals', nameKey: 'pages.fox', svgPath: 'animals/fox' },
        { id: 'page-owl', categoryId: 'cat-animals', nameKey: 'pages.owl', svgPath: 'animals/owl' },
        { id: 'page-penguin', categoryId: 'cat-animals', nameKey: 'pages.penguin', svgPath: 'animals/penguin' },
        { id: 'page-koala', categoryId: 'cat-animals', nameKey: 'pages.koala', svgPath: 'animals/koala' },
        // Vehicles (20)
        { id: 'page-car', categoryId: 'cat-vehicles', nameKey: 'pages.car', svgPath: 'vehicles/car' },
        { id: 'page-airplane', categoryId: 'cat-vehicles', nameKey: 'pages.airplane', svgPath: 'vehicles/airplane' },
        { id: 'page-boat', categoryId: 'cat-vehicles', nameKey: 'pages.boat', svgPath: 'vehicles/boat' },
        { id: 'page-rocket', categoryId: 'cat-vehicles', nameKey: 'pages.rocket', svgPath: 'vehicles/rocket' },
        { id: 'page-train', categoryId: 'cat-vehicles', nameKey: 'pages.train', svgPath: 'vehicles/train' },
        { id: 'page-helicopter', categoryId: 'cat-vehicles', nameKey: 'pages.helicopter', svgPath: 'vehicles/helicopter' },
        { id: 'page-bus', categoryId: 'cat-vehicles', nameKey: 'pages.bus', svgPath: 'vehicles/bus' },
        { id: 'page-truck', categoryId: 'cat-vehicles', nameKey: 'pages.truck', svgPath: 'vehicles/truck' },
        { id: 'page-bicycle', categoryId: 'cat-vehicles', nameKey: 'pages.bicycle', svgPath: 'vehicles/bicycle' },
        { id: 'page-motorcycle', categoryId: 'cat-vehicles', nameKey: 'pages.motorcycle', svgPath: 'vehicles/motorcycle' },
        { id: 'page-tractor', categoryId: 'cat-vehicles', nameKey: 'pages.tractor', svgPath: 'vehicles/tractor' },
        { id: 'page-submarine', categoryId: 'cat-vehicles', nameKey: 'pages.submarine', svgPath: 'vehicles/submarine' },
        { id: 'page-hotairballoon', categoryId: 'cat-vehicles', nameKey: 'pages.hotairballoon', svgPath: 'vehicles/hotairballoon' },
        { id: 'page-firetruck', categoryId: 'cat-vehicles', nameKey: 'pages.firetruck', svgPath: 'vehicles/firetruck' },
        { id: 'page-ambulance', categoryId: 'cat-vehicles', nameKey: 'pages.ambulance', svgPath: 'vehicles/ambulance' },
        { id: 'page-policecar', categoryId: 'cat-vehicles', nameKey: 'pages.policecar', svgPath: 'vehicles/policecar' },
        { id: 'page-sailboat', categoryId: 'cat-vehicles', nameKey: 'pages.sailboat', svgPath: 'vehicles/sailboat' },
        { id: 'page-scooter', categoryId: 'cat-vehicles', nameKey: 'pages.scooter', svgPath: 'vehicles/scooter' },
        { id: 'page-excavator', categoryId: 'cat-vehicles', nameKey: 'pages.excavator', svgPath: 'vehicles/excavator' },
        { id: 'page-spaceship', categoryId: 'cat-vehicles', nameKey: 'pages.spaceship', svgPath: 'vehicles/spaceship' },
        // Nature (11)
        { id: 'page-sun', categoryId: 'cat-nature', nameKey: 'pages.sun', svgPath: 'nature/sun' },
        { id: 'page-tree', categoryId: 'cat-nature', nameKey: 'pages.tree', svgPath: 'nature/tree' },
        { id: 'page-flower', categoryId: 'cat-nature', nameKey: 'pages.flower', svgPath: 'nature/flower' },
        { id: 'page-rainbow', categoryId: 'cat-nature', nameKey: 'pages.rainbow', svgPath: 'nature/rainbow' },
        { id: 'page-cloud', categoryId: 'cat-nature', nameKey: 'pages.cloud', svgPath: 'nature/cloud' },
        { id: 'page-mountain', categoryId: 'cat-nature', nameKey: 'pages.mountain', svgPath: 'nature/mountain' },
        { id: 'page-mushroom', categoryId: 'cat-nature', nameKey: 'pages.mushroom', svgPath: 'nature/mushroom' },
        { id: 'page-leaf', categoryId: 'cat-nature', nameKey: 'pages.leaf', svgPath: 'nature/leaf' },
        { id: 'page-rose', categoryId: 'cat-nature', nameKey: 'pages.rose', svgPath: 'nature/rose' },
        { id: 'page-tulip', categoryId: 'cat-nature', nameKey: 'pages.tulip', svgPath: 'nature/tulip' },
        { id: 'page-sunflower', categoryId: 'cat-nature', nameKey: 'pages.sunflower', svgPath: 'nature/sunflower' },
        // Dinosaurs (5)
        { id: 'page-trex', categoryId: 'cat-dinosaurs', nameKey: 'pages.trex', svgPath: 'dinosaurs/trex' },
        { id: 'page-stego', categoryId: 'cat-dinosaurs', nameKey: 'pages.stegosaurus', svgPath: 'dinosaurs/stego' },
        { id: 'page-bronto', categoryId: 'cat-dinosaurs', nameKey: 'pages.brontosaurus', svgPath: 'dinosaurs/bronto' },
        { id: 'page-ptero', categoryId: 'cat-dinosaurs', nameKey: 'pages.pterodactyl', svgPath: 'dinosaurs/ptero' },
        { id: 'page-tricera', categoryId: 'cat-dinosaurs', nameKey: 'pages.triceratops', svgPath: 'dinosaurs/tricera' },
        // Sea (6)
        { id: 'page-fish', categoryId: 'cat-sea', nameKey: 'pages.fish', svgPath: 'sea/fish' },
        { id: 'page-whale', categoryId: 'cat-sea', nameKey: 'pages.whale', svgPath: 'sea/whale' },
        { id: 'page-octopus', categoryId: 'cat-sea', nameKey: 'pages.octopus', svgPath: 'sea/octopus' },
        { id: 'page-shark', categoryId: 'cat-sea', nameKey: 'pages.shark', svgPath: 'sea/shark' },
        { id: 'page-dolphin', categoryId: 'cat-sea', nameKey: 'pages.dolphin', svgPath: 'sea/dolphin' },
        { id: 'page-turtle', categoryId: 'cat-sea', nameKey: 'pages.turtle', svgPath: 'sea/turtle' },
        // Shapes (5)
        { id: 'page-star', categoryId: 'cat-shapes', nameKey: 'pages.star', svgPath: 'shapes/star' },
        { id: 'page-heart', categoryId: 'cat-shapes', nameKey: 'pages.heart', svgPath: 'shapes/heart' },
        { id: 'page-house', categoryId: 'cat-shapes', nameKey: 'pages.house', svgPath: 'shapes/house' },
        { id: 'page-castle', categoryId: 'cat-shapes', nameKey: 'pages.castle', svgPath: 'shapes/castle' },
        { id: 'page-balloon', categoryId: 'cat-shapes', nameKey: 'pages.balloon', svgPath: 'shapes/balloon' },
        // Fruits (5)
        { id: 'page-apple', categoryId: 'cat-fruits', nameKey: 'pages.apple', svgPath: 'fruits/apple' },
        { id: 'page-banana', categoryId: 'cat-fruits', nameKey: 'pages.banana', svgPath: 'fruits/banana' },
        { id: 'page-strawberry', categoryId: 'cat-fruits', nameKey: 'pages.strawberry', svgPath: 'fruits/strawberry' },
        { id: 'page-orange', categoryId: 'cat-fruits', nameKey: 'pages.orange', svgPath: 'fruits/orange' },
        { id: 'page-watermelon', categoryId: 'cat-fruits', nameKey: 'pages.watermelon', svgPath: 'fruits/watermelon' },
        // Food (5)
        { id: 'page-icecream', categoryId: 'cat-food', nameKey: 'pages.icecream', svgPath: 'food/icecream' },
        { id: 'page-cake', categoryId: 'cat-food', nameKey: 'pages.cake', svgPath: 'food/cake' },
        { id: 'page-pizza', categoryId: 'cat-food', nameKey: 'pages.pizza', svgPath: 'food/pizza' },
        { id: 'page-burger', categoryId: 'cat-food', nameKey: 'pages.hamburger', svgPath: 'food/burger' },
        { id: 'page-donut', categoryId: 'cat-food', nameKey: 'pages.donut', svgPath: 'food/donut' },
        // Fantasy (3)
        { id: 'page-dragon', categoryId: 'cat-fantasy', nameKey: 'pages.dragon', svgPath: 'fantasy/dragon' },
        { id: 'page-unicorn', categoryId: 'cat-fantasy', nameKey: 'pages.unicorn', svgPath: 'fantasy/unicorn' },
        { id: 'page-mermaid', categoryId: 'cat-fantasy', nameKey: 'pages.mermaid', svgPath: 'fantasy/mermaid' },
        // Space (6)
        { id: 'page-sun-space', categoryId: 'cat-space', nameKey: 'pages.sun', svgPath: 'space/sun' },
        { id: 'page-moon', categoryId: 'cat-space', nameKey: 'pages.moon', svgPath: 'space/moon' },
        { id: 'page-planet', categoryId: 'cat-space', nameKey: 'pages.planet', svgPath: 'space/planet' },
        { id: 'page-astronaut', categoryId: 'cat-space', nameKey: 'pages.astronaut', svgPath: 'space/astronaut' },
        { id: 'page-alien', categoryId: 'cat-space', nameKey: 'pages.alien', svgPath: 'space/alien' },
        { id: 'page-satellite', categoryId: 'cat-space', nameKey: 'pages.satellite', svgPath: 'space/satellite' },
      ];

      for (const page of pages) {
        await db.runAsync(
          `INSERT INTO pages (id, category_id, name_key, svg_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [page.id, page.categoryId, page.nameKey, page.svgPath, now, now]
        );
      }
    },
  },
];

export const CURRENT_DB_VERSION = 4;

