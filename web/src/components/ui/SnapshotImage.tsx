/* eslint-disable @next/next/no-img-element -- miniatura já convertida pela API e guardada no navegador; não há o objeto Image completo para o ApiImage. */
import type { QuoteImage } from '@/lib/quote/types';

/** Decorativa: o nome da peça está sempre ao lado. */
export function SnapshotImage({ image, className }: { image: QuoteImage; className?: string }) {
  return (
    <img
      className={className}
      src={image.src}
      alt=""
      width={120}
      height={90}
      loading="lazy"
      decoding="async"
    />
  );
}
