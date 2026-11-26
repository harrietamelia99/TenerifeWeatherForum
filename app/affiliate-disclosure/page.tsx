import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description:
    'Which links on Tenerife Weather Forum are affiliate links, who we work with and how we earn commission.',
  alternates: { canonical: 'https://www.tenerifeweatherforum.com/affiliate-disclosure' },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='mb-10'>
      <h2 className='text-lg font-bold mb-3' style={{ color: 'var(--color-deep)' }}>{title}</h2>
      <div className='space-y-3 text-sm leading-relaxed' style={{ color: 'var(--color-text-muted)' }}>
        {children}
      </div>
    </div>
  );
}

const partners = [
  { name: 'Booking.com', what: 'hotels and other places to stay' },
  { name: 'Skyscanner', what: 'flight comparison' },
  { name: 'Holiday Extras', what: 'airport parking, transfers, lounges, hotels and car hire' },
  { name: 'GetYourGuide', what: 'tours, tickets and activities' },
];

export default function AffiliateDisclosurePage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div
        className='px-6 py-16 text-center'
        style={{ background: 'linear-gradient(160deg, #9fe7f5 0%, #429ebd 45%, #053f5c 100%)' }}
      >
        <p className='text-xs font-semibold uppercase tracking-widest text-white/60 mb-3'>Legal</p>
        <h1 className='text-3xl sm:text-4xl font-bold text-white mb-3'>Affiliate Disclosure</h1>
        <p className='text-white/70 text-sm'>Last updated: November 2026</p>
      </div>

      <div className='max-w-3xl mx-auto px-4 sm:px-6 py-14'>
        <Section title='In short'>
          <p>
            Some of the links on Tenerife Weather Forum are affiliate links. If you click one and book or buy
            something, the company may pay us a small commission. It does not cost you anything extra and it does
            not change the price you pay.
          </p>
          <p>
            That commission helps pay for the running of the site. Weather forecasts and guides stay free to read.
          </p>
        </Section>

        <Section title='Who we work with'>
          <p>We currently earn commission from these companies:</p>
          <ul className='list-disc list-inside space-y-1.5 pl-1'>
            {partners.map((p) => (
              <li key={p.name}>
                <strong style={{ color: 'var(--color-deep)' }}>{p.name}</strong> - {p.what}
              </li>
            ))}
          </ul>
          <p>
            Some of these programmes run through affiliate networks (CJ, Impact and Awin), which pass the booking
            details we need to be paid back to us. We never see your payment details or the personal information you
            give to the company you book with.
          </p>
        </Section>

        <Section title='How you can spot an affiliate link'>
          <p>
            Pages with affiliate links say so near the top of the page, and the buttons and banners that lead to a
            partner say &quot;Affiliate link&quot; underneath. On social media and in WhatsApp we mark these posts
            with #ad.
          </p>
        </Section>

        <Section title='How we choose what to feature'>
          <p>
            We write about areas, activities and travel options because we think they are useful to visitors. Being
            an affiliate does not mean a company has paid to be reviewed or has any say in what we write. We are
            independent of the companies we link to and are not endorsed by them.
          </p>
        </Section>

        <Section title='Cookies on partner sites'>
          <p>
            When you click an affiliate link, the partner or its affiliate network may set a cookie on your device so
            that your booking can be linked back to us. These cookies are set by them, not by us, and are only used
            for a limited time set by each company. See our{' '}
            <Link href='/privacy' className='underline hover:opacity-80' style={{ color: 'var(--color-mid)' }}>
              Privacy Policy
            </Link>{' '}
            for the details and for how to manage cookies.
          </p>
        </Section>

        <Section title='Questions'>
          <p>
            If anything here is unclear, email us at{' '}
            <a
              href='mailto:hello@tenerifeweatherforum.com'
              className='underline hover:opacity-80'
              style={{ color: 'var(--color-mid)' }}
            >
              hello@tenerifeweatherforum.com
            </a>
            .
          </p>
        </Section>

        <div className='pt-4 border-t' style={{ borderColor: 'var(--color-border)' }}>
          <Link href='/' className='text-sm font-semibold hover:opacity-80 transition-opacity' style={{ color: 'var(--color-mid)' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
