// ============================================================
// [FILE: core/js/cookie.js]
// ============================================================

import { config } from '../game/js/config.js';

const COOKIE_ACCEPT_KEY = config.STORAGE_KEY + '_cookie_accepted';
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