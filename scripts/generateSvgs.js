/**
 * SVG Generator Script for KidsColorBook
 * 
 * This script generates simple line-art SVG files for coloring pages.
 * Run with: node scripts/generateSvgs.js
 */

const fs = require('fs');
const path = require('path');

const BASE_PATH = path.join(__dirname, '..', 'assets', 'coloring-pages');

// SVG template helper
const createSVG = (content) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
${content}
</svg>`;

// Simple shape generators
const shapes = {
  circle: (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`,
  ellipse: (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`,
  rect: (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`,
  line: (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`,
  path: (d) => `<path d="${d}"/>`,
};

// All SVG definitions
const svgDefinitions = {
  // ========== ANIMALS ==========
  'animals/bird': createSVG(`
  <ellipse cx="200" cy="200" rx="60" ry="50"/>
  <circle cx="200" cy="140" r="35"/>
  <circle cx="185" cy="135" r="8"/>
  <circle cx="187" cy="133" r="3" fill="#000"/>
  <path d="M215 145 L240 140 L220 150"/>
  <path d="M140 200 Q100 180 80 200 Q100 220 140 200"/>
  <path d="M260 200 Q300 180 320 200 Q300 220 260 200"/>
  <path d="M180 250 L180 300 M180 300 L160 320 M180 300 L200 320"/>
  <path d="M220 250 L220 300 M220 300 L200 320 M220 300 L240 320"/>
  <path d="M170 180 Q200 160 230 180"/>
`),
  'animals/bear': createSVG(`
  <circle cx="140" cy="100" r="30"/>
  <circle cx="260" cy="100" r="30"/>
  <circle cx="200" cy="170" r="80"/>
  <circle cx="170" cy="150" r="15"/>
  <circle cx="230" cy="150" r="15"/>
  <ellipse cx="200" cy="190" rx="20" ry="15"/>
  <path d="M185 210 Q200 230 215 210"/>
  <ellipse cx="200" cy="310" rx="80" ry="60"/>
  <ellipse cx="140" cy="370" rx="25" ry="20"/>
  <ellipse cx="260" cy="370" rx="25" ry="20"/>
`),
  'animals/monkey': createSVG(`
  <circle cx="200" cy="150" r="70"/>
  <circle cx="120" cy="150" r="30"/>
  <circle cx="280" cy="150" r="30"/>
  <ellipse cx="200" cy="180" rx="40" ry="35"/>
  <circle cx="175" cy="140" r="12"/>
  <circle cx="225" cy="140" r="12"/>
  <ellipse cx="200" cy="180" rx="15" ry="12"/>
  <path d="M185 200 Q200 215 215 200"/>
  <ellipse cx="200" cy="300" rx="60" ry="70"/>
  <path d="M140 280 Q100 260 80 300"/>
  <path d="M260 280 Q300 260 320 300"/>
  <path d="M200 370 Q200 400 180 420"/>
`),
  'animals/giraffe': createSVG(`
  <ellipse cx="200" cy="320" rx="70" ry="50"/>
  <path d="M200 270 L200 100"/>
  <circle cx="200" cy="80" r="40"/>
  <circle cx="180" cy="70" r="8"/>
  <circle cx="220" cy="70" r="8"/>
  <path d="M185 95 Q200 105 215 95"/>
  <line x1="175" y1="40" x2="165" y2="20"/>
  <line x1="225" y1="40" x2="235" y2="20"/>
  <circle cx="165" cy="15" r="8"/>
  <circle cx="235" cy="15" r="8"/>
  <ellipse cx="130" cy="370" rx="15" ry="30"/>
  <ellipse cx="270" cy="370" rx="15" ry="30"/>
  <circle cx="180" cy="200" r="10"/>
  <circle cx="220" cy="180" r="8"/>
  <circle cx="190" cy="240" r="9"/>
`),
  'animals/zebra': createSVG(`
  <ellipse cx="200" cy="280" rx="90" ry="60"/>
  <path d="M280 260 Q320 200 300 150"/>
  <ellipse cx="300" cy="130" rx="35" ry="45"/>
  <circle cx="315" cy="120" r="8"/>
  <line x1="280" y1="90" x2="270" y2="70"/>
  <line x1="320" y1="90" x2="330" y2="70"/>
  <ellipse cx="140" cy="340" rx="20" ry="40"/>
  <ellipse cx="180" cy="340" rx="20" ry="40"/>
  <ellipse cx="220" cy="340" rx="20" ry="40"/>
  <ellipse cx="260" cy="340" rx="20" ry="40"/>
  <line x1="150" y1="260" x2="140" y2="300"/>
  <line x1="200" y1="250" x2="200" y2="290"/>
  <line x1="250" y1="260" x2="260" y2="300"/>
  <path d="M110 280 Q70 300 80 340"/>
`),
  'animals/horse': createSVG(`
  <ellipse cx="200" cy="280" rx="100" ry="60"/>
  <path d="M280 250 Q330 180 300 120"/>
  <ellipse cx="290" cy="100" rx="40" ry="50"/>
  <circle cx="310" cy="85" r="10"/>
  <line x1="260" y1="60" x2="250" y2="30"/>
  <line x1="310" y1="60" x2="320" y2="30"/>
  <ellipse cx="130" cy="340" rx="20" ry="50"/>
  <ellipse cx="180" cy="340" rx="20" ry="50"/>
  <ellipse cx="230" cy="340" rx="20" ry="50"/>
  <ellipse cx="270" cy="340" rx="20" ry="50"/>
  <path d="M100 280 Q60 300 70 350"/>
  <path d="M250 80 Q220 60 200 80 Q180 100 200 120"/>
`),
  'animals/pig': createSVG(`
  <ellipse cx="200" cy="220" rx="100" ry="80"/>
  <circle cx="200" cy="130" r="60"/>
  <ellipse cx="200" cy="150" rx="35" ry="25"/>
  <circle cx="185" cy="145" r="5"/>
  <circle cx="215" cy="145" r="5"/>
  <circle cx="175" cy="115" r="12"/>
  <circle cx="225" cy="115" r="12"/>
  <ellipse cx="145" cy="80" rx="15" ry="25"/>
  <ellipse cx="255" cy="80" rx="15" ry="25"/>
  <path d="M180 175 Q200 185 220 175"/>
  <ellipse cx="130" cy="300" rx="20" ry="25"/>
  <ellipse cx="170" cy="300" rx="20" ry="25"/>
  <ellipse cx="230" cy="300" rx="20" ry="25"/>
  <ellipse cx="270" cy="300" rx="20" ry="25"/>
  <path d="M300 220 Q340 220 350 200"/>
`),
  'animals/cow': createSVG(`
  <ellipse cx="200" cy="260" rx="110" ry="70"/>
  <circle cx="200" cy="150" r="60"/>
  <ellipse cx="200" cy="180" rx="40" ry="30"/>
  <circle cx="185" cy="175" r="5"/>
  <circle cx="215" cy="175" r="5"/>
  <circle cx="170" cy="130" r="15"/>
  <circle cx="230" cy="130" r="15"/>
  <path d="M140 100 Q130 70 150 60"/>
  <path d="M260 100 Q270 70 250 60"/>
  <path d="M185 200 Q200 215 215 200"/>
  <ellipse cx="130" cy="330" rx="20" ry="40"/>
  <ellipse cx="270" cy="330" rx="20" ry="40"/>
  <ellipse cx="170" cy="330" rx="20" ry="40"/>
  <ellipse cx="230" cy="330" rx="20" ry="40"/>
  <circle cx="160" cy="250" r="20"/>
  <circle cx="240" cy="270" r="15"/>
`),
  'animals/sheep': createSVG(`
  <circle cx="150" cy="200" r="40"/>
  <circle cx="250" cy="200" r="40"/>
  <circle cx="200" cy="160" r="50"/>
  <circle cx="200" cy="220" r="45"/>
  <circle cx="170" cy="250" r="35"/>
  <circle cx="230" cy="250" r="35"/>
  <circle cx="200" cy="100" r="45"/>
  <circle cx="175" cy="95" r="10"/>
  <circle cx="225" cy="95" r="10"/>
  <ellipse cx="200" cy="115" rx="15" ry="10"/>
  <path d="M190 130 Q200 140 210 130"/>
  <ellipse cx="155" cy="300" rx="15" ry="30"/>
  <ellipse cx="195" cy="300" rx="15" ry="30"/>
  <ellipse cx="205" cy="300" rx="15" ry="30"/>
  <ellipse cx="245" cy="300" rx="15" ry="30"/>
`),
  'animals/duck': createSVG(`
  <ellipse cx="200" cy="250" rx="80" ry="60"/>
  <circle cx="200" cy="150" r="50"/>
  <path d="M250 150 L300 140 L300 160 L250 155"/>
  <circle cx="215" cy="135" r="10"/>
  <circle cx="218" cy="133" r="4" fill="#000"/>
  <path d="M175 180 Q200 200 225 180"/>
  <ellipse cx="140" cy="280" rx="30" ry="20"/>
  <ellipse cx="260" cy="280" rx="30" ry="20"/>
  <path d="M120 280 L100 300 L80 280 L100 280"/>
  <path d="M280 280 L300 300 L320 280 L300 280"/>
  <path d="M150 220 Q130 200 140 180"/>
  <path d="M250 220 Q270 200 260 180"/>
`),
  'animals/fox': createSVG(`
  <ellipse cx="200" cy="280" rx="80" ry="60"/>
  <circle cx="200" cy="180" r="60"/>
  <path d="M140 180 L100 100 L160 150"/>
  <path d="M260 180 L300 100 L240 150"/>
  <ellipse cx="200" cy="200" rx="30" ry="25"/>
  <circle cx="175" cy="170" r="12"/>
  <circle cx="225" cy="170" r="12"/>
  <circle cx="200" cy="195" r="10"/>
  <path d="M185 215 Q200 225 215 215"/>
  <ellipse cx="140" cy="340" rx="20" ry="30"/>
  <ellipse cx="260" cy="340" rx="20" ry="30"/>
  <path d="M280 280 Q340 300 360 260 Q350 290 320 280"/>
`),
  'animals/owl': createSVG(`
  <ellipse cx="200" cy="230" rx="80" ry="100"/>
  <circle cx="160" cy="180" r="35"/>
  <circle cx="240" cy="180" r="35"/>
  <circle cx="160" cy="180" r="20"/>
  <circle cx="240" cy="180" r="20"/>
  <circle cx="160" cy="180" r="8" fill="#000"/>
  <circle cx="240" cy="180" r="8" fill="#000"/>
  <path d="M185 200 L200 230 L215 200"/>
  <path d="M120 130 L160 170 L200 130 L240 170 L280 130"/>
  <path d="M140 250 Q200 300 260 250"/>
  <ellipse cx="160" cy="330" rx="20" ry="25"/>
  <ellipse cx="240" cy="330" rx="20" ry="25"/>
  <path d="M140 330 L120 350 L140 340 L120 360"/>
  <path d="M260 330 L280 350 L260 340 L280 360"/>
`),
  'animals/penguin': createSVG(`
  <ellipse cx="200" cy="250" rx="70" ry="100"/>
  <ellipse cx="200" cy="260" rx="45" ry="70"/>
  <circle cx="200" cy="130" r="50"/>
  <circle cx="180" cy="120" r="10"/>
  <circle cx="220" cy="120" r="10"/>
  <circle cx="182" cy="118" r="4" fill="#000"/>
  <circle cx="222" cy="118" r="4" fill="#000"/>
  <path d="M185 150 L200 170 L215 150"/>
  <path d="M130 200 Q90 250 110 300"/>
  <path d="M270 200 Q310 250 290 300"/>
  <ellipse cx="170" cy="350" rx="25" ry="15"/>
  <ellipse cx="230" cy="350" rx="25" ry="15"/>
`),
  'animals/koala': createSVG(`
  <circle cx="130" cy="130" r="40"/>
  <circle cx="270" cy="130" r="40"/>
  <circle cx="200" cy="180" r="80"/>
  <ellipse cx="200" cy="210" rx="40" ry="35"/>
  <circle cx="170" cy="160" r="15"/>
  <circle cx="230" cy="160" r="15"/>
  <circle cx="172" cy="158" r="6" fill="#000"/>
  <circle cx="232" cy="158" r="6" fill="#000"/>
  <ellipse cx="200" cy="200" rx="25" ry="18"/>
  <path d="M185 230 Q200 245 215 230"/>
  <ellipse cx="200" cy="320" rx="60" ry="50"/>
  <ellipse cx="150" cy="370" rx="25" ry="20"/>
  <ellipse cx="250" cy="370" rx="25" ry="20"/>
`),

  // ========== VEHICLES ==========
  'vehicles/bus': createSVG(`
  <rect x="60" y="150" width="280" height="150" rx="20"/>
  <rect x="80" y="170" width="60" height="50"/>
  <rect x="160" y="170" width="60" height="50"/>
  <rect x="240" y="170" width="80" height="50"/>
  <rect x="280" y="240" width="40" height="40"/>
  <circle cx="120" cy="320" r="30"/>
  <circle cx="280" cy="320" r="30"/>
  <circle cx="120" cy="320" r="15"/>
  <circle cx="280" cy="320" r="15"/>
  <line x1="60" y1="240" x2="340" y2="240"/>
  <rect x="310" y="180" width="20" height="30"/>
`),
  'vehicles/truck': createSVG(`
  <rect x="40" y="180" width="200" height="120" rx="10"/>
  <rect x="240" y="220" width="120" height="80" rx="5"/>
  <rect x="260" y="240" width="40" height="30"/>
  <rect x="310" y="240" width="40" height="30"/>
  <circle cx="100" cy="320" r="30"/>
  <circle cx="180" cy="320" r="30"/>
  <circle cx="300" cy="320" r="30"/>
  <circle cx="100" cy="320" r="15"/>
  <circle cx="180" cy="320" r="15"/>
  <circle cx="300" cy="320" r="15"/>
  <line x1="240" y1="180" x2="240" y2="300"/>
`),
  'vehicles/bicycle': createSVG(`
  <circle cx="100" cy="280" r="60"/>
  <circle cx="300" cy="280" r="60"/>
  <circle cx="100" cy="280" r="10"/>
  <circle cx="300" cy="280" r="10"/>
  <line x1="100" y1="280" x2="200" y2="200"/>
  <line x1="200" y1="200" x2="300" y2="280"/>
  <line x1="200" y1="200" x2="200" y2="120"/>
  <line x1="170" y1="120" x2="230" y2="120"/>
  <line x1="200" y1="200" x2="250" y2="200"/>
  <circle cx="250" cy="200" r="15"/>
  <line x1="250" y1="200" x2="220" y2="160"/>
  <line x1="220" y1="160" x2="250" y2="160"/>
`),
  'vehicles/motorcycle': createSVG(`
  <circle cx="100" cy="280" r="50"/>
  <circle cx="300" cy="280" r="50"/>
  <circle cx="100" cy="280" r="20"/>
  <circle cx="300" cy="280" r="20"/>
  <path d="M100 280 Q150 200 200 200 Q250 200 300 280"/>
  <path d="M200 200 L200 150 L250 130"/>
  <ellipse cx="250" cy="130" rx="30" ry="20"/>
  <path d="M180 200 L150 180 L170 160"/>
  <rect x="150" y="195" width="100" height="30" rx="10"/>
`),
  'vehicles/tractor': createSVG(`
  <rect x="100" y="180" width="180" height="100" rx="10"/>
  <rect x="120" y="200" width="60" height="40"/>
  <circle cx="150" cy="300" r="50"/>
  <circle cx="270" cy="300" r="35"/>
  <circle cx="150" cy="300" r="25"/>
  <circle cx="270" cy="300" r="18"/>
  <rect x="250" y="160" width="40" height="20"/>
  <path d="M100 230 L60 230 L60 280 L100 280"/>
  <line x1="150" y1="250" x2="150" y2="350"/>
  <line x1="100" y1="300" x2="200" y2="300"/>
`),
  'vehicles/submarine': createSVG(`
  <ellipse cx="200" cy="220" rx="150" ry="60"/>
  <rect x="160" y="140" width="80" height="80" rx="10"/>
  <circle cx="200" cy="170" r="20"/>
  <rect x="180" y="100" width="40" height="40"/>
  <line x1="200" y1="60" x2="200" y2="100"/>
  <path d="M50 220 Q30 200 50 180"/>
  <circle cx="100" cy="220" r="10"/>
  <circle cx="150" cy="220" r="10"/>
  <circle cx="250" cy="220" r="10"/>
  <circle cx="300" cy="220" r="10"/>
  <path d="M350 220 L380 200 M350 220 L380 220 M350 220 L380 240"/>
`),
  'vehicles/hotairballoon': createSVG(`
  <ellipse cx="200" cy="150" rx="100" ry="120"/>
  <path d="M100 150 Q100 280 150 300"/>
  <path d="M300 150 Q300 280 250 300"/>
  <path d="M150 300 L250 300"/>
  <rect x="160" y="320" width="80" height="60" rx="5"/>
  <line x1="160" y1="320" x2="150" y2="300"/>
  <line x1="240" y1="320" x2="250" y2="300"/>
  <path d="M130 100 Q200 50 270 100"/>
  <path d="M140 150 Q200 120 260 150"/>
  <path d="M130 200 Q200 170 270 200"/>
`),
  'vehicles/firetruck': createSVG(`
  <rect x="40" y="180" width="320" height="100" rx="10"/>
  <rect x="280" y="140" width="80" height="40"/>
  <rect x="300" y="150" width="40" height="25"/>
  <circle cx="100" cy="300" r="30"/>
  <circle cx="200" cy="300" r="30"/>
  <circle cx="300" cy="300" r="30"/>
  <rect x="50" y="100" width="200" height="80"/>
  <line x1="250" y1="100" x2="250" y2="180"/>
  <circle cx="150" cy="140" r="20"/>
  <rect x="60" y="200" width="30" height="60"/>
`),
  'vehicles/ambulance': createSVG(`
  <rect x="60" y="170" width="280" height="120" rx="10"/>
  <rect x="280" y="190" width="60" height="60"/>
  <rect x="290" y="200" width="40" height="40"/>
  <circle cx="120" cy="310" r="30"/>
  <circle cx="280" cy="310" r="30"/>
  <path d="M180 200 L180 250 M155 225 L205 225"/>
  <rect x="70" y="180" width="20" height="40"/>
  <line x1="60" y1="250" x2="340" y2="250"/>
`),
  'vehicles/policecar': createSVG(`
  <rect x="60" y="200" width="280" height="80" rx="10"/>
  <path d="M100 200 Q100 150 160 150 L240 150 Q300 150 300 200"/>
  <rect x="120" y="160" width="60" height="40"/>
  <rect x="220" y="160" width="60" height="40"/>
  <circle cx="120" cy="300" r="30"/>
  <circle cx="280" cy="300" r="30"/>
  <rect x="180" y="130" width="40" height="20" rx="5"/>
  <ellipse cx="200" cy="115" rx="15" ry="10"/>
  <line x1="60" y1="240" x2="340" y2="240"/>
`),
  'vehicles/sailboat': createSVG(`
  <path d="M50 280 L200 280 L350 280"/>
  <path d="M100 280 Q100 340 200 340 Q300 340 300 280"/>
  <line x1="200" y1="280" x2="200" y2="80"/>
  <path d="M200 80 L200 250 L320 250 Z"/>
  <path d="M200 100 L200 230 L100 230 Z"/>
  <path d="M50 280 Q100 260 150 280"/>
  <path d="M250 280 Q300 260 350 280"/>
`),
  'vehicles/scooter': createSVG(`
  <circle cx="100" cy="300" r="40"/>
  <circle cx="300" cy="300" r="40"/>
  <circle cx="100" cy="300" r="15"/>
  <circle cx="300" cy="300" r="15"/>
  <path d="M100 260 L150 200 L250 200 L300 260"/>
  <rect x="150" y="180" width="100" height="30" rx="5"/>
  <path d="M180 180 L180 130 L220 130"/>
  <rect x="220" y="120" width="40" height="20" rx="5"/>
  <line x1="100" y1="260" x2="100" y2="300"/>
  <line x1="300" y1="260" x2="300" y2="300"/>
`),
  'vehicles/excavator': createSVG(`
  <rect x="100" y="220" width="160" height="80" rx="10"/>
  <rect x="140" y="180" width="80" height="50" rx="5"/>
  <rect x="160" y="190" width="40" height="30"/>
  <path d="M100 220 L60 160 L30 180"/>
  <path d="M30 180 L50 200 L30 220 L10 200 Z"/>
  <ellipse cx="180" cy="320" rx="80" ry="30"/>
  <line x1="120" y1="320" x2="120" y2="280"/>
  <line x1="180" y1="320" x2="180" y2="280"/>
  <line x1="240" y1="320" x2="240" y2="280"/>
`),
  'vehicles/spaceship': createSVG(`
  <ellipse cx="200" cy="200" rx="60" ry="100"/>
  <path d="M140 200 Q100 250 120 300 L160 280"/>
  <path d="M260 200 Q300 250 280 300 L240 280"/>
  <circle cx="200" cy="150" r="25"/>
  <circle cx="200" cy="150" r="15"/>
  <ellipse cx="200" cy="220" rx="30" ry="10"/>
  <path d="M180 300 Q200 350 220 300"/>
  <circle cx="200" cy="330" r="10"/>
  <path d="M200 100 L200 60"/>
  <circle cx="200" cy="55" r="8"/>
`),
};

// Create directories and files
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateSvgFiles() {
  console.log('Generating SVG files...\n');
  
  let created = 0;
  let skipped = 0;
  
  for (const [relativePath, content] of Object.entries(svgDefinitions)) {
    const fullPath = path.join(BASE_PATH, `${relativePath}.svg`);
    const dir = path.dirname(fullPath);
    
    ensureDir(dir);
    
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content.trim());
      console.log(`✓ Created: ${relativePath}.svg`);
      created++;
    } else {
      console.log(`○ Skipped (exists): ${relativePath}.svg`);
      skipped++;
    }
  }
  
  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
}

generateSvgFiles();

