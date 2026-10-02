index.html
   │
   ├── css/base.css
   ├── css/layout.css
   ├── css/controls.css
   ├── css/overlays.css
   ├── css/cookie.css
   │
   └── js/main.js
         │
         ├── js/config.js
         │     (только константы, ни от чего не зависит)
         │
         ├── js/player-limits.js
         │     → зависит от config.js
         │
         ├── js/game.js
         │     → config.js
         │     → player-limits.js
         │     → renderers/food.js
         │     → renderers/snake.js
         │           → assets/sushi.js
         │
         ├── js/ui.js
         │     → player-limits.js  (для getRemainingMs)
         │
         ├── js/cookie.js
         │     → ничего (только localStorage)
         │
         └── js/controls/
               ├── dpad.js     → ничего (получает game через callback)
               ├── keyboard.js → ничего
               └── swipe.js    → ничего