# Living Graph UI

A futuristic, reactive Next.js frontend featuring a living, breathing graph interface with advanced physics, animations, and interactive elements.

## Features

- **Living Graph System**: Nodes with physics-based movement, repulsion, and spring forces
- **Reactive Interactions**: Cursor sensing, proximity effects, and organic animations
- **Glassmorphism UI**: Modern frosted glass effects with backdrop blur
- **Atmospheric Background**: Dynamic fog, parallax effects, and ambient lighting
- **Advanced Animations**: Breathing effects, idle oscillations, energy pulses
- **Drag & Drop**: Smooth node dragging with physics-based inertia

## Tech Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS
- Framer Motion
- Zustand
- Custom physics engine

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/              # Next.js app router pages
  components/       # React components
  store/           # Zustand state management
  lib/             # Utilities and physics engine
  types/           # TypeScript type definitions
```

## Key Components

- **GraphCanvas**: Main graph rendering and physics simulation
- **Node**: Individual graph nodes with animations
- **NodeLink**: Animated connections between nodes
- **FloatingPanel**: Glassmorphism panel for node details
- **BackgroundEnvironment**: Atmospheric background effects
- **Sidebar**: Navigation sidebar with hover effects
- **SearchBar**: Animated search input with glow effects

## Customization

The graph data can be customized in `src/lib/graphData.ts`. Physics parameters can be adjusted in `src/lib/physicsEngine.ts`.

