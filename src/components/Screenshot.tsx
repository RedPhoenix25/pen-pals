"use client";

interface ScreenshotProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  fallback: React.ReactNode;
  className?: string;
}

export function Screenshot({ src, alt, width, height, fallback, className }: ScreenshotProps) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className || 'landing-screenshot'}
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          el.style.display = 'none';
          const sib = el.nextElementSibling as HTMLElement | null;
          if (sib) sib.style.display = 'block';
        }}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      {/* Fallback SVG — hidden unless the img fails to load */}
      <div
        style={{
          display: 'none',
          width: '100%',
          borderRadius: 12,
          border: '1px solid rgba(41, 37, 36, 0.9)',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {fallback}
      </div>
    </div>
  );
}
