/* =========================================
   MĀT — cookie.js
   GDPR consent management
   ========================================= */

const CONSENT_KEY  = 'mat_cookie_consent';
const CONSENT_DAYS = 180;

function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.expires || Date.now() > data.expires) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveConsent(choices) {
  const data = {
    essential:  true,
    analytics:  !!choices.analytics,
    marketing:  !!choices.marketing,
    date:       new Date().toISOString(),
    expires:    Date.now() + CONSENT_DAYS * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
  return data;
}

/* --- Banner show / hide --- */
const banner = document.getElementById('cookie-banner');

function showBanner() {
  if (!banner) return;
  banner.style.display = '';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add('visible'));
  });
}

function hideBanner() {
  if (!banner) return;
  banner.classList.remove('visible');
  banner.addEventListener('transitionend', () => {
    banner.style.display = 'none';
  }, { once: true });
}

/* --- Settings panel toggle --- */
const barEl      = document.getElementById('cookie-bar');
const settingsEl = document.getElementById('cookie-settings');

function openSettings() {
  if (!barEl || !settingsEl) return;
  barEl.hidden      = true;
  settingsEl.hidden = false;

  /* load current prefs into toggles */
  const consent = getConsent();
  const analyticsToggle  = document.getElementById('toggle-analytics');
  const marketingToggle  = document.getElementById('toggle-marketing');
  if (analyticsToggle)  analyticsToggle.checked  = consent ? !!consent.analytics  : false;
  if (marketingToggle)  marketingToggle.checked   = consent ? !!consent.marketing  : false;
}

function closeSettings() {
  if (!barEl || !settingsEl) return;
  barEl.hidden      = false;
  settingsEl.hidden = true;
}

/* --- Accept handlers --- */
function acceptAll() {
  saveConsent({ analytics: true, marketing: true });
  hideBanner();
}

function acceptEssential() {
  saveConsent({ analytics: false, marketing: false });
  hideBanner();
}

function saveSettings() {
  const analyticsToggle = document.getElementById('toggle-analytics');
  const marketingToggle = document.getElementById('toggle-marketing');
  saveConsent({
    analytics: analyticsToggle ? analyticsToggle.checked : false,
    marketing: marketingToggle ? marketingToggle.checked : false,
  });
  hideBanner();
}

/* --- Wire up buttons --- */
document.addEventListener('DOMContentLoaded', () => {
  const btnOpenSettings  = document.getElementById('cookie-open-settings');
  const btnEssential     = document.getElementById('cookie-essential');
  const btnAcceptAll     = document.getElementById('cookie-accept-all');
  const btnBack          = document.getElementById('cookie-back');
  const btnSaveSettings  = document.getElementById('cookie-save-settings');
  const btnAcceptAll2    = document.getElementById('cookie-accept-all-2');
  const btnFooterCookies = document.getElementById('footer-open-cookies');

  if (btnOpenSettings) btnOpenSettings.addEventListener('click', openSettings);
  if (btnEssential)    btnEssential.addEventListener('click', acceptEssential);
  if (btnAcceptAll)    btnAcceptAll.addEventListener('click', acceptAll);
  if (btnBack)         btnBack.addEventListener('click', closeSettings);
  if (btnSaveSettings) btnSaveSettings.addEventListener('click', saveSettings);
  if (btnAcceptAll2)   btnAcceptAll2.addEventListener('click', acceptAll);

  if (btnFooterCookies) {
    btnFooterCookies.addEventListener('click', () => {
      closeSettings();
      showBanner();
    });
  }

  /* Show on first visit (delay so page load feels smooth) */
  if (!getConsent()) {
    setTimeout(showBanner, 900);
  }
});
