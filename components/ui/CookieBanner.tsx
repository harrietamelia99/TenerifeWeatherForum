'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OPEN_SETTINGS_EVENT, readConsent, saveConsent, type ConsentValue } from '@/lib/consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) setVisible(true);
    function reopen() {
      setVisible(true);
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  function choose(value: ConsentValue) {
    saveConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  // Accept and Reject are the same size and style so neither is pushed.
  const buttonClass = 'flex-1 sm:flex-none text-xs font-semibold px-5 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/20';
  const buttonStyle = {
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
  };

  return (
    <div
      className='fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'
      style={{
        background: 'rgba(5,63,92,0.97)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
      role='region'
      aria-label='Cookie settings'
    >
      <p className='text-xs leading-relaxed' style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '780px' }}>
        We use a small cookie to remember your choice. If you accept, we also use Google Analytics cookies to see how the
        site is used. Partner links (Booking.com, Skyscanner, Holiday Extras, GetYourGuide) may set their own cookies
        once you click through to them.{' '}
        <Link href='/privacy' className='underline underline-offset-2 hover:text-white transition-colors'>
          Privacy policy
        </Link>
      </p>
      <div className='flex w-full sm:w-auto gap-3'>
        <button type='button' onClick={() => choose('rejected')} className={buttonClass} style={buttonStyle}>
          Reject
        </button>
        <button type='button' onClick={() => choose('accepted')} className={buttonClass} style={buttonStyle}>
          Accept
        </button>
      </div>
    </div>
  );
}
