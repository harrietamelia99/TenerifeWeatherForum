import { ImageResponse } from 'next/og';

// Share image for the Where to Stay page (shown when the link is shared on Facebook, WhatsApp etc.).
export const runtime = 'edge';
export const alt = 'Where to Stay in Tenerife - Tenerife Weather Forum';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(160deg, #9fe7f5 0%, #429ebd 45%, #053f5c 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, opacity: 0.9 }}>
          Tenerife Weather Forum
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, lineHeight: 1.05 }}>
            Where to Stay in Tenerife
          </div>
          <div style={{ display: 'flex', fontSize: 40, marginTop: 28, opacity: 0.85 }}>
            Compare the main areas by weather and what suits you
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 30, opacity: 0.75 }}>tenerifeweatherforum.com</div>
      </div>
    ),
    { ...size }
  );
}
