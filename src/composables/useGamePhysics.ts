import { ref, onMounted, onBeforeUnmount } from 'vue'
import Matter from 'matter-js'

export function useGamePhysics() {
  const engine = ref<Matter.Engine | null>(null)
  const world = ref<Matter.World | null>(null)
  const runner = ref<Matter.Runner | null>(null)

  /**
   * Инициализация физического движка
   */
  const initGamePhysics = () => {
    // Создание движка
    engine.value = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0.001 },
    })
    // Получение мира из движка
    world.value = engine.value.world

    // Установка гравитации (в изометрических играх часто отключают или минимизируют)
    if (world.value) {
      world.value.gravity.y = 0
      world.value.gravity.x = 0
    }

    // Запуск цикла движка
    runner.value = Matter.Runner.create()
    Matter.Runner.run(runner.value, engine.value)
  }

  /**
   * Установить гравитацию
   */
  function setGravity(x: number, y: number) {
    if (world.value) {
      world.value.gravity.x = x
      world.value.gravity.y = y
    }
  }

  /**
   * Получить текущую гравитацию
   */
  function getGravity() {
    if (world.value) {
      return {
        x: world.value.gravity.x,
        y: world.value.gravity.y,
      }
    }
    return { x: 0, y: 0 }
  }

  onMounted(() => {
    initGamePhysics()
  })

  onBeforeUnmount(() => {
    if (runner.value) {
      Matter.Runner.stop(runner.value)
    }
    if (engine.value) {
      Matter.Engine.clear(engine.value)
    }
  })

  return {
    engine,
    world,
    runner,
    setGravity,
    getGravity,
  }
}
