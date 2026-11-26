import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import { socialLinks } from '@/lib/socialLinks';

// Facebook page, Instagram and WhatsApp channel icons. Each only shows once its URL is set
// in lib/socialLinks.ts. Styling is passed in so it matches the header, menu or footer.
export default function ExtraSocialLinks({ size, className }: { size: number; className: string }) {
  const items = [
    { href: socialLinks.facebookPage, label: 'Tenerife Weather Forum on Facebook (page)', icon: <Facebook size={size} /> },
    { href: socialLinks.instagram, label: 'Tenerife Weather Forum on Instagram', icon: <Instagram size={size} /> },
    { href: socialLinks.whatsappChannel, label: 'Tenerife Weather Forum WhatsApp channel', icon: <MessageCircle size={size} /> },
  ].filter((i) => i.href);

  return (
    <>
      {items.map((i) => (
        <a
          key={i.label}
          href={i.href}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={i.label}
          className={className}
        >
          {i.icon}
        </a>
      ))}
    </>
  );
}
