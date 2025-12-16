<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import Matter from 'matter-js'
import { useGamePhysics } from '../composables/useGamePhysics'
import { useIsometricProjection } from '../composables/useIsometricProjection'
import { useGameInput } from '../composables/useGameInput'
import { useSceneManager } from '../composables/useSceneManager'

const { world } = useGamePhysics()
const { getDirection, state } = useGameInput()
const { addEntity, entities } = useSceneManager()

const TILE_W = 64
const TILE_H = 32
const PLAYER_RADIUS = 20
const PLAYER_SPEED = 0.001

const canvasRef = ref<HTMLCanvasElement | null>(null)
let playerId: string | null = null

const iso = useIsometricProjection({
  tileWidth: TILE_W,
  tileHeight: TILE_H,
  offsetX: 0,
  offsetY: 80,
})

/**
 * Масштабирование канваса для поддержки высокого DPI
 */
function resizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1
  const cssW = window.innerWidth
  const cssH = window.innerHeight

  canvas.style.width = cssW + 'px'
  canvas.style.height = cssH + 'px'

  canvas.width = Math.floor(cssW * dpr)
  canvas.height = Math.floor(cssH * dpr)

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

onMounted(() => {
  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!

  resizeCanvas(canvas, ctx)
  const onResize = () => resizeCanvas(canvas, ctx)
  window.addEventListener('resize', onResize)

  // Создание препятствия (стена)
  const wallBody = Matter.Bodies.rectangle(
    15 * TILE_W,
    3 * TILE_H,
    TILE_W,
    TILE_H,
    { isStatic: true }
  )
  // addEntity(wallBody, 'obstacle')

  // Создание игрока
  const playerBody = Matter.Bodies.circle(15 * TILE_W, 2 * TILE_H, PLAYER_RADIUS, { mass: 10 })
  playerId = addEntity(playerBody, 'player')

  // Добавляем тела в мир
  if (world.value) {
    Matter.World.add(world.value, [wallBody, playerBody])
  }

  let rafId = 0

  /**
   * Рисует изометрическую сетку (опционально)
   */
  function drawIsoGrid() {
    const cols = Math.ceil(canvas.clientWidth / 2 / TILE_W) + 2
    const rows = Math.ceil(canvas.clientHeight / 2 / TILE_H) + 2

    ctx.strokeStyle = '#545342'
    ctx.lineWidth = 2

    for (let col = -1; col < cols; col++) {
      for (let row = -1; row < rows; row++) {
        const screenPos = iso.worldToScreen(col * TILE_W, row * TILE_H)

        // Рисуем вертикальные линии
        if (col < cols - 1) {
          const nextScreenPos = iso.worldToScreen((col + 1) * TILE_W, row * TILE_H)
          ctx.beginPath()
          ctx.moveTo(screenPos.x + canvas.clientWidth / 2, screenPos.y)
          ctx.lineTo(nextScreenPos.x + canvas.clientWidth / 2, nextScreenPos.y)
          ctx.stroke()
        }

        // Рисуем горизонтальные линии
        if (row < rows - 1) {
          const nextScreenPos = iso.worldToScreen(col * TILE_W, (row + 1) * TILE_H)
          ctx.beginPath()
          ctx.moveTo(screenPos.x + canvas.clientWidth / 2, screenPos.y)
          ctx.lineTo(nextScreenPos.x + canvas.clientWidth / 2, nextScreenPos.y)
          ctx.stroke()
        }
      }
    }
  }

  /**
   * Основной цикл рендеринга
   */
  function render() {
    // Получаем входные команды
    const direction = getDirection()

    // Применяем силу к игроку
    if (playerId && world.value) {
      const playerEntity = entities.value.get(playerId)
      if (playerEntity) {
        // Вычисляем силу на основе направления и скорости
        // const force = {
        //   x: direction.x * PLAYER_SPEED,
        //   y: direction.y * PLAYER_SPEED,
        // }
        // Применяем силу к телу игрока, чтобы двигаться в нужном направлении
        // Matter.Body.applyForce(
        //   playerEntity.body,
        //   playerEntity.body.position,
        //   force
        // )
      }
    }

    // Очищаем экран
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

    // Рисуем изометрическую сетку (опционально)
    drawIsoGrid()

    // Рисуем все сущности
    entities.value.forEach((entity) => {
      if (!entity.isActive) return

      const screenPos = iso.worldToScreen(
        entity.body.position.x,
        entity.body.position.y
      )

      if (entity.type === 'obstacle') {
        // Рисуем препятствие как изометрический ромб
        ctx.fillStyle = '#7a4a24'
        ctx.beginPath()
        ctx.moveTo(screenPos.x, screenPos.y + TILE_H / 2)
        ctx.lineTo(screenPos.x + TILE_W / 2, screenPos.y)
        ctx.lineTo(screenPos.x + TILE_W, screenPos.y + TILE_H / 2)
        ctx.lineTo(screenPos.x + TILE_W / 2, screenPos.y + TILE_H)
        ctx.closePath()
        ctx.fill()

        // Граница
        ctx.strokeStyle = '#5a3a14'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      if (entity.type === 'player') {
        // Рисуем тень под игроком
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.beginPath()
        ctx.ellipse(
          screenPos.x,
          screenPos.y + PLAYER_RADIUS * 0.6,
          PLAYER_RADIUS * 1.2,
          PLAYER_RADIUS * 0.8,
          0,
          0,
          Math.PI * 2
        )
        ctx.fill()
        // Рисуем игрока как синий круг
        ctx.fillStyle = '#3a7df0'
        ctx.beginPath()
        ctx.arc(screenPos.x, screenPos.y, PLAYER_RADIUS, 0, Math.PI * 2)
        ctx.fill()

        // Рисуем блик и полутень для объема
        const gradient = ctx.createRadialGradient(
          screenPos.x - PLAYER_RADIUS / 3,
          screenPos.y - PLAYER_RADIUS / 3,
          PLAYER_RADIUS / 5,
          screenPos.x,
          screenPos.y,
          PLAYER_RADIUS
        )

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
        gradient.addColorStop(0.7, 'rgba(58, 125, 240, 1)')
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(screenPos.x, screenPos.y, PLAYER_RADIUS, 0, Math.PI * 2)
        ctx.fill()

        // Граница
        ctx.strokeStyle = '#1a3a7f'
        ctx.lineWidth = 2
        ctx.stroke()

        // // Показываем направление движения
        // if (direction.x !== 0 || direction.y !== 0) {
        //   ctx.strokeStyle = '#ffffff'
        //   ctx.lineWidth = 1
        //   ctx.beginPath()
        //   ctx.moveTo(screenPos.x, screenPos.y)
        //   ctx.lineTo(
        //     screenPos.x + direction.x * 30,
        //     screenPos.y + direction.y * 30
        //   )
        //   ctx.stroke()
        // }
      }
    })

    // Показываем информацию (опционально)
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px monospace'
    ctx.fillText(`FPS: ${Math.round(1000 / 16)}`, 10, 20)
    ctx.fillText(`Entities: ${entities.value.size}`, 10, 40)
    ctx.fillText(`Direction: (${direction.x}, ${direction.y})`, 10, 60)

    rafId = requestAnimationFrame(render)
  }

  rafId = requestAnimationFrame(render)

  // Сохраняем cleanup функцию
  ;(canvas as any).__cleanup = () => {
    window.removeEventListener('resize', onResize)
    cancelAnimationFrame(rafId)
  }
})

onBeforeUnmount(() => {
  const canvas = canvasRef.value
  if (canvas && (canvas as any).__cleanup) {
    (canvas as any).__cleanup()
  }

  if (world.value) {
    Matter.World.clear(world.value, false)
  }

  playerId = null
})
</script>

<template>
  <pre class="absolute top-20 text-xs text-gray-500">{{ state }}</pre>
  <canvas ref="canvasRef" class="game-canvas"></canvas>
</template>

<style scoped>
.game-canvas {
  display: block;
  width: 100vw;
  height: 100vh;
  background: #1a1a1a;
  user-select: none;
}
</style>
