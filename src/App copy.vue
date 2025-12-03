<script setup lang="ts">
import { ref } from 'vue'
import Matter from 'matter-js'
import PhysicsCanvas from './components/PhysicsCanvas.vue'

const engine = ref<Matter.Engine | null>(null)
const world = ref<Matter.World | null>(null)

const handleCanvasReady = (e: Matter.Engine, w: Matter.World) => {
  engine.value = e
  world.value = w
  
  // Add some initial bodies
  addRandomBodies(5)
}

const addRandomBodies = (count: number) => {
  if (!world.value) return

  for (let i = 0; i < count; i++) {
    const size = Math.random() * 30 + 20
    const x = Math.random() * 700 + 50
    const y = Math.random() * 200 + 50

    const isCircle = Math.random() > 0.5

    if (isCircle) {
      const circle = Matter.Bodies.circle(x, y, size / 2, {
        restitution: 0.9,
        friction: 0.5,
        label: 'circle',
      })
      Matter.World.add(world.value, circle)
    } else {
      const rect = Matter.Bodies.rectangle(x, y, size, size, {
        restitution: 0.8,
        friction: 0.5,
        label: 'rectangle',
      })
      Matter.World.add(world.value, rect)
    }
  }
}

const addBody = () => {
  addRandomBodies(1)
}

const clearBodies = () => {
  if (!world.value) return
  
  // Remove all non-static bodies
  world.value.bodies.forEach(body => {
    if (!body.isStatic) {
      Matter.World.remove(world.value!, body)
    }
  })
}
</script>

<template>
  <div class="app">
    <PhysicsCanvas @ready="handleCanvasReady" :width="800" :height="600" :gravity="1" />
    
    <div class="controls">
      <h1>Vue + Matter.js</h1>
      <p>Physics Simulation Demo</p>
      <div class="button-group">
        <button @click="addBody" class="btn btn-primary">Add Body</button>
        <button @click="clearBodies" class="btn btn-secondary">Clear</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 100;
  backdrop-filter: blur(10px);
}

.controls h1 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 24px;
}

.controls p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 2px solid #ddd;
}

.btn-secondary:hover {
  background: #e8e8e8;
  border-color: #999;
}
</style>
