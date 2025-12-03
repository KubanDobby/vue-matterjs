# Vue + Matter.js Project - Copilot Instructions

## Project Overview

This is a Vue 3 + TypeScript + Matter.js physics engine project built with Vite. The application provides an interactive 2D physics simulation canvas with Vue components.

## Architecture

- **Frontend Framework**: Vue 3 with Composition API and `<script setup>`
- **Language**: TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Physics Engine**: Matter.js for 2D rigid body physics
- **Styling**: Scoped CSS with global styles

## Key Components

### `src/components/PhysicsCanvas.vue`
Main canvas component that:
- Initializes Matter.js engine and world
- Renders physics bodies in real-time
- Creates ground and wall boundaries
- Emits ready event when physics engine is initialized

### `src/composables/usePhysics.ts`
Reusable physics composable that:
- Manages engine and world instances
- Provides helper methods to create bodies
- Handles lifecycle management
- Cleans up resources on unmount

### `src/App.vue`
Main application component that:
- Manages physics simulation state
- Provides UI controls for adding/clearing bodies
- Renders the physics canvas with controls overlay

## Development Guidelines

### Code Standards
- Use TypeScript for all new code
- Prefer Composition API with `<script setup>` in Vue components
- Use Vue 3 reactivity (ref, computed, watch) appropriately
- Keep components focused on single responsibility

### File Structure
- Place new components in `src/components/`
- Place utility functions/composables in `src/composables/`
- Keep styles scoped to components when possible
- Use global styles in `src/style.css` sparingly

### Physics Engine Usage
- Use Matter.Bodies factory methods (circle, rectangle, etc.)
- Always add bodies to the world using Matter.World.add()
- Handle body cleanup to prevent memory leaks
- Use appropriate restitution and friction values for physics behavior

## Common Tasks

### Adding a New Body Type
```typescript
const createPolygon = (x: number, y: number, sides: number, radius: number) => {
  if (!world.value) return null
  const polygon = Matter.Bodies.polygon(x, y, sides, radius)
  Matter.World.add(world.value, polygon)
  bodies.value.push(polygon)
  return polygon
}
```

### Adding UI Controls
Add buttons to the controls div in App.vue that call action methods to interact with the physics simulation.

### Styling Physics Elements
Use canvas rendering properties or add post-render styling through Matter.Body properties like `render.fillStyle` and `render.strokeStyle`.

## Build and Deployment

### Development
```bash
npm run dev
```
Starts Vite dev server at http://localhost:5174

### Production Build
```bash
npm run build
```
Creates optimized production build in `dist/`

### Preview Build
```bash
npm run preview
```
Previews production build locally

## Dependencies

- **vue@^3.5.0** - Vue framework
- **matter-js** - Physics engine
- **@types/matter-js** - Type definitions for Matter.js
- **typescript** - TypeScript compiler
- **vite** - Build tool and dev server

## Performance Considerations

- Matter.js runs physics calculations every frame
- Limit the number of bodies in simulation for performance
- Use `isStatic: true` for non-moving bodies like ground/walls
- Consider using sleeping bodies for inactive physics objects

## Testing and Debugging

### Type Checking
```bash
npm run type-check
```

### Building
```bash
npm run build
```
Includes TypeScript compilation and Vue component validation

## Known Issues and Workarounds

- Matter.js TypeScript types may require assertions in some cases
- Use `as Matter.IBodyDefinition` when spreading options for body creation
