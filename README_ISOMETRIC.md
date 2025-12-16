# 🎮 Vue + Matter.js - Изометрическая Игровая Основа

Готовая архитектура для разработки изометрических 2D игр с физическим движком на Vue 3 + TypeScript.

[![Vue 3](https://img.shields.io/badge/Vue-3.5.25-green?logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org)
[![Matter.js](https://img.shields.io/badge/Matter.js-0.20-orange)](https://brm.io/matter-js/)
[![Vite](https://img.shields.io/badge/Vite-7.2-purple?logo=vite)](https://vitejs.dev)

## ✨ Особенности

- ✅ **Изометрическая проекция** - готовая система преобразования координат
- ✅ **Matter.js интеграция** - полнофункциональный 2D физический движок
- ✅ **Vue 3 + Composition API** - современная архитектура
- ✅ **TypeScript** - полная поддержка типов
- ✅ **Game Loop** - оптимизированный через requestAnimationFrame
- ✅ **Система управления сущностями** - менеджер объектов на сцене
- ✅ **Система ввода** - поддержка WASD и стрелок
- ✅ **Высокий DPI** - поддержка Retina дисплеев

## 🚀 Быстрый Старт

```bash
# Клонировать репозиторий
git clone <repo>
cd vue-matterjs

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Открыть http://localhost:5174
```

## 📁 Структура Проекта

```
src/
├── components/
│   └── GamePhysics.vue               # Главный компонент с отрисовкой
├── composables/
│   ├── useGamePhysics.ts            # Matter.js движок
│   ├── useIsometricProjection.ts    # Система координат
│   ├── useGameInput.ts              # Управление игроком
│   └── useSceneManager.ts           # Менеджер объектов
├── pages/
│   └── index.vue                    # Главная страница
└── style.css                        # Глобальные стили
```

## 🎯 Основные Компоненты

### useGamePhysics
Инициализация и управление Matter.js:
```typescript
const { engine, world, runner, setGravity, getGravity } = useGamePhysics()
```

### useIsometricProjection
Преобразование координат между системами:
```typescript
const iso = useIsometricProjection({
  tileWidth: 64,
  tileHeight: 32,
  offsetX: 0,
  offsetY: 80,
})

const screenPos = iso.worldToScreen(worldX, worldY)
```

### useGameInput
Обработка пользовательского ввода:
```typescript
const { getDirection } = useGameInput()
const direction = getDirection()  // { x: -1|0|1, y: -1|0|1 }
```

### useSceneManager
Управление объектами на сцене:
```typescript
const { addEntity, entities, removeEntity, getEntitiesByType } = useSceneManager()

const playerId = addEntity(playerBody, 'player')
const enemies = getEntitiesByType('enemy')
```

## 🛠️ Доступные Команды

```bash
npm run dev          # Запустить dev сервер
npm run build        # Production build
npm run preview      # Предпросмотр build версии
npm run type-check   # Проверка типов TypeScript
```

## 📚 Документация

- **[GAME_ARCHITECTURE.md](./GAME_ARCHITECTURE.md)** - Полная архитектура системы
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Гайд для разработчиков (примеры, советы)

## 💡 Примеры

### Добавить препятствие

```typescript
const obstacle = Matter.Bodies.rectangle(
  5 * TILE_W,
  3 * TILE_H,
  TILE_W,
  TILE_H,
  { isStatic: true }
)
addEntity(obstacle, 'obstacle')
if (world.value) {
  Matter.World.add(world.value, obstacle)
}
```

### Добавить врага

```typescript
const enemy = Matter.Bodies.circle(10 * TILE_W, 8 * TILE_H, 15)
const enemyId = addEntity(enemy, 'enemy')
if (world.value) {
  Matter.World.add(world.value, enemy)
}
```

### Отключить гравитацию

```typescript
const { setGravity } = useGamePhysics()
setGravity(0, 0)  // Для Diablo-подобных игр
```

## 🎮 Управление

| Клавиша | Действие |
|---------|----------|
| W | Вверх |
| A | Влево |
| S | Вниз |
| D | Вправо |
| ↑↓←→ | Альтернативное управление |

## 🐛 Возможные Проблемы

### Объект не отображается
- Проверьте, добавили ли вы `Matter.World.add(world.value, body)`
- Убедитесь в координатах (не слишком ли они далеко)

### Объект падает
- Установите `isStatic: true` для неподвижных объектов
- Или отключите гравитацию: `setGravity(0, 0)`

### TypeScript ошибки
```bash
npm run type-check
```

## 📦 Зависимости

- **vue@^3.5.0** - Vue фреймворк
- **matter-js@^0.20** - Physics engine
- **@types/matter-js@^0.20** - TypeScript типы
- **typescript@~5.9** - TypeScript компилятор
- **vite@^7.2** - Build tool
- **unplugin-vue-router@^0.18** - Auto routing
- **unplugin-auto-import@^20.3** - Auto imports

## 🚦 Performance

- ✅ Поддержка высокого DPI (Retina)
- ✅ Оптимизированный game loop
- ✅ Кэширование преобразований координат
- ⚠️ Лучше держать < 500 bodies для 60 FPS

## 📝 Лицензия

MIT

## 🤝 Контрибьюции

Приветствуются PR и баг-репорты!

---

**Начните разработку изометрической игры прямо сейчас!** 🎮✨
