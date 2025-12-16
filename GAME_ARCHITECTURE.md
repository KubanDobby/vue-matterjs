# Архитектура Изометрической Игры

## 📋 Обзор

Проект построен на основе **Vue 3 + TypeScript + Matter.js** для разработки интерактивных 2D игр с изометрической проекцией и физическим движком.

## 🏗️ Структура Composables

### `useGamePhysics.ts`
Управление физическим движком Matter.js:
- Инициализация engine и world
- Установка гравитации
- Автоматическое обновление через Matter.Runner
- Очистка ресурсов

```typescript
const { engine, world, runner, setGravity, getGravity } = useGamePhysics()
```

### `useIsometricProjection.ts`
Система преобразования координат изометрической проекции:

| Функция | Описание |
|---------|---------|
| `gridToScreen(x, y)` | Сетка → Экран |
| `screenToGrid(x, y)` | Экран → Сетка |
| `worldToGrid(x, y)` | Мир физики → Сетка |
| `gridToWorld(x, y)` | Сетка → Мир физики |
| `worldToScreen(x, y)` | Мир физики → Экран (полное преобразование) |

**Формула изометрии:**
- screenX = offsetX + (gridX - gridY) × (tileW / 2)
- screenY = offsetY + (gridX + gridY) × (tileH / 2)

### `useGameInput.ts`
Обработка пользовательского ввода:
- Поддержка WASD и стрелок
- Статус клавиш в реактивном объекте `state`
- Функция `getDirection()` возвращает вектор направления

```typescript
const { getDirection } = useGameInput()
const direction = getDirection() // { x: -1|0|1, y: -1|0|1 }
```

### `useSceneManager.ts`
Менеджер сущностей (entities) на сцене:

```typescript
const { addEntity, entities, removeEntity, getEntity, getEntitiesByType } = useSceneManager()

// Добавить сущность
const playerId = addEntity(playerBody, 'player')

// Получить все враги
const enemies = getEntitiesByType('enemy')
```

**Типы сущностей:** `player`, `enemy`, `obstacle`, `prop`

## 🎮 Компонент GamePhysics.vue

Главный компонент для отрисовки игры:
- Canvas на весь экран
- Поддержка высокого DPI (Retina)
- Основной game loop через `requestAnimationFrame`
- Отрисовка препятствий (ромбы) и игрока (круг)

### Константы:
```typescript
const TILE_W = 64     // Ширина плитки в пикселях
const TILE_H = 32     // Высота плитки в пикселях
const PLAYER_RADIUS = 20
const PLAYER_SPEED = 5
```

### Game Loop:
1. Получить входные команды
2. Применить силу к игроку
3. Очистить экран
4. Отрисовать все сущности в изометрии
5. Показать информацию (FPS, Count, Direction)

## 🚀 Быстрый Старт

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Проверить типы
npm run type-check

# Production build
npm run build
```

## 🎯 Примеры Использования

### Добавить новое препятствие

```typescript
const box = Matter.Bodies.rectangle(
  10 * TILE_W,  // grid X
  5 * TILE_H,   // grid Y
  TILE_W,
  TILE_H,
  { isStatic: true }
)
addEntity(box, 'obstacle')
if (world.value) {
  Matter.World.add(world.value, box)
}
```

### Добавить врага (динамическое тело)

```typescript
const enemy = Matter.Bodies.circle(
  15 * TILE_W,
  10 * TILE_H,
  15
)
const enemyId = addEntity(enemy, 'enemy')
if (world.value) {
  Matter.World.add(world.value, enemy)
}

// Позже в render loop:
const enemies = getEntitiesByType('enemy')
enemies.forEach(enemy => {
  // Логика движения врага
})
```

### Пример отрисовки сущности

```typescript
entities.value.forEach((entity) => {
  const screenPos = iso.worldToScreen(
    entity.body.position.x,
    entity.body.position.y
  )

  ctx.fillStyle = '#FF0000'
  ctx.fillRect(screenPos.x - 16, screenPos.y - 16, 32, 32)
})
```

## 🔧 Советы и Трюки

### Отключить гравитацию для Diablo-подобных игр

```typescript
const { setGravity } = useGamePhysics()

onMounted(() => {
  setGravity(0, 0)  // Нет гравитации
})
```

### Сделать объект неподвижным

```typescript
const staticBody = Matter.Bodies.rectangle(x, y, w, h, {
  isStatic: true  // Не движется, не падает
})
```

### Применить импульс (вместо силы)

```typescript
Matter.Body.applyForce(body, body.position, { x: 10, y: 0 })
// Или более мощный импульс:
Matter.Body.setVelocity(body, { x: 5, y: 5 })
```

## 📊 Performance

- **Canvas масштабирование:** Поддержка высокого DPI через `devicePixelRatio`
- **Entity Limit:** Держите < 500 bodies для 60 FPS
- **Static Bodies:** Используйте для неподвижных объектов (стены, препятствия)
- **Sleeping:** Matter.js автоматически "усыпляет" неподвижные тела

## 🐛 Известные Проблемы

1. **Double Update:** Если появляются ошибки физики, убедитесь, что вы не вызываете `Matter.Engine.update()` вручную (уже есть в `useGamePhysics` через `Matter.Runner`)

2. **Type Assertions:** Иногда Matter.js требует явных типов:
   ```typescript
   { isStatic: true } as Matter.IBodyDefinition
   ```

## 📚 Полезные Ссылки

- [Matter.js Documentation](https://brm.io/matter-js/docs/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Isometric Projection - Wikipedia](https://en.wikipedia.org/wiki/Isometric_projection)

---

**Готово!** Вы можете начать разработку игры. Основа полностью настроена и протестирована.
