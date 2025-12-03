import { ref, onMounted, onBeforeUnmount } from 'vue'
import Matter from 'matter-js'

export interface PhysicsOptions {
  gravity?: number
  friction?: number
}

export function usePhysics(options: PhysicsOptions = {}) {
  const {
    gravity = 1,
    friction = 0.8
  } = options

  const engine = ref<Matter.Engine | null>(null)
  const world = ref<Matter.World | null>(null)
  const bodies = ref<Matter.Body[]>([])

  const initPhysics = () => {
    // Create engine
    engine.value = Matter.Engine.create()
    world.value = engine.value.world
    world.value.gravity.y = gravity

    // Start engine loop
    const runner = Matter.Runner.create()
    Matter.Runner.run(runner, engine.value)
  }

  const createBody = (options: Matter.IBodyDefinition) => {
    if (!world.value) return null
    const body = Matter.Body.create({
      ...options,
      friction,
    })
    Matter.World.add(world.value, body)
    bodies.value.push(body)
    return body
  }

  const createCircle = (x: number, y: number, radius: number) => {
    if (!world.value) return null
    const circle = Matter.Bodies.circle(x, y, radius, {
      restitution: 0.9,
      friction,
    })
    Matter.World.add(world.value, circle)
    bodies.value.push(circle)
    return circle
  }

  const createRectangle = (x: number, y: number, width: number, height: number) => {
    if (!world.value) return null
    const rect = Matter.Bodies.rectangle(x, y, width, height, {
      restitution: 0.8,
      friction,
    })
    Matter.World.add(world.value, rect)
    bodies.value.push(rect)
    return rect
  }

  const removeBody = (body: Matter.Body) => {
    if (!world.value) return
    Matter.World.remove(world.value, body)
    bodies.value = bodies.value.filter(b => b.id !== body.id)
  }

  const clear = () => {
    if (!world.value) return
    bodies.value.forEach(body => {
      Matter.World.remove(world.value!, body)
    })
    bodies.value = []
  }

  onMounted(() => {
    initPhysics()
  })

  onBeforeUnmount(() => {
    if (engine.value) {
      Matter.Engine.clear(engine.value)
    }
  })

  return {
    engine,
    world,
    bodies,
    createBody,
    createCircle,
    createRectangle,
    removeBody,
    clear,
  }
}
