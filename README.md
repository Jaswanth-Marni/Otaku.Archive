# OTAKU.ARCHIVE

<div align="center">
  <p><strong>A Modern, Immersive Anime Discovery Platform</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#project-structure">Structure</a>
  </p>
</div>

---

## 📖 Overview

**Otaku.Archive** is a high-performance, visually stunning anime discovery web application. Built with modern web technologies, it leverages the **AniList GraphQL API** to provide real-time data on trending anime, studios, and more. The application focuses on user experience (UX) with smooth **FLIP animations**, **parallax effects**, and a minimalist, editorial-style design.

## ✨ Key Features

### 🎨 Immersive UI/UX
- **Parallax Showcase**: Interactive landing page with mouse-driven parallax effects on desktop.
- **FLIP Animations**: Seamless transitions between the landing page and detail views using the FLIP (First, Last, Invert, Play) technique.
- **Responsive Design**: Fully optimized for all devices, featuring distinct navigation patterns for Mobile (Slide-out menu) and Desktop (Full-screen overlay).
- **Dark/Light Mode**: System-wide theme toggling with persistent state.

### 🔍 Discovery & Content
- **Trending Showcase**: Curated list of top trending anime with high-quality cover art.
- **Detail View**: Deep dive into anime details including synopsis, ratings, studio information, and genres.
- **Trailer Integration**: Integrated YouTube player for watching anime trailers directly within the app, featuring a custom-styled launch section.
- **Studio Spotlight**: Browse anime by production studios.
- **Explore Mode**: Discover content via different categories (Trending, Popular, etc.).

### ⚡ Performance & Interaction
- **Haptic Feedback**: Subtle vibration feedback on interactive elements (mobile devices).
- **Pull-to-Refresh**: Custom pull-to-refresh implementation for mobile web.
- **Optimized Assets**: Lazy loading and efficient data fetching strategies.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) (v18)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Source**: [AniList GraphQL API](https://anilist.co/home)
- **Animations**: Native Web Animations API & CSS Transitions
- **Icons**: Custom SVG & Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jaswanth-Marni/Otaku.Archive.git
   cd otaku-archive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📂 Project Structure

```
otaku-archive/
├── components/         # Reusable UI components
│   ├── AboutView.tsx
│   ├── DesktopMenu.tsx
│   ├── ExploreView.tsx
│   ├── Footer.tsx
│   ├── MobileMenu.tsx
│   ├── TrailerPlayer.tsx
│   └── ...
├── services/           # API services
│   ├── anilistService.ts  # GraphQL queries & fetchers
│   └── ...
├── utils/              # Helper functions
│   └── haptics.ts
├── App.tsx            # Main application logic & routing
├── index.css          # Global styles & Tailwind directives
└── vite.config.ts     # Vite configuration
```

## 🔄 Recent Updates

- **Trailer Section Overhaul**: Replaced the simple "Watch Trailer" button with a dedicated, visual trailer section in the detail view. This section now displays the trailer thumbnail with a custom-styled red play icon and shadow effects.
- **Player Improvements**: Reverted to a robust YouTube Embed solution for better reliability (quality/captions) while maintaining a responsive, custom-styled wrapper.
- **UX Refinements**: 
  - Fixed floating navbar issues on desktop.
  - Implemented responsive "Close" buttons that flow with content.
  - Added haptic feedback to media interactions.

---

<div align="center">
  <sub>Built with ❤️ by Jaswanth Marni</sub>
</div>
