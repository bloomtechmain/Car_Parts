/* Session flag shared by the preloader and the home hero */
const KEY = 'cpf-intro-seen';

export function introSeen(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** True while the intro is (or is about to be) on screen — lets the hero hold its entrance. */
export function introPending(): boolean {
  return !introSeen();
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* private mode — the intro just shows again next time */
  }
}
