'use client';

import { OPEN_SETTINGS_EVENT } from '@/lib/consent';

// Footer link that reopens the cookie bar so people can change their choice.
export default function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type='button'
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
    >
      Cookie settings
    </button>
  );
}
