/**
 * Менеджер сцены для управления объектами в игре
 */

import { ref } from 'vue'
import type { Ref } from 'vue'
import Matter from 'matter-js'

export interface GameEntity {
  id: string
  body: Matter.Body
  type: 'player' | 'enemy' | 'obstacle' | 'prop'
  isActive: boolean
}

export function useSceneManager() {
  const entities = ref<Map<string, GameEntity>>(new Map())
  let entityIdCounter = 0

  /**
   * Добавить сущность в сцену
   */
  function addEntity(
    body: Matter.Body,
    type: GameEntity['type'] = 'prop'
  ): string {
    const id = `entity_${entityIdCounter++}`
    const entity: GameEntity = {
      id,
      body,
      type,
      isActive: true,
    }
    entities.value.set(id, entity)
    return id
  }

  /**
   * Удалить сущность из сцены
   */
  function removeEntity(id: string, world: Matter.World) {
    const entity = entities.value.get(id)
    if (entity) {
      Matter.World.remove(world, entity.body)
      entities.value.delete(id)
    }
  }

  /**
   * Получить сущность по ID
   */
  function getEntity(id: string): GameEntity | undefined {
    return entities.value.get(id)
  }

  /**
   * Получить все сущности определённого типа
   */
  function getEntitiesByType(type: GameEntity['type']): GameEntity[] {
    const result: GameEntity[] = []
    entities.value.forEach((entity) => {
      if (entity.type === type && entity.isActive) {
        result.push(entity)
      }
    })
    return result
  }

  /**
   * Очистить все сущности
   */
  function clear(world: Matter.World) {
    entities.value.forEach((entity) => {
      Matter.World.remove(world, entity.body)
    })
    entities.value.clear()
  }

  /**
   * Получить количество активных сущностей
   */
  function getEntityCount(): number {
    let count = 0
    entities.value.forEach((entity) => {
      if (entity.isActive) count++
    })
    return count
  }

  return {
    entities: entities as Ref<Map<string, GameEntity>>,
    addEntity,
    removeEntity,
    getEntity,
    getEntitiesByType,
    clear,
    getEntityCount,
  }
}
