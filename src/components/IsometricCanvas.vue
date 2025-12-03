<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Matter, { Engine, Bodies, World } from 'matter-js'

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Tile grid size
const TILE_W = 64
const TILE_H = 32

// Physics
let engine: Engine
let wallBody: Matter.Body
let playerBody: Matter.Body

// Render
let ctx: CanvasRenderingContext2D
let rafId = 0

// Projection (grid → screen)
function gridToScreen(x: number, y: number) {
  const canvas = canvasRef.value!
  const x0 = canvas.width / 2
  const y0 = 50

  const screenX = x0 + (x - y) * (TILE_W / 2)
  const screenY = y0 + (x + y) * (TILE_H / 2)

  return { x: screenX, y: screenY }
}

function update() {
  const canvas = canvasRef.value!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  Matter.Engine.update(engine, 16.666)

  // Render wall
  const wallGrid = { x: 5, y: 3 }
  const ws = gridToScreen(wallGrid.x, wallGrid.y)

  ctx.fillStyle = 'brown'
  ctx.fillRect(ws.x, ws.y, TILE_W, TILE_H)

  // Render player
  const p = playerBody.position
  const gridX = p.x / TILE_W
  const gridY = p.y / TILE_H
  const ps = gridToScreen(gridX, gridY)

  ctx.fillStyle = 'blue'
  ctx.beginPath()
  ctx.arc(ps.x, ps.y, 20, 0, Math.PI * 2)
  ctx.fill()

  rafId = requestAnimationFrame(update)
}

onMounted(() => {
  const canvas = canvasRef.value!
  canvas.width = 800
  canvas.height = 600
  ctx = canvas.getContext('2d')!

  // Matter init
  engine = Engine.create()
  const world = engine.world

  // Wall body
  wallBody = Bodies.rectangle(
    5 * TILE_W,
    3 * TILE_H,
    TILE_W,
    TILE_H,
    { isStatic: true }
  )
  World.add(world, wallBody)

  // Player body
  playerBody = Bodies.circle(2 * TILE_W, 2 * TILE_H, 20)
  World.add(world, playerBody)

  update()
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
