/**
 * Renders a `PageContent.content` array (see `@/lib/api/types`, `Block`).
 * The contract only names the block kinds, not their internal shape (see the
 * comment on `Block` in `lib/api/types.ts`), so each renderer below reads
 * `data` defensively — an unexpected/missing field skips that block instead
 * of throwing, since this is content coming from a CMS.
 */

import { Fragment } from 'react';
import type { ReactNode } from 'react';
import type { Block, Image as ApiImageType } from '@/lib/api/types';
import { ApiImage } from '@/components/media/ApiImage';
import { RichText } from './RichText';

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asImage(value: unknown): ApiImageType | null {
  return value && typeof value === 'object' && 'src' in value ? (value as ApiImageType) : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function RichTextBlock({ data }: { data: Record<string, unknown> }) {
  const html = asString(data.html);
  return html ? <RichText html={html} /> : null;
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const image = asImage(data.image);
  if (!image) {
    return null;
  }
  const caption = asString(data.caption);
  return (
    <figure>
      <ApiImage image={image} sizes="100vw" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function ImageTextBlock({ data }: { data: Record<string, unknown> }) {
  const image = asImage(data.image);
  const html = asString(data.html);
  const title = asString(data.title);
  return (
    <section>
      {image && <ApiImage image={image} sizes="(min-width: 768px) 50vw, 100vw" />}
      {title && <h2>{title}</h2>}
      {html && <RichText html={html} />}
    </section>
  );
}

function TimelineBlock({ data }: { data: Record<string, unknown> }) {
  const items = asArray(data.items) as { date?: string; title?: string; description?: string }[];
  if (items.length === 0) {
    return null;
  }
  return (
    <ol>
      {items.map((item, index) => (
        <li key={index}>
          {item.date && <span>{item.date}</span>}
          {item.title && <h3>{item.title}</h3>}
          {item.description && <p>{item.description}</p>}
        </li>
      ))}
    </ol>
  );
}

function FaqBlock({ data }: { data: Record<string, unknown> }) {
  const items = asArray(data.items) as { question?: string; answer?: string }[];
  if (items.length === 0) {
    return null;
  }
  return (
    <dl>
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.question && <dt>{item.question}</dt>}
          {item.answer && <dd>{item.answer}</dd>}
        </Fragment>
      ))}
    </dl>
  );
}

function StatsBlock({ data }: { data: Record<string, unknown> }) {
  const items = asArray(data.items) as { value?: string; label?: string }[];
  if (items.length === 0) {
    return null;
  }
  return (
    <dl>
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.value && <dt>{item.value}</dt>}
          {item.label && <dd>{item.label}</dd>}
        </Fragment>
      ))}
    </dl>
  );
}

function QuoteBlock({ data }: { data: Record<string, unknown> }) {
  const text = asString(data.text);
  if (!text) {
    return null;
  }
  const author = asString(data.author);
  return (
    <blockquote>
      <p>{text}</p>
      {author && <cite>{author}</cite>}
    </blockquote>
  );
}

function CtaBlock({ data }: { data: Record<string, unknown> }) {
  const label = asString(data.label);
  const url = asString(data.url);
  if (!label || !url) {
    return null;
  }
  const title = asString(data.title);
  return (
    <p>
      {title && <strong>{title}</strong>}
      <a href={url}>{label}</a>
    </p>
  );
}

function GalleryBlock({ data }: { data: Record<string, unknown> }) {
  const images = asArray(data.images)
    .map(asImage)
    .filter((image): image is ApiImageType => image !== null);
  if (images.length === 0) {
    return null;
  }
  return (
    <ul>
      {images.map((image) => (
        <li key={image.id}>
          <ApiImage image={image} sizes="(min-width: 768px) 33vw, 100vw" />
        </li>
      ))}
    </ul>
  );
}

const BLOCK_COMPONENTS: Record<string, (props: { data: Record<string, unknown> }) => ReactNode> = {
  rich_text: RichTextBlock,
  image: ImageBlock,
  image_text: ImageTextBlock,
  timeline: TimelineBlock,
  faq: FaqBlock,
  stats: StatsBlock,
  quote: QuoteBlock,
  cta: CtaBlock,
  gallery: GalleryBlock,
};

type BlocksProps = {
  blocks: Block[];
};

export function Blocks({ blocks }: BlocksProps) {
  return (
    <>
      {blocks.map((block, index) => {
        const BlockComponent = BLOCK_COMPONENTS[block.type];
        return BlockComponent ? <BlockComponent key={index} data={block.data} /> : null;
      })}
    </>
  );
}
