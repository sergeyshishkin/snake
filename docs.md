# Граф зависимостей проекта

Документ описывает структуру модулей, слои абстракции и поток данных
между файлами. Помогает понять, что от чего зависит и куда лезть,
когда нужно что-то изменить.


## Слои абстракции

Проект разделён на четыре слоя. Файлы нижних слоёв не знают о файлах
верхних. Это упрощает отладку: если что-то сломалось в игровой логике,
вы смотрите только на `game.js` и его зависимости, а не на весь проект.


### Слой 0 — данные

Файлы, которые ничего не импортируют. Только константы, объекты, ссылки.
Их можно читать без контекста остального проекта.

- `config.js` — все настройки (лимит, скорость, размер поля).
- `state.js` — единый объект состояния приложения.
- `dom.js` — ссылки на DOM-элементы.
- `assets/sushi.js` — данные еды (Path2D-слои).


### Слой 1 — службы

Каждый модуль делает одну вещь. Не знают друг о друге и о `game.js`.

- `player-limits.js` — зависит от `config.js`. Анонимный ID, дневной лимит,
  best score.
- `renderers/snake.js` — ни от чего не зависит. Рисует змейку.
- `renderers/food.js` — зависит от `assets/sushi.js`. Рисует еду.
- `cookie.js` — ни от чего не зависит. Управляет cookie-баннером.
- `controls/dpad.js` — ни от чего не зависит. Обрабатывает кнопки ▲▼◀▶.
- `controls/keyboard.js` — ни от чего не зависит. Обрабатывает клавиатуру.
- `controls/swipe.js` — ни от чего не зависит. Обрабатывает свайпы.


### Слой 2 — движок

Здесь появляется логика. Два модуля не знают друг о друге напрямую.

- `game.js` — зависит от `config.js`, `player-limits.js`,
  `renderers/snake.js`, `renderers/food.js`. Игровая логика: змейка,
  еда, тики, коллизии.
- `ui.js` — зависит от `state.js`, `dom.js`, `player-limits.js`.
  Единственная функция `render()` читает `state` и обновляет DOM.


### Слой 3 — сборка

Единственное место, где слои пересекаются.

- `main.js` — импортирует всё вышеперечисленное. Создаёт объекты,
  передаёт колбэки, вызывает `updateState({...}, ui)`.


## Таблица зависимостей

| Файл | Импортирует из | Кто его импортирует |
|---|---|---|
| `config.js` | — | `game.js`, `player-limits.js` |
| `state.js` | — | `ui.js`, `main.js` |
| `dom.js` | — | `ui.js`, `main.js` |
| `assets/sushi.js` | — | `renderers/food.js` |
| `player-limits.js` | `config.js` | `ui.js`, `game.js`, `main.js` |
| `renderers/snake.js` | — | `game.js` |
| `renderers/food.js` | `assets/sushi.js` | `game.js` |
| `game.js` | `config.js`, `player-limits.js`, `renderers/*` | `main.js` |
| `ui.js` | `state.js`, `dom.js`, `player-limits.js` | `main.js` |
| `cookie.js` | — | `main.js` |
| `controls/dpad.js` | — | `main.js` |
| `controls/keyboard.js` | — | `main.js` |
| `controls/swipe.js` | — | `main.js` |
| `main.js` | всё вышеперечисленное | — (точка входа) |


## Правила, которые действуют

### Никто, кроме `ui.js`, не трогает DOM

`game.js`, `controls/*`, `player-limits.js` не знают о существовании DOM.
Они возвращают данные через колбэки, а `main.js` передаёт их в `state`.

### Никто, кроме `main.js`, не меняет `state`

`state` экспортируется как объект, но менять его поля напрямую из модулей
нельзя. Только через `updateState({...}, ui)` в `main.js`. Это гарантирует,
что после каждого изменения вызывается `render()`.

### DOM-ссылки — только из `dom.js`

`getElementById` встречается только в `dom.js`. Если ID элемента
в `index.html` изменился — правится одна строка в `dom.js`.

### Обратные вызовы — только через колбэки

`game.js` не знает о `ui.js`. Он вызывает `callbacks.onScore(score)`,
а `main.js` решает, что с этим делать.


