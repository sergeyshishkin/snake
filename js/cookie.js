// ============================================================
// [FILE: cookie.js]
// Назначение: управление cookie-баннером и гейт запуска игры
// Правится: при смене текста баннера, политики cookies
// Зависит: ни от чего (получает колбэк извне)
// Экспортирует: createCookieGate
// ============================================================

const COOKIE_ACCEPT_KEY = 'sushi_snake_cookie_accepted_v1';
const HIDE_ANIMATION_MS = 350;


export function createCookieGate({ onAccept }) {

  const banner    = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('cookieAccept');

  let alreadyAccepted = false;
  try {
    alreadyAccepted = localStorage.getItem(COOKIE_ACCEPT_KEY) === '1';
  } catch (e) {
    alreadyAccepted = false;
  }


  function hideBanner() {
    banner.classList.add('hidden');
    setTimeout(() => {
      banner.style.display = 'none';
    }, HIDE_ANIMATION_MS);
  }


  function accept() {
    try {
      localStorage.setItem(COOKIE_ACCEPT_KEY, '1');
    } catch (e) {}

    hideBanner();
    onAccept();
  }


  function init() {
    if (alreadyAccepted) {
      banner.style.display = 'none';
      onAccept();
      return;
    }

    acceptBtn.addEventListener('click', accept);
  }


  return {
    init,
    accept,
    isAccepted: () => alreadyAccepted,
  };
}