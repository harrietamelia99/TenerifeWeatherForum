'use client';

import { ArrowRight } from 'lucide-react';

interface Props {
  href: string;
  label: string;
  id: string;
  category: string;
}

// Small text link for an affiliate destination (for example GetYourGuide things to do).
// Fires the same GA4 'affiliate_click' event as the buttons.
export default function TravelTextLink({ href, label, id, category }: Props) {
  if (!href) return null;

  function handleClick() {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'affiliate_click', {
        link_id: id,
        link_name: label,
        link_url: href,
        event_category: category,
      });
    }
  }

  return (
    <a
      href={href}
      target='_blank'
      rel='sponsored nofollow noopener noreferrer'
      onClick={handleClick}
      className='mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-opacity'
      style={{ color: 'var(--color-mid)' }}
    >
      {label} <ArrowRight size={14} className='flex-shrink-0' />
    </a>
  );
}
