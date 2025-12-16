/**
 * Система управления вводом для изометрической игры
 */

import { ref } from 'vue'
import type { Ref } from 'vue'

export interface InputState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  space: boolean
}

export function useGameInput(): {
  state: Ref<InputState>
  getDirection: () => { x: number; y: number }
} {
  const state = ref<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
  })

  function handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    switch (key) {
      case 'w':
      case 'arrowup':
        state.value.up = true
        break
      case 's':
      case 'arrowdown':
        state.value.down = true
        break
      case 'a':
      case 'arrowleft':
        state.value.left = true
        break
      case 'd':
      case 'arrowright':
        state.value.right = true
        break
      case ' ':
        state.value.space = true
        event.preventDefault()
        break
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    switch (key) {
      case 'w':
      case 'arrowup':
        state.value.up = false
        break
      case 's':
      case 'arrowdown':
        state.value.down = false
        break
      case 'a':
      case 'arrowleft':
        state.value.left = false
        break
      case 'd':
      case 'arrowright':
        state.value.right = false
        break
      case ' ':
        state.value.space = false
        break
    }
  }

  /**
   * Получить вектор направления движения (-1, 0, или 1 по каждой оси)
   */
  function getDirection(): { x: number; y: number } {
    let x = 0
    let y = 0

    if (state.value.right) x += 1
    if (state.value.left) x -= 1
    if (state.value.down) y += 1
    if (state.value.up) y -= 1

    return { x, y }
  }

  // Добавляем слушатели при создании
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  }

  // Очистка (вызовите в onBeforeUnmount)
  return {
    state,
    getDirection,
  }
}
