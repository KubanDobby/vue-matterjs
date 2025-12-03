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
  // Use CSS pixel dimensions for layout (clientWidth/clientHeight)
  const x0 = canvas.clientWidth / 2;
  const y0 = 80; // camera height offset (in CSS pixels)

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

  // Reset any existing transform and scale to DPR so drawing uses CSS pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

onMounted(() => {
  const canvas = canvasRef.value!;
  const ctx = canvas.getContext('2d')!;

  // initial resize + setup
  resizeCanvas(canvas, ctx);

  // keep references so we can remove the listener
  const onResize = () => resizeCanvas(canvas, ctx);
  window.addEventListener('resize', onResize);

  //
  // Setup physics
  //
  engine = Matter.Engine.create();
  world = engine.world;

  //
  // World objects
  //
  const wallGrid = { x: 5, y: 3 };
  const wallPx = wallGrid.x * TILE_W;
  const wallPy = wallGrid.y * TILE_H;

  wallBody = Matter.Bodies.rectangle(wallPx, wallPy, TILE_W, TILE_H, {
    isStatic: true
  });

  playerBody = Matter.Bodies.circle(2 * TILE_W, 2 * TILE_H, 20);

  if (world) Matter.World.add(world, [wallBody, playerBody]);

  //
  // Render Loop
  //
  let last = performance.now();
  let rafId = 0;

  function render(time: number) {
    const dt = Math.min(50, time - last); // clamp to avoid large jumps
    last = time;

    if (engine) Matter.Engine.update(engine, dt);

    // clear using CSS pixels (clientWidth/clientHeight)
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Draw WALL in ISO
    if (wallBody) {
      const bx = wallBody.position.x;
      const by = wallBody.position.y;

      const gx = bx / TILE_W;
      const gy = by / TILE_H;

      const s = gridToScreen(gx, gy, canvas);

      ctx.fillStyle = '#7a4a24';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y + TILE_H / 2);
      ctx.lineTo(s.x + TILE_W / 2, s.y);
      ctx.lineTo(s.x + TILE_W, s.y + TILE_H / 2);
      ctx.lineTo(s.x + TILE_W / 2, s.y + TILE_H);
      ctx.closePath();
      ctx.fill();
    }

    // Draw PLAYER
    if (playerBody) {
      const p = playerBody.position;
      const gx = p.x / TILE_W;
      const gy = p.y / TILE_H;
      const s = gridToScreen(gx, gy, canvas);

      ctx.fillStyle = '#3a7df0';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);

  // store cleanup on the element for unmount closure
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
