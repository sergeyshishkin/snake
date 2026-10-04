// ============================================================
// [FILE: core/js/intro.js]
// ============================================================

import { config } from '../../game/js/config.js';
import { $ } from './dom.js';

const ACCEPT_KEY_SUFFIX = '_intro_accepted';
const HIDE_ANIMATION_MS = 350;


export function createIntro({ onAccept }) {

  const modal     = $.introModal;
  const acceptBtn = $.introAccept;

  const acceptKey = config.STORAGE_KEY + ACCEPT_KEY_SUFFIX;

  let alreadyAccepted = false;
  /*try {
    alreadyAccepted = localStorage.getItem(acceptKey) === '1';
  } catch (e) {
    alreadyAccepted = false;
  }
*/

  function hideModal() {
    modal.classList.add('hidden');
    setTimeout(() => {
      modal.style.display = 'none';
    }, HIDE_ANIMATION_MS);
  }


  function accept() {
    try {
      localStorage.setItem(acceptKey, '1');
    } catch (e) {}

    hideModal();
    onAccept();
  }


  function init() {
    if (alreadyAccepted) {
      modal.style.display = 'none';
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