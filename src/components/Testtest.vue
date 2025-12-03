<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import Matter from 'matter-js';

//
// CONSTANTS
//
const TILE_W = 64;
const TILE_H = 32;

const canvasRef = ref<HTMLCanvasElement | null>(null);

let engine: Matter.Engine | null = null;
let world: Matter.World | null = null;

let wallBody: Matter.Body | null = null;
let playerBody: Matter.Body | null = null;

//
// ISO PROJECTION
//
function gridToScreen(gx: number, gy: number, canvas: HTMLCanvasElement) {
  // Projection using CSS pixels (logical px)
  const cssW = canvas.clientWidth;
  const x0 = cssW / 2;    // camera center
  const y0 = 80;          // top offset

  const sx = x0 + (gx - gy) * (TILE_W / 2);
  const sy = y0 + (gx + gy) * (TILE_H / 2);
  return { x: sx, y: sy };
}

//
// RESIZE HELPER
//
function resizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1;
  const cssW = window.innerWidth;
  const cssH = window.innerHeight;

  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';

  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // каждый логический пиксель = DPR физических
}

//
// COMPONENT MOUNT
//
onMounted(() => {
  const canvas = canvasRef.value!;
  const ctx = canvas.getContext('2d')!;

  resizeCanvas(canvas, ctx);
  const onResize = () => resizeCanvas(canvas, ctx);
  window.addEventListener('resize', onResize);

  //
  // MATTER SETUP
  //
  engine = Matter.Engine.create();
  world = engine.world;

  // Bodies positions are in "world pixels" → мы привязываем их к плиточным координатам
  function worldX(gridX: number) { return gridX * TILE_W; }
  function worldY(gridY: number) { return gridY * TILE_H; }

  wallBody = Matter.Bodies.rectangle(
    worldX(5), worldY(3),
    TILE_W, TILE_H,
    { isStatic: true }
  );

  playerBody = Matter.Bodies.circle(
    worldX(2),
    worldY(2),
    20
  );

  Matter.World.add(world, [wallBody, playerBody]);

  //
  // RENDER LOOP
  //
  let last = performance.now();
  let rafId = 0;

  function render(t: number) {
    const dt = Math.min(50, t - last);
    last = t;

    if (engine) Matter.Engine.update(engine, dt);

    // clear using CSS pixels (logical)
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    //
    // DRAW WALL
    //
    if (wallBody) {
      const gx = wallBody.position.x / TILE_W;
      const gy = wallBody.position.y / TILE_H;
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

    //
    // DRAW PLAYER
    //
    if (playerBody) {
      const gx = playerBody.position.x / TILE_W;
      const gy = playerBody.position.y / TILE_H;
      const s = gridToScreen(gx, gy, canvas);

      ctx.fillStyle = '#3a7df0';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);

  (canvas as any).__cleanup = () => {
    window.removeEventListener('resize', onResize);
    cancelAnimationFrame(rafId);
  };
});

//
// UNMOUNT
//
onBeforeUnmount(() => {
  const canvas = canvasRef.value;
  if (canvas && (canvas as any).__cleanup) {
    (canvas as any).__cleanup();
  }

  if (world) Matter.World.clear(world, false);
  if (engine) Matter.Engine.clear(engine);

  world = null;
  engine = null;
  wallBody = null;
  playerBody = null;
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