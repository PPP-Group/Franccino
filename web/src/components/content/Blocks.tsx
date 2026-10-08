/**
 * Renderiza `PageContent.content` (blocos do painel, `docs/data-model.md`).
 * Imagens de bloco são URLs simples (sem conversões da API), então vão em
 * `<img>` nativo. Só `rich_text.body` e `image_text.body` são HTML
 * (sanitizado pela API); o resto é texto simples.
 */

import { useTranslations } from 'next-intl';
import { VideoFacade } from '@/components/media/VideoFacade';
import { Rail } from '@/components/ui/Rail';
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
  VideoBlockData,
} from '@/lib/api/types';
import { RichText } from './RichText';

function BlockImage({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- mídia de bloco não tem conversões da API.
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
}

function RichTextBlock({ data }: { data: RichTextBlockData }) {
  return <RichText html={data.body} className="prose" />;
}

function ImageBlock({ data }: { data: ImageBlockData }) {
  return (
    <figure className="block-image">
      <BlockImage src={data.image} alt={data.caption ?? ''} />
      {data.caption ? <figcaption>{data.caption}</figcaption> : null}
    </figure>
  );
}

function ImageTextBlock({ data }: { data: ImageTextBlockData }) {
  return (
    <section className="block-image-text" data-image-position={data.image_position}>
      <div className="block-image-text__media">
        <BlockImage src={data.image} alt="" />
      </div>
      <div className="block-image-text__copy">
        {data.heading ? <h2>{data.heading}</h2> : null}
        <RichText html={data.body} className="prose" />
      </div>
    </section>
  );
}

/**
 * "Nossa História" na horizontal, como no site antigo (ajustes do cliente, 06/10/2026): anos lado a lado,
 * com setas para avançar. Cada linha do texto do painel vira um fato do ano.
 */
function TimelineBlock({ data }: { data: TimelineBlockData }) {
  const t = useTranslations('blocks');
  if (data.items.length === 0) {
    return null;
  }
  return (
    <Rail label={t('timeline')} className="timeline-rail">
      <ol className="timeline">
        {data.items.map((item, index) => {
          const facts = (item.text ?? '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
          return (
            <li key={index} className="timeline__item">
              <span className="timeline__year num">{item.year}</span>
              <h3>{item.title}</h3>
              {facts.length > 0 ? (
                <ul className="timeline__facts">
                  {facts.map((fact, factIndex) => (
                    <li key={factIndex}>{fact}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Rail>
  );
}

function FaqBlock({ data }: { data: FaqBlockData }) {
  if (data.items.length === 0) {
    return null;
  }
  return (
    <div className="faq">
      {data.items.map((item, index) => (
        <details key={index}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

function StatsBlock({ data }: { data: StatsBlockData }) {
  if (data.items.length === 0) {
    return null;
  }
  return (
    <dl className="stats">
      {data.items.map((item, index) => (
        <div key={index}>
          <dt className="num">{item.value}</dt>
          <dd>{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}

function QuoteBlock({ data }: { data: QuoteBlockData }) {
  return (
    <blockquote className="block-quote">
      <p>{data.text}</p>
      {data.author ? <cite>{data.author}</cite> : null}
    </blockquote>
  );
}

function CtaBlock({ data }: { data: CtaBlockData }) {
  return (
    <div className="block-cta">
      {data.heading ? <h2>{data.heading}</h2> : null}
      {data.body ? <p className="lead">{data.body}</p> : null}
      <a className="btn" href={data.url}>
        {data.label}
      </a>
    </div>
  );
}

function GalleryBlock({ data }: { data: GalleryBlockData }) {
  if (data.images.length === 0) {
    return null;
  }
  return (
    <figure className="block-gallery">
      <ul>
        {data.images.map((src, index) => (
          <li key={index}>
            <BlockImage src={src} alt="" />
          </li>
        ))}
      </ul>
      {data.caption ? <figcaption>{data.caption}</figcaption> : null}
    </figure>
  );
}

function VideoBlock({ data }: { data: VideoBlockData }) {
  const title = data.title ?? data.url;
  if (!data.embed_url) {
    return data.url ? (
      <p className="block-video">
        <a className="link-arrow" href={data.url} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </p>
    ) : null;
  }
  return (
    <div className="block-video">
      <VideoFacade title={title} embedUrl={data.embed_url} poster={data.poster} />
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'rich_text':
      return <RichTextBlock data={block.data} />;
    case 'image':
      return <ImageBlock data={block.data} />;
    case 'image_text':
      return <ImageTextBlock data={block.data} />;
    case 'timeline':
      return <TimelineBlock data={block.data} />;
    case 'faq':
      return <FaqBlock data={block.data} />;
    case 'stats':
      return <StatsBlock data={block.data} />;
    case 'quote':
      return <QuoteBlock data={block.data} />;
    case 'cta':
      return <CtaBlock data={block.data} />;
    case 'gallery':
      return <GalleryBlock data={block.data} />;
    case 'video':
      return <VideoBlock data={block.data} />;
    default:
      return null;
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return null;
  }
  return (
    <div className="blocks">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}
