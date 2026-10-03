# Структура проекта

Проект разделён на две папки: **core/** — универсальный каркас, **game/** — специфика конкретной игры.

Правило простое: **core/ не трогается** при создании новой игры. Меняется только game/.


## Дерево файлов

- `index.html` — разметка, подключает core и game
- `docs.md` — этот файл
- `core/` — универсальный каркас
  - `core/css/base.css`
  - `core/css/layout.css`
  - `core/css/controls.css`
  - `core/css/overlays.css`
  - `core/js/main.js`
  - `core/js/state.js`
  - `core/js/dom.js`
  - `core/js/ui.js`
  - `core/js/loop.js`
  - `core/js/resize.js`
  - `core/js/lifecycle.js`
  - `core/js/player-limits.js`
  - `core/js/intro.js`
  - `core/js/controls/dpad.js`
  - `core/js/controls/keyboard.js`
  - `core/js/controls/swipe.js`
- `game/` — специфика игры (заменяется)
  - `game/css/theme.css`
  - `game/js/config.js`
  - `game/js/rules.js`
  - `game/js/render.js`
  - `game/js/assets.js`


## index.html

Разметка страницы. Подключает CSS из core/ и game/, загружает core/js/main.js. Содержит шапку со счётом и рекордом, canvas с оверлеями, крестовину, timer, кнопку рестарта, модалку intro (правила + cookie). Тексты и заголовок специфичны для игры и правятся здесь.


## core/ — универсальный каркас

Работает для любой игры. Не знает о правилах, отрисовке, ассетах конкретной игры. Игра передаёт ему rules, render, config через main.js.

**core/ не содержит стилистики.** Никаких цветов, теней, градиентов, шрифтов, свечений. Только структура: позиционирование, размеры, flex/grid, отступы, поведение. Вся визуальная часть — в game/css/theme.css.


### core/css/

- **base.css** — Reset, структурные переменные (--gap-*, --wrapper-pad, --header-h, --bottom-h, --dpad-size, --t-*), html/body без цветов и шрифтов, утилиты .hidden / .visually-hidden, prefers-reduced-motion.
- **layout.css** — Структура каркаса: .game-wrapper (flex, padding, position), .header (flex, min-height), .stat-box (inline-flex, padding, размеры), .canvas-container (фиксированный размер), canvas (width/height, touch-action, cursor).
- **controls.css** — Структура нижней панели: .bottom-row (grid), крестовина .dpad (grid 3×3), .dpad-btn (flex-центрирование, размеры), .timer-box (flex-центрирование, размеры), .btn-reset (flex, padding, размеры). Без цветов и теней.
- **overlays.css** — Структура оверлеев: .touch-hint (позиция, размеры, padding), .intro-modal, .intro-content, .intro-rules, .intro-accept, .rotate-overlay. Анимации только структурные (scale, opacity, rotate), без свечений.


### core/js/

- **main.js** — Точка входа. Создаёт UI, loop, renderer. Связывает все модули. Обрабатывает input.
- **state.js** — Единый объект состояния приложения. Единственное место, где меняются данные UI.
- **dom.js** — Ссылки на DOM-элементы. Проверяет их наличие при загрузке.
- **ui.js** — Единственная функция render(). Читает state, обновляет DOM, переключает body[data-*].
- **loop.js** — Игровой цикл. Вызывает rules.tick() и renderer.render(), следит за лимитом.
- **resize.js** — ResizeObserver для canvas. Синхронизирует внутренние размеры с CSS.
- **lifecycle.js** — Обработчики beforeunload, pagehide, visibilitychange. Сохраняет сессию.
- **player-limits.js** — Анонимный ID игрока, дневной лимит, best score. Хранение в localStorage.
- **intro.js** — Модалка при первом заходе. Правила + cookie-уведомление.


### core/js/controls/

- **dpad.js** — Кнопки направления ▲▼◀▶. Pointer Events с fallback на Touch/Mouse.
- **keyboard.js** — Стрелки, Space, Enter, R.
- **swipe.js** — Свайпы по canvas. Тап = действие, свайп = направление.


## game/ — специфика игры

Здесь всё, что делает каркас конкретной игрой: змейкой, 2048, тетрисом. При создании новой игры эта папка переписывается целиком.

**game/ содержит всю стилистику.** Цвета, градиенты, тени, свечения, скругления, шрифты. Меняешь только эту папку — получаешь свою игру с собственным видом.


### game/css/

- **theme.css** — Вся стилистика игры:
  - `[BLOCK: tokens]` — CSS-переменные: цвета, радиусы, шрифт.
  - `[BLOCK: html-body]` — фон и шрифт страницы.
  - `[BLOCK: game-wrapper]` — фон каркаса.
  - `[BLOCK: header]`, `[BLOCK: stat-box]` — цвета счёта и рекорда.
  - `[BLOCK: canvas]` — фон игрового поля, свечение, скругления.
  - `[BLOCK: dpad-btn]` — цвета кнопок крестовины, градиенты, тени.
  - `[BLOCK: timer-box]` — цвета таймера, состояния warning/danger.
  - `[BLOCK: btn-reset]` — цвета кнопки рестарта.
  - `[BLOCK: touch-hint]` — цвета подсказок, свечения.
  - `[BLOCK: rotate-overlay]` — цвета заглушки.
  - `[BLOCK: intro-modal]`, `[BLOCK: intro-content]`, `[BLOCK: intro-title]`, `[BLOCK: intro-rules]`, `[BLOCK: intro-cookie]`, `[BLOCK: intro-accept]` — стили intro-модалки.


### game/js/

- **config.js** — Настройки: GRID_SIZE, TICK_INTERVAL_MS, DAILY_PLAY_LIMIT_MINUTES, STORAGE_KEY, DEBUG_DISABLE_LIMIT. Предоставляет ядру объект config.
- **rules.js** — Игровая логика: reset(), tick(), setDirection(), getState(), showPreview(). Предоставляет ядру фабрику createRules().
- **render.js** — Отрисовка на canvas: render(state), resize(w, h, grid). Предоставляет ядру фабрику createRenderer(canvas).
- **assets.js** — Данные графики: Path2D, цвета, координаты. Может отсутствовать, если игра рисует процедурно.


## Контракт между core и game

Ядро ожидает от игры три вещи.

**1. config** — объект с полями: GRID_SIZE (размер игрового поля), TICK_INTERVAL_MS (скорость игры), DAILY_PLAY_LIMIT_MINUTES (дневной лимит), STORAGE_KEY (уникальный ключ localStorage).

**2. rules** — объект с методами: reset() (начать новую партию), tick() (один шаг игры, возвращает { event: 'gameover' | 'eat' | null, ... }), setDirection(dir) (сменить направление), getState() (текущее состояние для рендера), showPreview() (состояние для стартового экрана).

**3. renderer** — объект с методами: render(state) (нарисовать кадр), resize(w, h, grid) (обновить размеры).

Всё остальное ядро делает само: лимит, cookie, intro, клавиатура, рекорд, жизненный цикл.


## Что где менять

**Структура (редко):**
- Расположение блоков, размеры, отступы — core/css/*
- Порядок инициализации, склейка модулей — core/js/main.js
- Поведение цикла — core/js/loop.js
- Логика лимитов — core/js/player-limits.js

**Стилистика (часто):**
- Палитра, тени, свечения — game/css/theme.css
- Внешний вид конкретных элементов — game/css/theme.css

**Правила игры (часто):**
- Логика — game/js/rules.js
- Отрисовка — game/js/render.js
- Ассеты — game/js/assets.js
- Константы — game/js/config.js

**Тексты и разметка (по ситуации):**
- Заголовок, подсказки, правила — index.html
- Кнопка в intro-модалке — index.html


## Создание новой игры

1. Кнопка **Use this template** на GitHub.
2. Правите game/js/config.js — меняете STORAGE_KEY, GRID_SIZE, скорость.
3. Переписываете game/js/rules.js — логика игры.
4. Переписываете game/js/render.js — отрисовка.
5. Переписываете game/css/theme.css — вся стилистика под новую игру.
6. Удаляете game/js/assets.js, если графика процедурная.
7. Правите тексты в index.html.
8. git push.

core/ не трогается. Если что-то сломалось — ищите в game/.


## Что менять, если...

- Дневной лимит (минуты) — game/js/config.js
- Скорость игры — game/js/config.js
- Размер игрового поля — game/js/config.js
- Ключ localStorage — game/js/config.js
- Отключить лимит для отладки — game/js/config.js → DEBUG_DISABLE_LIMIT = true
- Правила игры — game/js/rules.js
- Отрисовка — game/js/render.js
- Палитра и стилистика — game/css/theme.css
- Тексты подсказок — index.html
- Тексты intro-модалки — index.html
- Цели Метрики — index.html
- Структура крестовины, размеры кнопок — core/css/controls.css
- Расположение canvas, размеры блоков — core/css/layout.css
- Переменные отступов, размеров — core/css/base.css