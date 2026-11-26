// Cookie consent helpers shared by the cookie bar, the Analytics loader and the footer link.
// The choice is stored in this browser only. The old 'cookie-consent' key (from the
// previous 'Got it' bar) is deliberately ignored so everyone is asked again.

export const CONSENT_KEY = 'twf-cookie-consent';
export const CONSENT_EVENT = 'twf-consent-change';
export const OPEN_SETTINGS_EVENT = 'twf-open-cookie-settings';

export type ConsentValue = 'accepted' | 'rejected';

export function readConsent(): ConsentValue | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'accepted' || v === 'rejected' ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage blocked: the choice just applies to this page view.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}