## Поток данных: четыре примера


### Пример 1. Игрок нажал кнопку ▲

1. `controls/dpad.js` ловит `pointerdown`, вызывает `onDirection('UP')`.
2. `main.js → handleDirection('UP')` проверяет состояние, вызывает
   `game.setDirection('UP')`.
3. `game.js` сохраняет `nextDir = 'UP'`. На следующем тике змейка
   повернёт вверх.

DOM не трогается, `state` не меняется, `render()` не вызывается.
Кнопка визуально «нажата» через CSS `:active`.


### Пример 2. Змейка съела суши

1. `game.js → tick()` обнаружил `willEat`, вызывает `callbacks.onScore(5)`.
2. `main.js` вызывает `updateState({ score: 5 }, ui)`.
3. `updateState` копирует поля в `state` и вызывает `ui.render()`.
4. `ui.render()` читает `state.score = 5`, пишет в `$.score.textContent = 5`.

Одно место (`updateState`) меняет состояние. Одно место (`ui.render`)
обновляет DOM.


### Пример 3. Игрок проиграл

1. `game.js → end('wall')` вызывает `callbacks.onGameOver({ win: false, score: 12 })`.
2. `main.js` вызывает `updateBestScore(12)` из `player-limits.js`.
3. Если рекорд побит — `updateState({ ...bestScore: 12 }, ui)`.
4. `updateState` также устанавливает `gameOver: true`, `panelMode: 'reset'`.
5. `ui.render()` видит `panelMode === 'reset'`, скрывает timer, показывает
   restart, обновляет bestScore в шапке.

Никаких `ui.showReset()` или `ui.setBestScore(12)` снаружи — всё делает
`render()` по состоянию.


### Пример 4. Игрок закрыл вкладку

1. Срабатывает `window.beforeunload`.
2. `main.js` проверяет `state.gameActive`.
3. Если игра активна — вызывает `flushSession()` из `player-limits.js`.
4. `localStorage` обновлён, время сессии сохранено.

UI не трогается — вкладка закрывается.


## Сравнение «до» и «после»

### До рефакторинга

`main.js` вызывал семь императивных методов UI:

- `ui.setScore(n)`
- `ui.setBestScore(n)`
- `ui.showTimer()`
- `ui.showReset()`
- `ui.showStart()`
- `ui.showLimit()`
- `ui.hideHint()`

Забыли один вызов — UI «залип» в неправильном состоянии. Опечатка
в имени метода (например, `hideReset` вместо `showTimer`) — ошибка
в рантайме при первом же срабатывании.

Плюс `main.js` сам искал DOM: `document.getElementById('resetButton')`
в нескольких местах.


### После рефакторинга

`main.js` вызывает один метод:

- `updateState({...}, ui)` — копирует поля в `state` и вызывает `render()`.

`ui.render()` — единая функция, которая читает `state` и приводит DOM
в соответствие. Забыть что-то обновить невозможно, потому что это одно
место. Опечатка в имени поля `state` — ошибка на этапе чтения кода,
не в рантайме.

`main.js` не ищет DOM — берёт ссылки из `dom.js`.


## Что это даёт на практике

| Задача | Что делать |
|---|---|
| Добавить поле в UI (например, «уровень») | `state.js` → `level: 1`. `dom.js` → `levelSpan`. `ui.js` → строка в `render()`. `main.js` → `updateState({ level: n }, ui)`. Всё. |
| Переименовать ID элемента в HTML | Правится одна строка в `dom.js`. Остальные файлы не трогаются. |
| Забыли обновить UI после события | Невозможно — `updateState` всегда вызывает `render()`. |
| Понять, почему UI в странном виде | Открыть `state.js`, посмотреть значения. Открыть `render()` — увидеть логику. |
| Найти DOM-элемент по ID | Только в `dom.js`. Не нужно искать по всему проекту. |


## Проверка графа

После запуска проекта откройте DevTools → Console:

```javascript
const s = await import('./js/state.js');
console.log('state keys:', Object.keys(s.state));

const d = await import('./js/dom.js');
console.log('dom keys:', Object.keys(d.$));

const u = await import('./js/ui.js');
console.log('ui exports:', Object.keys(u));