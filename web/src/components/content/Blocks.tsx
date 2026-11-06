/**
 * Renderiza `PageContent.content` (blocos do painel, `docs/data-model.md`).
 * Imagens de bloco são URLs simples (sem conversões da API), então vão em
 * `<img>` nativo. Só `rich_text.body` e `image_text.body` são HTML
 * (sanitizado pela API); o resto é texto simples.
 */

import { useTranslations } from 'next-intl';
import { VideoFacade } from '@/components/media/VideoFacade';
import { CountUp } from '@/components/ui/CountUp';
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
import { Timeline } from './Timeline';

/**
 * Texto rico do painel com a fonte e a escala do site, sempre: o conteúdo importado do WordPress pode trazer estilo
 * em linha (`style="font-family…"`), `<font>` e classes de tamanho do editor antigo, que venceriam o CSS. Aqui saem
 * esses atributos e o `<font>` (fica o texto dele), e um `<h1>` vira `<h2>` (a página já tem o seu h1). O HTML já
 * chega sanitizado pela API; isto só tira apresentação.
 */
export function cleanCmsHtml(html: string): string {
  return html
    .replace(/\s(?:style|face|size|color|class|align)\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
    .replace(/<\/?font\b[^>]*>/gi, '')
    .replace(/<(\/?)h1\b/gi, '<$1h2');
}

function BlockImage({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- mídia de bloco não tem conversões da API.
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
}

function RichTextBlock({ data }: { data: RichTextBlockData }) {
  return <RichText html={data.body ? cleanCmsHtml(data.body) : null} className="prose" />;
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
        <RichText html={data.body ? cleanCmsHtml(data.body) : null} className="prose" />
      </div>
    </section>
  );
}

function TimelineBlock({ data }: { data: TimelineBlockData }) {
  const t = useTranslations('blocks');
  if (data.items.length === 0) {
    return null;
  }
  return <Timeline data={data} title={t('timelineTitle')} />;
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
    <dl className="stats" data-reveal="stagger">
      {data.items.map((item, index) => (
        <div key={index} className="stats__item">
          <dt className="num">
            <CountUp value={item.value} />
          </dt>
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
  const t = useTranslations('mediaLinks');
  const title = data.title ?? t('video');
  if (data.file) {
    return (
      <div className="block-video">
        <VideoFacade title={title} src={data.file} poster={data.poster} />
      </div>
    );
  }
  if (!data.embed_url) {
    return data.url ? (
      <p className="block-video">
        <a className="link-arrow" href={data.url} target="_blank" rel="noopener noreferrer">
          {data.title ?? data.url}
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

/** Blocos que ocupam a largura toda na página editorial (sem a margem do `.wrap`). */
const FULL_BLEED: ReadonlySet<Block['type']> = new Set(['timeline', 'image']);

/**
 * `editorial` (Fábrica): cada bloco vira uma seção da largura da página, com fundo alternado branco e areia, ritmo de
 * seção (`--section-y`) e aparecimento ao rolar. Sem isso, os blocos ficam empilhados dentro da página (Privacidade,
 * Termos, Contato).
 */
export function Blocks({ blocks, editorial = false }: { blocks: Block[]; editorial?: boolean }) {
  if (blocks.length === 0) {
    return null;
  }
  if (editorial) {
    return (
      <div className="blocks blocks--editorial">
        {blocks.map((block, index) => (
          <div key={index} className={`editorial editorial--${block.type}`}>
            {FULL_BLEED.has(block.type) ? (
              <BlockView block={block} />
            ) : (
              <div className="wrap" data-reveal>
                <BlockView block={block} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="blocks">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}
