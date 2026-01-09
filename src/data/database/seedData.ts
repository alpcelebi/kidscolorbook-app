import type { SQLiteDatabase } from 'expo-sqlite';

interface CategorySeed {
  id: string;
  nameKey: string;
  iconName: string;
  order: number;
}

interface PageSeed {
  id: string;
  categoryId: string;
  nameKey: string;
  svgPath: string;
}

// Only categories that have completed PNG images
const categories: CategorySeed[] = [
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

// Only pages that have completed PNG images (from generation_progress.txt COMPLETED section)
const pages: PageSeed[] = [
  // ============ ANIMALS (20 pages - ALL COMPLETED) ============
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

  // ============ VEHICLES (20 pages - ALL COMPLETED) ============
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

  // ============ NATURE (11 pages - COMPLETED) ============
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

  // ============ DINOSAURS (5 pages - COMPLETED) ============
  { id: 'page-trex', categoryId: 'cat-dinosaurs', nameKey: 'pages.trex', svgPath: 'dinosaurs/trex' },
  { id: 'page-stego', categoryId: 'cat-dinosaurs', nameKey: 'pages.stegosaurus', svgPath: 'dinosaurs/stego' },
  { id: 'page-bronto', categoryId: 'cat-dinosaurs', nameKey: 'pages.brontosaurus', svgPath: 'dinosaurs/bronto' },
  { id: 'page-ptero', categoryId: 'cat-dinosaurs', nameKey: 'pages.pterodactyl', svgPath: 'dinosaurs/ptero' },
  { id: 'page-tricera', categoryId: 'cat-dinosaurs', nameKey: 'pages.triceratops', svgPath: 'dinosaurs/tricera' },

  // ============ SEA (6 pages - COMPLETED) ============
  { id: 'page-fish', categoryId: 'cat-sea', nameKey: 'pages.fish', svgPath: 'sea/fish' },
  { id: 'page-whale', categoryId: 'cat-sea', nameKey: 'pages.whale', svgPath: 'sea/whale' },
  { id: 'page-octopus', categoryId: 'cat-sea', nameKey: 'pages.octopus', svgPath: 'sea/octopus' },
  { id: 'page-shark', categoryId: 'cat-sea', nameKey: 'pages.shark', svgPath: 'sea/shark' },
  { id: 'page-dolphin', categoryId: 'cat-sea', nameKey: 'pages.dolphin', svgPath: 'sea/dolphin' },
  { id: 'page-turtle', categoryId: 'cat-sea', nameKey: 'pages.turtle', svgPath: 'sea/turtle' },

  // ============ SHAPES (5 pages - COMPLETED) ============
  { id: 'page-star', categoryId: 'cat-shapes', nameKey: 'pages.star', svgPath: 'shapes/star' },
  { id: 'page-heart', categoryId: 'cat-shapes', nameKey: 'pages.heart', svgPath: 'shapes/heart' },
  { id: 'page-house', categoryId: 'cat-shapes', nameKey: 'pages.house', svgPath: 'shapes/house' },
  { id: 'page-castle', categoryId: 'cat-shapes', nameKey: 'pages.castle', svgPath: 'shapes/castle' },
  { id: 'page-balloon', categoryId: 'cat-shapes', nameKey: 'pages.balloon', svgPath: 'shapes/balloon' },

  // ============ FRUITS (5 pages - COMPLETED) ============
  { id: 'page-apple', categoryId: 'cat-fruits', nameKey: 'pages.apple', svgPath: 'fruits/apple' },
  { id: 'page-banana', categoryId: 'cat-fruits', nameKey: 'pages.banana', svgPath: 'fruits/banana' },
  { id: 'page-strawberry', categoryId: 'cat-fruits', nameKey: 'pages.strawberry', svgPath: 'fruits/strawberry' },
  { id: 'page-orange', categoryId: 'cat-fruits', nameKey: 'pages.orange', svgPath: 'fruits/orange' },
  { id: 'page-watermelon', categoryId: 'cat-fruits', nameKey: 'pages.watermelon', svgPath: 'fruits/watermelon' },

  // ============ FOOD (5 pages - COMPLETED) ============
  { id: 'page-icecream', categoryId: 'cat-food', nameKey: 'pages.icecream', svgPath: 'food/icecream' },
  { id: 'page-cake', categoryId: 'cat-food', nameKey: 'pages.cake', svgPath: 'food/cake' },
  { id: 'page-pizza', categoryId: 'cat-food', nameKey: 'pages.pizza', svgPath: 'food/pizza' },
  { id: 'page-burger', categoryId: 'cat-food', nameKey: 'pages.hamburger', svgPath: 'food/burger' },
  { id: 'page-donut', categoryId: 'cat-food', nameKey: 'pages.donut', svgPath: 'food/donut' },

  // ============ FANTASY (3 pages - COMPLETED) ============
  { id: 'page-dragon', categoryId: 'cat-fantasy', nameKey: 'pages.dragon', svgPath: 'fantasy/dragon' },
  { id: 'page-unicorn', categoryId: 'cat-fantasy', nameKey: 'pages.unicorn', svgPath: 'fantasy/unicorn' },
  { id: 'page-mermaid', categoryId: 'cat-fantasy', nameKey: 'pages.mermaid', svgPath: 'fantasy/mermaid' },

  // ============ SPACE (6 pages - COMPLETED) ============
  { id: 'page-sun-space', categoryId: 'cat-space', nameKey: 'pages.sun', svgPath: 'space/sun' },
  { id: 'page-moon', categoryId: 'cat-space', nameKey: 'pages.moon', svgPath: 'space/moon' },
  { id: 'page-planet', categoryId: 'cat-space', nameKey: 'pages.planet', svgPath: 'space/planet' },
  { id: 'page-astronaut', categoryId: 'cat-space', nameKey: 'pages.astronaut', svgPath: 'space/astronaut' },
  { id: 'page-alien', categoryId: 'cat-space', nameKey: 'pages.alien', svgPath: 'space/alien' },
  { id: 'page-satellite', categoryId: 'cat-space', nameKey: 'pages.satellite', svgPath: 'space/satellite' },
];

export async function seedInitialData(db: SQLiteDatabase): Promise<void> {
  const now = Date.now();

  // Insert categories
  for (const category of categories) {
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (id, name_key, icon_name, display_order, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [category.id, category.nameKey, category.iconName, category.order, now]
    );
  }

  // Insert pages
  for (const page of pages) {
    await db.runAsync(
      `INSERT OR IGNORE INTO pages (id, category_id, name_key, svg_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [page.id, page.categoryId, page.nameKey, page.svgPath, now, now]
    );
  }

  // Set default language setting
  await db.runAsync(
    `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    ['language', 'tr', now]
  );
}

export { categories as seedCategories, pages as seedPages };
