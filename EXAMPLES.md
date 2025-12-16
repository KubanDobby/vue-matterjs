# 📖 Примеры и Расширения

Практические примеры для расширения функциональности вашей игры.

## 📚 Содержание

1. [Система коллизий](#система-коллизий)
2. [Анимация спрайтов](#анимация-спрайтов)
3. [Камера и масштабирование](#камера-и-масштабирование)
4. [Партиклы](#партиклы)
5. [Система уровней](#система-уровней)
6. [AI враги](#ai-враги)

---

## Система Коллизий

### Обнаружение столкновения

```typescript
// src/composables/useCollisions.ts
import Matter from 'matter-js'

export function useCollisions(world: Matter.World) {
  const collisions = new Map<string, Set<string>>()

  Matter.Events.on(world, 'afterUpdate', () => {
    collisions.clear()

    // Проверяем все пары коллизий
    for (const pair of world.pairs.list) {
      if (!pair.isActive) continue

      const id1 = (pair.bodyA as any).entityId
      const id2 = (pair.bodyB as any).entityId

      if (id1 && id2) {
        if (!collisions.has(id1)) collisions.set(id1, new Set())
        collisions.get(id1)!.add(id2)
      }
    }
  })

  function hasCollision(entityId: string, otherEntityId: string): boolean {
    return collisions.get(entityId)?.has(otherEntityId) ?? false
  }

  function getCollisions(entityId: string): string[] {
    return Array.from(collisions.get(entityId) ?? [])
  }

  return { hasCollision, getCollisions }
}
```

### Использование в GamePhysics.vue

```typescript
import { useCollisions } from '../composables/useCollisions'

const { hasCollision, getCollisions } = useCollisions(world.value!)

// В render loop:
if (playerId && hasCollision(playerId, 'enemy_1')) {
  console.log('Столкнулись с врагом!')
  // Обработка столкновения
}
```

---

## Анимация Спрайтов

### Система анимации

```typescript
// src/composables/useAnimation.ts
import { ref, computed } from 'vue'

interface AnimationFrame {
  x: number
  y: number
  width: number
  height: number
}

interface Animation {
  frames: AnimationFrame[]
  frameTime: number
  loop: boolean
}

export function useAnimation(animations: Record<string, Animation>) {
  const currentAnimation = ref<string>('idle')
  const currentFrame = ref<number>(0)
  const elapsedTime = ref<number>(0)

  const animation = computed(() => animations[currentAnimation.value])
  const frame = computed(() => animation.value?.frames[currentFrame.value])

  function update(deltaTime: number) {
    if (!animation.value) return

    elapsedTime.value += deltaTime

    if (elapsedTime.value >= animation.value.frameTime) {
      elapsedTime.value = 0
      currentFrame.value++

      if (currentFrame.value >= animation.value.frames.length) {
        if (animation.value.loop) {
          currentFrame.value = 0
        } else {
          currentFrame.value = animation.value.frames.length - 1
        }
      }
    }
  }

  function play(name: string) {
    if (currentAnimation.value !== name) {
      currentAnimation.value = name
      currentFrame.value = 0
      elapsedTime.value = 0
    }
  }

  return { play, update, frame, currentAnimation }
}
```

### Использование

```typescript
const playerAnimations = {
  idle: {
    frames: [
      { x: 0, y: 0, width: 32, height: 32 },
      { x: 32, y: 0, width: 32, height: 32 },
    ],
    frameTime: 200,
    loop: true,
  },
  walk: {
    frames: [
      { x: 0, y: 32, width: 32, height: 32 },
      { x: 32, y: 32, width: 32, height: 32 },
      { x: 64, y: 32, width: 32, height: 32 },
    ],
    frameTime: 100,
    loop: true,
  },
}

const playerAnim = useAnimation(playerAnimations)

// В render loop:
if (direction.x !== 0 || direction.y !== 0) {
  playerAnim.play('walk')
} else {
  playerAnim.play('idle')
}
```

---

## Камера и Масштабирование

### Система камеры

```typescript
// src/composables/useCamera.ts
import { ref } from 'vue'

interface CameraState {
  x: number
  y: number
  zoom: number
}

export function useCamera() {
  const camera = ref<CameraState>({
    x: 0,
    y: 0,
    zoom: 1,
  })

  function follow(targetX: number, targetY: number, smoothing = 0.1) {
    camera.value.x += (targetX - camera.value.x) * smoothing
    camera.value.y += (targetY - camera.value.y) * smoothing
  }

  function setZoom(zoom: number) {
    camera.value.zoom = Math.max(0.5, Math.min(3, zoom))
  }

  function screenToWorld(screenX: number, screenY: number) {
    const canvasX = screenX / window.devicePixelRatio
    const canvasY = screenY / window.devicePixelRatio

    return {
      x: (canvasX + camera.value.x) / camera.value.zoom,
      y: (canvasY + camera.value.y) / camera.value.zoom,
    }
  }

  function worldToScreen(worldX: number, worldY: number) {
    return {
      x: (worldX - camera.value.x) * camera.value.zoom,
      y: (worldY - camera.value.y) * camera.value.zoom,
    }
  }

  return { camera, follow, setZoom, screenToWorld, worldToScreen }
}
```

### Использование в GamePhysics.vue

```typescript
const { camera, follow } = useCamera()

// В render loop:
// Следуем за игроком
if (playerId && world.value) {
  const playerEntity = entities.value.get(playerId)
  if (playerEntity) {
    follow(playerEntity.body.position.x, playerEntity.body.position.y)
  }
}

// Применяем смещение камеры при рисовании:
ctx.save()
ctx.translate(-camera.value.x, -camera.value.y)
ctx.scale(camera.value.zoom, camera.value.zoom)

// ... рисование объектов ...

ctx.restore()
```

---

## Партиклы

### Система частиц

```typescript
// src/composables/useParticles.ts
import { ref } from 'vue'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

export function useParticles() {
  const particles = ref<Particle[]>([])

  function emit(
    x: number,
    y: number,
    count: number,
    options: {
      vxRange?: number
      vyRange?: number
      life?: number
      size?: number
      color?: string
    } = {}
  ) {
    const {
      vxRange = 2,
      vyRange = 2,
      life = 1000,
      size = 4,
      color = '#fff',
    } = options

    for (let i = 0; i < count; i++) {
      particles.value.push({
        x,
        y,
        vx: (Math.random() - 0.5) * vxRange,
        vy: (Math.random() - 0.5) * vyRange,
        life,
        maxLife: life,
        size,
        color,
      })
    }
  }

  function update(deltaTime: number) {
    particles.value = particles.value.filter((p) => {
      p.life -= deltaTime
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.1 // гравитация
      return p.life > 0
    })
  }

  function draw(ctx: CanvasRenderingContext2D) {
    particles.value.forEach((p) => {
      const alpha = p.life / p.maxLife
      ctx.globalAlpha = alpha

      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.globalAlpha = 1
  }

  return { particles, emit, update, draw }
}
```

---

## Система Уровней

### Менеджер уровней

```typescript
// src/composables/useLevelManager.ts
import Matter from 'matter-js'

export interface LevelData {
  name: string
  obstacles: Array<{ x: number; y: number; w: number; h: number }>
  enemies: Array<{ x: number; y: number; radius: number }>
  playerSpawn: { x: number; y: number }
}

const levels: Record<string, LevelData> = {
  level1: {
    name: 'Уровень 1',
    playerSpawn: { x: 2, y: 2 },
    obstacles: [
      { x: 5, y: 3, w: 1, h: 1 },
      { x: 10, y: 5, w: 2, h: 1 },
    ],
    enemies: [
      { x: 8, y: 8, radius: 15 },
      { x: 12, y: 10, radius: 12 },
    ],
  },
  level2: {
    name: 'Уровень 2',
    playerSpawn: { x: 1, y: 1 },
    obstacles: [
      { x: 7, y: 4, w: 3, h: 1 },
      { x: 12, y: 8, w: 1, h: 3 },
    ],
    enemies: [
      { x: 10, y: 5, radius: 15 },
      { x: 8, y: 10, radius: 15 },
      { x: 14, y: 12, radius: 12 },
    ],
  },
}

export function useLevelManager() {
  let currentLevel = 'level1'

  function getLevel(name: string): LevelData {
    return levels[name] || levels['level1']
  }

  function getCurrentLevel(): LevelData {
    return levels[currentLevel]
  }

  function setLevel(name: string) {
    if (levels[name]) {
      currentLevel = name
    }
  }

  function loadLevel(
    levelName: string,
    addEntity: any,
    world: Matter.World,
    TILE_W: number,
    TILE_H: number
  ) {
    const level = getLevel(levelName)

    // Добавить препятствия
    level.obstacles.forEach((obs) => {
      const body = Matter.Bodies.rectangle(
        obs.x * TILE_W,
        obs.y * TILE_H,
        obs.w * TILE_W,
        obs.h * TILE_H,
        { isStatic: true }
      )
      addEntity(body, 'obstacle')
      Matter.World.add(world, body)
    })

    // Добавить врагов
    level.enemies.forEach((enemy) => {
      const body = Matter.Bodies.circle(
        enemy.x * TILE_W,
        enemy.y * TILE_H,
        enemy.radius
      )
      addEntity(body, 'enemy')
      Matter.World.add(world, body)
    })
  }

  return { getLevel, getCurrentLevel, setLevel, loadLevel }
}
```

---

## AI Враги

### Простой AI враг

```typescript
// src/composables/useEnemyAI.ts
export function useEnemyAI() {
  function moveTowardsPlayer(
    enemyX: number,
    enemyY: number,
    playerX: number,
    playerY: number,
    speed: number
  ): { x: number; y: number } {
    const dx = playerX - enemyX
    const dy = playerY - enemyY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance === 0) return { x: 0, y: 0 }

    return {
      x: (dx / distance) * speed,
      y: (dy / distance) * speed,
    }
  }

  function wander(
    x: number,
    y: number,
    speed: number,
    time: number
  ): { x: number; y: number } {
    const noise = Math.sin(time * 0.001) * Math.cos(time * 0.0015)
    const angle = noise * Math.PI

    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    }
  }

  function patrol(
    position: number,
    patrolPoints: Array<{ x: number; y: number }>,
    speed: number
  ): {
    x: number
    y: number
    nextPoint: number
  } {
    const current = patrolPoints[position]
    const next = patrolPoints[(position + 1) % patrolPoints.length]

    const dx = next.x - current.x
    const dy = next.y - current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < speed) {
      return { x: 0, y: 0, nextPoint: (position + 1) % patrolPoints.length }
    }

    return {
      x: (dx / distance) * speed,
      y: (dy / distance) * speed,
      nextPoint: position,
    }
  }

  return { moveTowardsPlayer, wander, patrol }
}
```

### Использование в render loop

```typescript
const { moveTowardsPlayer } = useEnemyAI()

// В render loop:
const enemies = getEntitiesByType('enemy')
enemies.forEach((enemy) => {
  if (playerId && world.value) {
    const player = entities.value.get(playerId)
    if (player) {
      const movement = moveTowardsPlayer(
        enemy.body.position.x,
        enemy.body.position.y,
        player.body.position.x,
        player.body.position.y,
        3 // speed
      )

      Matter.Body.applyForce(enemy.body, enemy.body.position, {
        x: movement.x,
        y: movement.y,
      })
    }
  }
})
```

---

## 🎯 Следующие Шаги

1. Комбинируйте эти примеры для создания полноценной игры
2. Добавьте UI слой для отображения статистики
3. Реализуйте сохранение прогресса
4. Оптимизируйте производительность для больших уровней
5. Добавьте звук и музыку

---

**Счастливой разработки!** 🚀
