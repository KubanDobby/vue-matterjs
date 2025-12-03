# Vue + Matter.js Physics Simulation

A modern web application combining Vue 3 with TypeScript and Matter.js physics engine for interactive 2D physics simulations.

## Features

- ⚛️ **Vue 3** - Modern reactive framework
- 🔷 **TypeScript** - Full type safety and better developer experience
- 🎮 **Matter.js** - Powerful 2D physics engine
- ⚡ **Vite** - Lightning-fast build tool and dev server
- 🎨 **Interactive Canvas** - Real-time physics visualization
- 🎯 **Composable Physics** - Reusable physics hooks

## Project Setup

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5174`

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── PhysicsCanvas.vue      # Main canvas component with Matter.js integration
│   └── HelloWorld.vue          # Example component
├── composables/
│   └── usePhysics.ts           # Physics composable hook
├── assets/                     # Static assets
├── App.vue                     # Root component
├── main.ts                     # Application entry point
└── style.css                   # Global styles
```

## Usage

### Using the Physics Canvas

Import and use the `PhysicsCanvas` component:

```vue
<template>
  <PhysicsCanvas 
    @ready="handleCanvasReady" 
    :width="800" 
    :height="600" 
    :gravity="1" 
  />
</template>

<script setup lang="ts">
import Matter from 'matter-js'
import PhysicsCanvas from './components/PhysicsCanvas.vue'

const handleCanvasReady = (engine: Matter.Engine, world: Matter.World) => {
  // Physics engine is ready, add bodies to the world
}
</script>
```

### Using the Physics Composable

```typescript
import { usePhysics } from '@/composables/usePhysics'

const { world, createCircle, createRectangle, removeBody } = usePhysics({
  gravity: 1,
  enableSleeping: true,
})

// Create a circle body
const circle = createCircle(100, 100, 20)

// Create a rectangle body
const rect = createRectangle(200, 200, 50, 30)
```

## Controls

- **Add Body** - Add a random physics body to the simulation
- **Clear** - Remove all bodies from the scene

## Technologies Used

- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Matter.js](https://brm.io/matter-js/) - 2D rigid body physics engine
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

## IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## License

MIT
