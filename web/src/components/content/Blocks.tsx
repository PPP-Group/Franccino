/**
 * Renders a `PageContent.content` array (see `@/lib/api/types`, `Block`).
 * Shapes mirror `docs/data-model.md` ("pages" → block table) exactly: every
 * block's images are plain URL strings (rendered as a plain `<img>`, not
 * `ApiImage`, since the API applies no conversions to block media), and only
 * `rich_text.body` / `image_text.body` are HTML — everything else is plain
 * text, rendered as-is rather than through `RichText`.
 */

import { Fragment } from 'react';
import type {
  Block,
  CtaBlockData,
  FaqBlockData,
  GalleryBlockData,
  ImageBlockData,
  ImageTextBlockData,
  QuoteBlockData,
  RichTextBlockData,
  StatsBlockData,
  TimelineBlockData,
} from '@/lib/api/types';
import { RichText } from './RichText';

/** Plain `<img>` for a block's media (a bare URL, not an `Image` object — see the module comment). */
function BlockImage({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- block media has no API-side conversions to hand to next/image.
  return <img src={src} alt={alt} loading="lazy" />;
}

function RichTextBlock({ data }: { data: RichTextBlockData }) {
  return <RichText html={data.body} />;
}

function ImageBlock({ data }: { data: ImageBlockData }) {
  return (
    <figure>
      <BlockImage src={data.image} alt={data.caption ?? ''} />
      {data.caption && <figcaption>{data.caption}</figcaption>}
    </figure>
  );
}

function ImageTextBlock({ data }: { data: ImageTextBlockData }) {
  return (
    <section data-image-position={data.image_position}>
      <BlockImage src={data.image} alt="" />
      <div>
        {data.heading && <h2>{data.heading}</h2>}
        <RichText html={data.body} />
      </div>
    </section>
  );
}

function TimelineBlock({ data }: { data: TimelineBlockData }) {
  if (data.items.length === 0) {
    return null;
  }
  return (
    <ol>
      {data.items.map((item, index) => (
        <li key={index}>
          <span>{item.year}</span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </li>
      ))}
    </ol>
  );
}

function FaqBlock({ data }: { data: FaqBlockData }) {
  if (data.items.length === 0) {
    return null;
  }
  return (
    <dl>
      {data.items.map((item, index) => (
        <Fragment key={index}>
          <dt>{item.question}</dt>
          <dd>{item.answer}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

function StatsBlock({ data }: { data: StatsBlockData }) {
  if (data.items.length === 0) {
    return null;
  }
  return (
    <dl>
      {data.items.map((item, index) => (
        <Fragment key={index}>
          <dt>{item.value}</dt>
          <dd>{item.label}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

function QuoteBlock({ data }: { data: QuoteBlockData }) {
  return (
    <blockquote>
      <p>{data.text}</p>
      {data.author && <cite>{data.author}</cite>}
    </blockquote>
  );
}

function CtaBlock({ data }: { data: CtaBlockData }) {
  return (
    <p>
      {data.heading && <strong>{data.heading}</strong>}
      {data.body && <span>{data.body}</span>}
      <a href={data.url}>{data.label}</a>
    </p>
  );
}

function GalleryBlock({ data }: { data: GalleryBlockData }) {
  if (data.images.length === 0) {
    return null;
  }
  return (
    <figure>
      <ul>
        {data.images.map((src, index) => (
          <li key={index}>
            <BlockImage src={src} alt="" />
          </li>
        ))}
      </ul>
      {data.caption && <figcaption>{data.caption}</figcaption>}
    </figure>
  );
}

type BlocksProps = {
  blocks: Block[];
};

export function Blocks({ blocks }: BlocksProps) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'rich_text':
            return <RichTextBlock key={index} data={block.data} />;
          case 'image':
            return <ImageBlock key={index} data={block.data} />;
          case 'image_text':
            return <ImageTextBlock key={index} data={block.data} />;
          case 'timeline':
            return <TimelineBlock key={index} data={block.data} />;
          case 'faq':
            return <FaqBlock key={index} data={block.data} />;
          case 'stats':
            return <StatsBlock key={index} data={block.data} />;
          case 'quote':
            return <QuoteBlock key={index} data={block.data} />;
          case 'cta':
            return <CtaBlock key={index} data={block.data} />;
          case 'gallery':
            return <GalleryBlock key={index} data={block.data} />;
          default:
            return null;
        }
      })}
    </>
  );
}
