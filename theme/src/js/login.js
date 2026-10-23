// Přihlašovací okno (Figma: „Přihlášení“). Okno, formulář i jeho odeslání jsou Disca (#login,
// otevírání přes .toggle-window[data-target="login"], body.login-window-visible, Escape).
// Doplňujeme jen to, co Disco nemá:
//   zavírací křížek a zavření klikem mimo okno (obojí klikne na původní tlačítko Přihlášení,
//   takže Disco okno zavře stejně jako při druhém kliknutí na něj),
//   tlačítko pro zobrazení hesla u polí s heslem.

const OPEN_CLASS = 'login-window-visible';

const LABELS = {
  cs: { close: 'Zavřít', show: 'Zobrazit heslo', hide: 'Skrýt heslo' },
  sk: { close: 'Zavrieť', show: 'Zobraziť heslo', hide: 'Skryť heslo' },
  en: { close: 'Close', show: 'Show password', hide: 'Hide password' },
};

function labels() {
  const lang = (document.documentElement.lang || 'cs').slice(0, 2);
  return LABELS[lang] || LABELS.en;
}

function enhanceLoginDialog() {
  const dialog = document.getElementById('login');
  const inner = dialog?.querySelector('.popup-widget-inner');
  const trigger = document.querySelector('.toggle-window[data-target="login"]');
  if (!inner || !trigger) return;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'as-dialog-close';
  close.setAttribute('aria-label', labels().close);
  close.addEventListener('click', () => trigger.click());
  inner.prepend(close);

  // Ztmavená stránka kolem okna. Tlačítka oken Disca (.toggle-window) a kopie tlačítka
  // Přihlášení v hlavičce okno přepínají sama.
  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains(OPEN_CLASS)) return;
    if (dialog.contains(event.target) || event.target.closest?.('.toggle-window, .as-account-button')) return;
    trigger.click();
  });
}

// Oko v poli s heslem přepíná typ pole (password / text). Hodnotu ani formulář nemění.
function enhancePasswordFields() {
  const text = labels();
  document.querySelectorAll('.form-control-wrapper > input[type="password"]').forEach((input) => {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'as-password-toggle';
    if (input.id) toggle.setAttribute('aria-controls', input.id);
    toggle.setAttribute('aria-label', text.show);
    toggle.setAttribute('aria-pressed', 'false');
    toggle.addEventListener('click', () => {
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(visible));
      toggle.setAttribute('aria-label', visible ? text.hide : text.show);
      input.focus();
    });
    input.after(toggle);
  });
}

export function enhanceLogin() {
  enhanceLoginDialog();
  enhancePasswordFields();
}
