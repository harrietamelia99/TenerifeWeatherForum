'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { CONSENT_EVENT, readConsent, type ConsentValue } from '@/lib/consent';

// Google Analytics only loads after the visitor presses Accept on the cookie bar.
// Until then, and for anyone who rejects, no Analytics script or cookie is used.
export default function AnalyticsLoader({ gaId }: { gaId: string }) {
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    setConsent(readConsent());
    function onChange() {
      setConsent(readConsent());
    }
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  // If someone changes their mind after accepting, stop sending data and clear the cookies.
  useEffect(() => {
    if (consent !== 'rejected') return;
    (window as any)['ga-disable-' + gaId] = true;
    const host = window.location.hostname;
    const parts = host.split('.');
    const roots = [host, '.' + host, '.' + parts.slice(-2).join('.')];
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        roots.forEach((d) => {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d;
        });
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      }
    });
  }, [consent, gaId]);

  if (consent !== 'accepted') return null;

  return (
    <>
      <Script src={'https://www.googletagmanager.com/gtag/js?id=' + gaId} strategy='afterInteractive' />
      <Script id='google-analytics' strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
