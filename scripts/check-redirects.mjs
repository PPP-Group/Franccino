#!/usr/bin/env node
/**
 * Confere os endereços do site antigo contra o site novo (P5b T14). Lê o sitemap do WordPress (todos os sitemaps
 * filhos), pede cada caminho ao site novo sem seguir o redirect e classifica a resposta:
 *
 * - ok: 301/302/307/308 para uma página que responde 200, ou 410 (conteúdo que saiu de propósito), direto ou depois
 *   do redirect que tira a barra final;
 * - pagina: o caminho responde 200 direto no site novo (raro: só a raiz e os caminhos iguais);
 * - quebrado: 404, 5xx, redirect para 404 ou erro de rede.
 *
 * Uso (sem dependência nova, Node 24):
 *   node scripts/check-redirects.mjs --site https://preview.exemplo --user franccino [--out relatorio.csv]
 *   --password senha do preview; sem ela, lê CHECK_REDIRECTS_PASSWORD (fica fora do histórico do terminal)
 *   --sitemap  sitemap índice do site antigo (padrão https://franccino.com.br/sitemap_index.xml)
 *   --limit    confere só os N primeiros endereços (teste rápido)
 * Sai com código 1 se algum endereço estiver quebrado.
 */
import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    site: { type: 'string' },
    sitemap: { type: 'string', default: 'https://franccino.com.br/sitemap_index.xml' },
    user: { type: 'string' },
    password: { type: 'string' },
    out: { type: 'string', default: 'redirects-relatorio.csv' },
    limit: { type: 'string' },
    concurrency: { type: 'string', default: '6' },
  },
});

if (!args.site) {
  console.error('Informe o site novo: --site https://...');
  process.exit(2);
}

const site = args.site.replace(/\/$/, '');
const auth = args.user
  ? {
      Authorization: `Basic ${Buffer.from(`${args.user}:${args.password ?? process.env.CHECK_REDIRECTS_PASSWORD ?? ''}`).toString('base64')}`,
    }
  : {};
const timeout = () => AbortSignal.timeout(20_000);

/** `<loc>` de um sitemap XML. */
function locs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1].replaceAll('&amp;', '&'));
}

async function text(url) {
  const response = await fetch(url, { signal: timeout() });
  if (!response.ok) throw new Error(`${response.status} em ${url}`);
  return response.text();
}

async function oldPaths() {
  const index = await text(args.sitemap);
  const children = locs(index).filter((url) => url.endsWith('.xml'));
  const urls = children.length
    ? (await Promise.all(children.map(async (child) => locs(await text(child))))).flat()
    : locs(index);
  const paths = [
    ...new Set(
      urls.map((url) => {
        const u = new URL(url);
        return u.pathname + u.search;
      }),
    ),
  ];
  return args.limit ? paths.slice(0, Number(args.limit)) : paths;
}

async function check(path) {
  try {
    const first = await fetch(site + path, { redirect: 'manual', headers: auth, signal: timeout() });
    if (first.status === 410) return { path, status: 410, to: '', final: '', result: 'ok' };
    if (first.status === 200) return { path, status: 200, to: '', final: 200, result: 'pagina' };
    if ([301, 302, 307, 308].includes(first.status)) {
      const to = new URL(first.headers.get('location') ?? '', site + path).toString();
      const final = await fetch(to, { headers: auth, signal: timeout() });
      return {
        path,
        status: first.status,
        to,
        final: final.status,
        // 410 depois do redirect também é proposital: o Next tira a barra final (308) antes de a regra de 410 valer.
        result: final.status === 200 || final.status === 410 ? 'ok' : 'quebrado',
      };
    }
    return { path, status: first.status, to: '', final: '', result: 'quebrado' };
  } catch (error) {
    return { path, status: 'erro', to: String(error.message ?? error), final: '', result: 'quebrado' };
  }
}

const paths = await oldPaths();
console.log(`${paths.length} endereços do site antigo. Conferindo em ${site}...`);
const results = [];
const queue = [...paths];
await Promise.all(
  Array.from({ length: Number(args.concurrency) }, async () => {
    while (queue.length) {
      results.push(await check(queue.shift()));
    }
  }),
);

results.sort((a, b) => a.path.localeCompare(b.path));
const csv = [
  'caminho,status,destino,status_final,resultado',
  ...results.map((r) =>
    [r.path, r.status, r.to, r.final, r.result].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','),
  ),
].join('\n');
await writeFile(args.out, `${csv}\n`);

const count = (result) => results.filter((r) => r.result === result).length;
console.log(
  `ok: ${count('ok')} · página direta: ${count('pagina')} · quebrados: ${count('quebrado')} → ${args.out}`,
);
for (const broken of results.filter((r) => r.result === 'quebrado').slice(0, 20)) {
  console.log(`  ${broken.status} ${broken.path} ${broken.to}`);
}
process.exit(count('quebrado') > 0 ? 1 : 0);
