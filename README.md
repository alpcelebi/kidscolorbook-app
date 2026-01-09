# KidsColorBook

A production-quality, offline-first kids coloring book app with free-draw mode. Built with React Native, TypeScript, and Expo SDK 54.

## Features

- 🎨 **Coloring Book Pages**: 12 preloaded coloring pages across 4 categories (Animals, Vehicles, Nature, Shapes)
- ✏️ **Free Draw Mode**: Blank canvas for creative drawing
- 🎯 **Kid-Friendly UI**: Large touch targets, simple icons, minimal text
- 🌐 **Multilingual**: Turkish (default) and English language support
- 📱 **100% Offline**: No network calls, no analytics, no tracking
- 💾 **Auto-Save**: Progress saved automatically with debouncing
- 🔒 **Parental Gate**: Math question or 3-second hold for sensitive actions
- 🖼️ **Gallery**: View and manage saved artworks
- ❤️ **Favorites**: Mark favorite coloring pages

## Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation 7
- **State Management**: Zustand
- **Database**: SQLite (expo-sqlite)
- **Drawing**: react-native-svg + react-native-gesture-handler
- **i18n**: i18next + react-i18next
- **Testing**: Jest + Testing Library

## Project Structure

```
KidsColorBook/
├── src/
│   ├── domain/          # Entities and interfaces
│   ├── data/            # Database, repositories, storage
│   ├── features/        # Feature modules (drawing, gallery, settings)
│   ├── ui/              # Components, screens, theme
│   ├── navigation/      # React Navigation setup
│   ├── i18n/            # Internationalization
│   └── utils/           # Utility functions
├── assets/              # SVG coloring pages, icons
└── __tests__/           # Unit tests
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. **Clone the repository**
   ```bash
   cd KidsColorBook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally (if not already installed)**
   ```bash
   npm install -g expo-cli
   ```

### Running the App

#### Development Build (Recommended for this project)

Since the app uses native modules (expo-sqlite, react-native-gesture-handler), you need a development build:

1. **Create development build for Android**
   ```bash
   npx expo prebuild --platform android
   npx expo run:android
   ```

2. **Create development build for iOS** (macOS only)
   ```bash
   npx expo prebuild --platform ios
   npx expo run:ios
   ```

#### Expo Go (Limited)

Note: Some features may not work fully in Expo Go due to native module requirements.

```bash
npx expo start
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## SQLite Schema

The app uses SQLite for all data persistence:

- **categories**: Coloring page categories
- **pages**: Bundled coloring pages metadata
- **page_progress**: User's coloring progress per page
- **favorites**: Favorited pages
- **artworks**: Saved drawings (coloring & free-draw)
- **settings**: App settings (language, etc.)

## Localization

The app supports Turkish (default) and English. Language can be changed in Settings (behind parental gate).

To add a new language:
1. Create a new JSON file in `src/i18n/locales/`
2. Add the language code to `SUPPORTED_LANGUAGES` in `src/i18n/config.ts`
3. Add the language name to `LANGUAGE_NAMES`

## Architecture Decisions

### State Management: Zustand

Chosen for its simplicity, TypeScript support, and minimal boilerplate. The app uses separate stores for different concerns:
- `drawingStore`: Active drawing state (paths, colors, brush size)
- `settingsStore`: App settings (language)
- `galleryStore`: Saved artworks

### Drawing Engine: react-native-svg

While Skia offers better performance, react-native-svg provides:
- Better stability with Expo SDK 54
- Simpler integration
- Sufficient performance for this use case
- Easier path manipulation

The SkiaCanvas component is included as an alternative for future optimization.

### Offline-First

All data is stored locally using:
- SQLite for structured data and metadata
- File system for exported images and thumbnails

No network permissions are requested.

## Next Iterations (Future Features)

- [ ] Multiple child profiles
- [ ] More coloring categories and pages
- [ ] Custom color picker
- [ ] Stickers and stamps
- [ ] Sound effects (optional, with parental control)
- [ ] Export quality options
- [ ] Backup/restore functionality
- [ ] RTL language support (Arabic, Hebrew)

## License

Private - All rights reserved

## Notes for Expo SDK 54

This project is built specifically for Expo SDK 54. Key considerations:

1. **New Architecture**: The app is configured for React Native's new architecture
2. **expo-sqlite**: Uses the new async API available in SDK 54
3. **Development Builds**: Native modules require development builds (not Expo Go)

To verify your Expo SDK version:
```bash
npx expo --version
```

