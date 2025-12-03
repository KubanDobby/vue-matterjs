<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import Matter from 'matter-js';

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Tile ISO sizes
const TILE_W = 64;
const TILE_H = 32;

// Physics
let engine: Matter.Engine | null = null;
let world: Matter.World | null = null;

let wallBody: Matter.Body | null = null;
let playerBody: Matter.Body | null = null;

//
// ISO Projection
//
function gridToScreen(gx: number, gy: number, canvas: HTMLCanvasElement) {
  const x0 = canvas.width / 2;
  const y0 = 80;

  const sx = x0 + (gx - gy) * (TILE_W / 2);
  const sy = y0 + (gx + gy) * (TILE_H / 2);

  return { x: sx, y: sy };
}

//
// Resize canvas to full window and scale content
//
function resizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1;
  const cssW = window.innerWidth;
  const cssH = window.innerHeight;

  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';

  canvas.width = Math.max(1, Math.floor(cssW * dpr));
  canvas.height = Math.max(1, Math.floor(cssH * dpr));

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

onMounted(() => {
  const canvas = canvasRef.value!;
  const ctx = canvas.getContext('2d')!;

  // initial resize + setup
  resizeCanvas(canvas, ctx);

  const onResize = () => resizeCanvas(canvas, ctx);
  window.addEventListener('resize', onResize);

  //
  // Setup physics
  //
  engine = Matter.Engine.create();
  world = engine.world;

  // Create walls around the screen boundaries
  const wallThickness = 50;
  const walls = [
    // Top wall
    Matter.Bodies.rectangle(canvas.width / 2, -wallThickness / 2, canvas.width, wallThickness, {
      isStatic: true,
      label: 'wall'
    }),
    // Bottom wall
    Matter.Bodies.rectangle(canvas.width / 2, canvas.height + wallThickness / 2, canvas.width, wallThickness, {
      isStatic: true,
      label: 'wall'
    }),
    // Left wall
    Matter.Bodies.rectangle(-wallThickness / 2, canvas.height / 2, wallThickness, canvas.height, {
      isStatic: true,
      label: 'wall'
    }),
    // Right wall
    Matter.Bodies.rectangle(canvas.width + wallThickness / 2, canvas.height / 2, wallThickness, canvas.height, {
      isStatic: true,
      label: 'wall'
    })
  ];

  // Create wall at grid position (5, 3)
  const wallGrid = { x: 5, y: 3 };
  const wallScreen = gridToScreen(wallGrid.x, wallGrid.y, canvas);
  wallBody = Matter.Bodies.rectangle(wallScreen.x, wallScreen.y, TILE_W, TILE_H, {
    isStatic: true,
    label: 'wall'
  });

  // Create player at grid position (2, 2)
  const playerGrid = { x: 2, y: 2 };
  const playerScreen = gridToScreen(playerGrid.x, playerGrid.y, canvas);
  playerBody = Matter.Bodies.circle(playerScreen.x, playerScreen.y, 20, {
    restitution: 0.8,
    friction: 0.1,
    label: 'player'
  });

  // Add all bodies to world
  if (world) {
    Matter.World.add(world, [...walls, wallBody, playerBody]);
  }

  // Add some gravity
  engine.gravity.y = 0.5;

  // Render Loop
  let last = performance.now();
  let rafId = 0;

  function render(time: number) {
    const dt = Math.min(50, time - last);
    last = time;

    if (engine) {
      Matter.Engine.update(engine, dt);
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw walls (boundaries)
    walls.forEach(wall => {
      ctx.fillStyle = '#333';
      ctx.fillRect(wall.position.x - wall.bounds.max.x / 2, 
                   wall.position.y - wall.bounds.max.y / 2,
                   wall.bounds.max.x, wall.bounds.max.y);
    });

    // Draw wall in ISO
    if (wallBody) {
      const s = { x: wallBody.position.x, y: wallBody.position.y };

      ctx.fillStyle = '#7a4a24';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y + TILE_H / 2);
      ctx.lineTo(s.x + TILE_W / 2, s.y);
      ctx.lineTo(s.x + TILE_W, s.y + TILE_H / 2);
      ctx.lineTo(s.x + TILE_W / 2, s.y + TILE_H);
      ctx.closePath();
      ctx.fill();
    }

    // Draw player
    if (playerBody) {
      const p = playerBody.position;
      ctx.fillStyle = '#3a7df0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);

  // Cleanup
  (canvas as any).__vm_cleanup = () => {
    window.removeEventListener('resize', onResize);
    cancelAnimationFrame(rafId);
  };
});

onBeforeUnmount(() => {
  const canvas = canvasRef.value;
  if (canvas && (canvas as any).__vm_cleanup) {
    try { (canvas as any).__vm_cleanup(); } catch (err) { /* noop */ }
  }

  if (world) {
    Matter.World.clear(world, false);
  }

  if (engine) {
    Matter.Engine.clear(engine);
  }

  // drop references
  wallBody = null;
  playerBody = null;
  world = null;
  engine = null;
});
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>

<style scoped>
canvas {
  display: block;
  background: #222;
}
</style>