/**
 * Composable для работы с изометрической проекцией
 * Преобразование между координатами: сетка <-> экран
 */

interface IsometricConfig {
  tileWidth: number
  tileHeight: number
  offsetX: number
  offsetY: number
}

interface Point {
  x: number
  y: number
}

export function useIsometricProjection(config: IsometricConfig) {
  const { tileWidth, tileHeight, offsetX, offsetY } = config

  /**
   * Преобразует координаты сетки в экранные координаты
   * @param gridX - координата X в сетке
   * @param gridY - координата Y в сетке
   * @returns экранные координаты
   */
  function gridToScreen(gridX: number, gridY: number): Point {
    const screenX = offsetX + (gridX - gridY) * (tileWidth / 2)
    const screenY = offsetY + (gridX + gridY) * (tileHeight / 2)
    return { x: screenX, y: screenY }
  }

  /**
   * Преобразует экранные координаты в координаты сетки
   * @param screenX - координата X на экране
   * @param screenY - координата Y на экране
   * @returns координаты сетки
   */
  function screenToGrid(screenX: number, screenY: number): Point {
    const relX = screenX - offsetX
    const relY = screenY - offsetY

    const gridX = (relX / (tileWidth / 2) + relY / (tileHeight / 2)) / 2
    const gridY = (relY / (tileHeight / 2) - relX / (tileWidth / 2)) / 2

    return { x: gridX, y: gridY }
  }

  /**
   * Преобразует мировые координаты физической системы в координаты сетки
   * @param worldX - координата X в мире физики
   * @param worldY - координата Y в мире физики
   * @returns координаты сетки
   */
  function worldToGrid(worldX: number, worldY: number): Point {
    return {
      x: worldX / tileWidth,
      y: worldY / tileHeight,
    }
  }

  /**
   * Преобразует координаты сетки в мировые координаты физической системы
   * @param gridX - координата X в сетке
   * @param gridY - координата Y в сетке
   * @returns мировые координаты
   */
  function gridToWorld(gridX: number, gridY: number): Point {
    return {
      x: gridX * tileWidth,
      y: gridY * tileHeight,
    }
  }

  /**
   * Полное преобразование: мир физики → экран
   * @param worldX - координата X в мире физики
   * @param worldY - координата Y в мире физики
   * @returns экранные координаты
   */
  function worldToScreen(worldX: number, worldY: number): Point {
    const gridPos = worldToGrid(worldX, worldY)
    return gridToScreen(gridPos.x, gridPos.y)
  }

  return {
    gridToScreen,
    screenToGrid,
    worldToGrid,
    gridToWorld,
    worldToScreen,
  }
}
