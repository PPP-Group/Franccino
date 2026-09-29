/* Franccino — protótipo navegável (vanilla JS, sem build). */
(() => {
  const { products, designers, stores, contact, collections } = window.FRANCCINO;
  const page = document.body.dataset.page;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const img = (name) => `img/${name}${name.includes('.') ? '' : '.webp'}`;
  const bySlug = (slug) => products.find((p) => p.slug === slug);
  const cm = (mm) => (Math.round(mm / 10 * 10) / 10).toLocaleString('pt-BR');
  const areaName = { casa: 'Franccino Casa', giardini: 'Franccino Giardini' };
  const groupName = { madeira: 'Madeira', tecido: 'Tecido', estrutura: 'Estrutura', trama: 'Trama' };

  /* ---------- ícones (traço único 1.5, estilo lucide) ---------- */
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    list: '<path d="M9 5h11M9 12h11M9 19h11"/><path d="M4 5h.01M4 12h.01M4 19h.01"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    chat: '<path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5Z"/>',
    pin: '<path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    cube: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    photo: '<rect x="3.5" y="5" width="17" height="14"/><circle cx="9" cy="10" r="1.6"/><path d="m20.5 16-5-5-8 8"/>',
    rotate: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    table: '<rect x="3.5" y="4.5" width="17" height="15"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10"/>',
    grid: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
    ruler: '<path d="M3 17 17 3l4 4L7 21Z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
  };
  const icon = (name, cls = '') =>
    `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;

  /* ---------- lista de orçamento (localStorage) ---------- */
  const KEY = 'franccino.quote.v1';
  const quote = {
    read() {
      try {
        return JSON.parse(localStorage.getItem(KEY)) ?? [];
      } catch {
        return [];
      }
    },
    write(items) {
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {
        /* navegação privada: lista vive só na página */
      }
      renderCount(true);
    },
    count() {
      return this.read().reduce((sum, item) => sum + item.qty, 0);
    },
    add(slug, finishes, qty = 1, note = '') {
      const items = this.read();
      const key = JSON.stringify({ slug, finishes });
      const found = items.find((i) => JSON.stringify({ slug: i.slug, finishes: i.finishes }) === key);
      if (found) {
        found.qty += qty;
        if (note) found.note = note;
      } else {
        items.push({ slug, finishes, qty, note });
      }
      this.write(items);
    },
  };

  function defaultFinishes(p) {
    return Object.fromEntries(Object.entries(p.finishes).map(([group, list]) => [group, list[0].id]));
  }

  function finishLabel(p, finishes) {
    return Object.entries(finishes)
      .map(([group, id]) => {
        const f = p.finishes[group]?.find((x) => x.id === id);
        return f ? `${f.name} (${f.code})` : '';
      })
      .filter(Boolean)
      .join(' · ');
  }

  /* ---------- chrome ---------- */
  const nav = [
    ['Indoor', 'catalogo.html?area=casa', 'casa'],
    ['Outdoor', 'catalogo.html?area=giardini', 'giardini'],
    ['Lançamentos', 'catalogo.html?novos=1', 'novos'],
    ['Coleções', 'colecoes.html', 'colecoes'],
    ['Designers', 'designers.html', 'designers'],
    ['Projetos', 'projetos.html', 'projetos'],
    ['Fábrica', 'fabrica.html', 'fabrica'],
    ['Lojas', 'lojas.html', 'lojas'],
    ['Sala para montar', 'sala.html', 'sala'],
    ['Área técnica', 'catalogo.html?view=tabela', 'tabela'],
  ];

  function currentNavKey() {
    const q = new URLSearchParams(location.search);
    if (['sala', 'colecoes', 'designers', 'projetos', 'fabrica', 'lojas'].includes(page)) return page;
    if (page === 'catalogo') return q.get('view') === 'tabela' ? 'tabela' : q.get('novos') ? 'novos' : q.get('area') ?? 'casa';
    return '';
  }

  function renderChrome() {
    const active = currentNavKey();
    document.body.insertAdjacentHTML(
      'afterbegin',
      `<div class="proto-note">Protótipo de direção visual. Fotos do site atual; medidas, acabamentos e arquivos são ilustrativos.</div>
      <header class="site-header">
        <div class="wrap site-header__bar">
          <a class="wordmark" href="index.html" aria-label="Franccino, página inicial">FRANCCINO</a>
          <nav class="nav" id="nav" aria-label="Principal">
            ${nav.map(([label, href, key]) => `<a href="${href}"${key && key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
          </nav>
          <div class="tools">
            <a href="busca.html" aria-label="Buscar">${icon('search')}</a>
            <span class="lang"><strong>PT</strong> / EN</span>
            <a href="lista.html" aria-label="Lista de orçamento">${icon('list')}<span class="label-optional">Lista</span><span class="list-count num" id="list-count">0</span></a>
            <button type="button" class="menu-toggle" aria-controls="nav" aria-expanded="false" aria-label="Abrir menu">${icon('menu')}</button>
          </div>
        </div>
      </header>`,
    );
    document.body.insertAdjacentHTML(
      'beforeend',
      `<footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <a class="wordmark" href="index.html">FRANCCINO</a>
              <p style="margin-top:18px;color:#a6a49b">Fábrica: ${esc(contact.address)}</p>
              <p style="margin-top:8px"><a href="tel:+553733814204">${contact.phone}</a> · <a href="mailto:${contact.email}">${contact.email}</a></p>
            </div>
            <div>
              <h3>Catálogo</h3>
              <ul>
                <li><a href="catalogo.html?area=casa">Franccino Casa</a></li>
                <li><a href="catalogo.html?area=giardini">Franccino Giardini</a></li>
                <li><a href="catalogo.html?novos=1">Lançamentos</a></li>
                <li><a href="sala.html">Sala para montar</a></li>
                <li><a href="acabamentos.html">Acabamentos</a></li>
                <li><a href="downloads.html">Downloads</a></li>
              </ul>
            </div>
            <div>
              <h3>Atendimento</h3>
              <ul>
                <li><a href="https://wa.me/${contact.quotesWhatsapp}">WhatsApp de orçamentos</a></li>
                <li><a href="https://wa.me/${contact.assistanceWhatsapp}">Assistência técnica</a></li>
                <li><a href="lojas.html">Onde encontrar</a></li>
                <li><a href="contato.html">Contato</a></li>
                <li><a href="catalogo.html?view=tabela">Área técnica</a></li>
              </ul>
            </div>
            <div>
              <h3>Novidades por e-mail</h3>
              <form class="newsletter" onsubmit="event.preventDefault();this.querySelector('input').value='';this.querySelector('input').placeholder='Inscrição recebida';">
                <label class="visually-hidden" for="nl">Seu e-mail</label>
                <input id="nl" type="email" required placeholder="Seu e-mail" autocomplete="email">
                <button type="submit" aria-label="Inscrever">${icon('arrow')}</button>
              </form>
              <p style="margin-top:12px;font-size:.8125rem;color:#a6a49b">Lançamentos e convites, sem excesso. Cancele quando quiser.</p>
            </div>
          </div>
          <div class="footer-base">
            <span>© 2026 Franccino. Design brasileiro autoral.</span>
            <span><a href="legal.html">Privacidade</a> · <a href="legal.html#termos">Termos</a> · <a href="#">Relatórios de transparência salarial</a></span>
          </div>
        </div>
      </footer>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>`,
    );

    const toggle = $('.menu-toggle');
    toggle.addEventListener('click', () => {
      const open = $('#nav').classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = icon(open ? 'close' : 'menu');
    });
    renderCount(false);
  }

  function renderCount(bump) {
    const el = $('#list-count');
    if (!el) return;
    const n = quote.count();
    el.textContent = n;
    el.dataset.empty = String(n === 0);
    if (bump) {
      el.classList.add('is-bumped');
      setTimeout(() => el.classList.remove('is-bumped'), 260);
    }
  }

  let toastTimer;
  function toast(html) {
    const el = $('#toast');
    el.innerHTML = html;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3600);
  }

  /* ---------- peças reutilizáveis ---------- */
  function plate(p, showNew = false) {
    return `<article class="plate">
      <a href="produto.html?p=${p.slug}" style="text-decoration:none;display:contents">
        <div class="plate__media"><img src="${img(p.img)}" alt="${esc(p.name)}" loading="lazy" width="1024" height="768"></div>
        <div class="plate__body">
          <div class="plate__row"><span class="plate__name">${esc(p.name)}</span><span class="meta num">${cm(p.w)} cm</span></div>
          <div class="plate__row"><span class="meta">${esc(p.designer)}</span><span class="meta"><span class="area-dot area-dot--${p.area}"></span>${p.category}</span></div>
        </div>
      </a>
      <div class="plate__tags">${showNew && p.isNew ? '<span class="tag tag--new">NOVO</span>' : ''}</div>
      <button class="quick-add" type="button" data-add="${p.slug}" aria-label="Adicionar ${esc(p.name)} à lista">${icon('plus')}</button>
    </article>`;
  }

  function bindQuickAdd(root = document) {
    $$('[data-add]', root).forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const p = bySlug(btn.dataset.add);
        quote.add(p.slug, defaultFinishes(p), 1);
        btn.classList.add('is-added');
        btn.innerHTML = icon('check');
        toast(`${esc(p.name)} na lista, acabamento padrão. <a href="lista.html">Ver lista</a>`);
      }),
    );
  }

  /* ---------- planta (renderer compartilhado) ---------- */
  function planSVG({ room, pieces, selected = null, interactive = false, conflicts = new Set() }) {
    const m = 60;
    const W = room.w;
    const D = room.d;
    const grid = [];
    for (let x = 50; x < W; x += 50) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${D}" stroke="${x % 100 ? '#efece5' : '#e1ddd3'}" stroke-width="1" vector-effect="non-scaling-stroke"/>`);
    for (let y = 50; y < D; y += 50) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${y % 100 ? '#efece5' : '#e1ddd3'}" stroke-width="1" vector-effect="non-scaling-stroke"/>`);
    const body = pieces
      .map((pc, i) => {
        const p = bySlug(pc.slug);
        const w = p.w / 10;
        const d = p.d / 10;
        const cls = ['piece', i === selected ? 'is-selected' : '', conflicts.has(i) ? 'is-conflict' : ''].join(' ');
        const shape =
          p.shape === 'round'
            ? `<ellipse cx="${w / 2}" cy="${d / 2}" rx="${w / 2}" ry="${d / 2}"/>`
            : `<rect width="${w}" height="${d}" rx="2"/>`;
        // centro de giro que mantém a caixa girada em [0, largura'] × [0, profundidade']
        const pivot = { 0: [w / 2, d / 2], 90: [d / 2, d / 2], 180: [w / 2, d / 2], 270: [w / 2, w / 2] }[pc.r];
        const b = box(pc);
        const short = p.name.replace(/^(Sofá|Poltrona|Cadeira|Mesa lateral|Mesa Lateral|Mesa de centro|Mesa de Jantar|Mesa|Buffet) /, '');
        const label =
          Math.max(b.w, b.d) > 70
            ? `<text x="${b.w / 2}" y="${b.d / 2 - 2}" text-anchor="middle">${esc(short)}</text><text x="${b.w / 2}" y="${b.d / 2 + 12}" text-anchor="middle" fill="#57564f">${cm(p.w)}×${cm(p.d)}</text>`
            : '';
        return `<g class="${cls}" data-i="${i}" transform="translate(${pc.x} ${pc.y})"${interactive ? ` tabindex="0" role="button" aria-label="${esc(p.name)}, ${cm(p.w)} por ${cm(p.d)} cm"` : ''}><g transform="rotate(${pc.r} ${pivot[0]} ${pivot[1]})">${shape}</g>${label}</g>`;
      })
      .join('');
    return `<svg viewBox="${-m} ${-m} ${W + 2 * m} ${D + 2 * m}" role="img" aria-label="Planta do ambiente, ${cm(W * 10)} por ${cm(D * 10)} centímetros">
      <rect x="0" y="0" width="${W}" height="${D}" fill="#fdfcf9" stroke="#171717" stroke-width="3" vector-effect="non-scaling-stroke"/>
      ${grid.join('')}
      <g font-size="13" fill="#57564f" font-family="Archivo, sans-serif">
        <line x1="0" y1="-26" x2="${W}" y2="-26" stroke="#8a887f" vector-effect="non-scaling-stroke"/>
        <line x1="0" y1="-32" x2="0" y2="-20" stroke="#8a887f" vector-effect="non-scaling-stroke"/>
        <line x1="${W}" y1="-32" x2="${W}" y2="-20" stroke="#8a887f" vector-effect="non-scaling-stroke"/>
        <text x="${W / 2}" y="-34" text-anchor="middle">${(W / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m</text>
        <line x1="-26" y1="0" x2="-26" y2="${D}" stroke="#8a887f" vector-effect="non-scaling-stroke"/>
        <line x1="-32" y1="0" x2="-20" y2="0" stroke="#8a887f" vector-effect="non-scaling-stroke"/>
        <line x1="-32" y1="${D}" x2="-20" y2="${D}" stroke="#8a887f" vector-effect="non-scaling-stroke"/>
        <text x="-34" y="${D / 2}" text-anchor="middle" transform="rotate(-90 -34 ${D / 2})">${(D / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m</text>
      </g>
      ${body}
    </svg>`;
  }

  // caixa ocupada pela peça (girada 0/90/180/270) em cm
  function box(pc) {
    const p = bySlug(pc.slug);
    const turned = pc.r % 180 !== 0;
    const w = (turned ? p.d : p.w) / 10;
    const d = (turned ? p.w : p.d) / 10;
    return { x: pc.x, y: pc.y, w, d };
  }

  /* ---------- home ---------- */
  function renderHome() {
    const launches = products.filter((p) => p.isNew);
    const states = [...new Set(stores.map((s) => s.state))];
    const main = $('main');
    main.innerHTML = `
      <section class="hero" aria-labelledby="hero-title">
        <img class="hero__img" src="${img('hero')}" alt="Sala de estar com sofá, mesa de centro em madeira e jardim tropical ao fundo" fetchpriority="high" width="2560" height="1706">
        <div class="hero__plate">
          <h1 class="display" id="hero-title">Móveis autorais, feitos sob medida na nossa fábrica em Minas.</h1>
          <div class="hero__actions">
            <a class="btn" href="catalogo.html?area=casa">Ver o catálogo</a>
            <a class="btn btn--ghost" href="sala.html">${icon('ruler')}Montar uma sala</a>
          </div>
          <div class="meta"><span>Franccino Casa e Giardini</span><span>16 designers</span><span>Fábrica própria em Cláudio (MG)</span></div>
        </div>
      </section>

      <section class="section" aria-labelledby="novos-title">
        <div class="wrap">
          <div class="section-head">
            <div><h2 id="novos-title">Lançamentos</h2><p class="lead">Peças novas nas linhas Casa e Giardini.</p></div>
            <a class="link-arrow" href="catalogo.html?novos=1">Ver todos ${icon('arrow')}</a>
          </div>
          <div class="rail" tabindex="0" aria-label="Lançamentos">${launches.map((p) => plate(p, true)).join('')}</div>
        </div>
      </section>

      <section class="lines" aria-label="Linhas">
        ${['casa', 'giardini']
          .map(
            (a) => `<a class="line-panel" href="catalogo.html?area=${a}">
              <img src="${img(a)}" alt="" loading="lazy">
              <div class="line-panel__copy">
                <h2 class="display">${areaName[a].replace('Franccino ', '')}</h2>
                <p>${a === 'casa' ? 'Salas, jantares e escritórios em madeira maciça, estofados e metais.' : 'Varandas, jardins e áreas de piscina em teca, alumínio e corda náutica.'}</p>
                <span class="link-arrow">Ver peças ${icon('arrow')}</span>
              </div>
            </a>`,
          )
          .join('')}
      </section>

      <section class="feature" aria-labelledby="feature-title">
        <div class="wrap feature__grid">
          <div class="feature__media"><img src="${img('so')}" alt="Poltrona Sô com trama de corda náutica" loading="lazy" width="1024" height="768"></div>
          <div class="feature__copy">
            <h2 id="feature-title" class="display">Poltrona Sô</h2>
            <p class="lead">Estrutura em madeira e trama de corda náutica feita à mão. Design de Sérgio J. Matos para a linha Giardini.</p>
            <dl class="facts num">
              <div><dt>Medidas</dt><dd>76 × 80 × 74 cm</dd></div>
              <div><dt>Trama</dt><dd>Corda náutica, 2 tons</dd></div>
              <div><dt>Uso</dt><dd>Varandas e áreas cobertas</dd></div>
            </dl>
            <div class="hero__actions">
              <a class="btn" href="produto.html?p=poltrona-so-corda">Ver a peça</a>
              <button class="btn btn--ghost" type="button" data-add="poltrona-so-corda">${icon('plus')}Pôr na lista</button>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--paper" aria-labelledby="sala-title">
        <div class="wrap teaser">
          <div class="teaser__copy">
            <h2 id="sala-title" class="display display--section">Monte a sua sala em escala antes de pedir o orçamento.</h2>
            <p class="lead">Informe as medidas do ambiente, arraste as peças com as dimensões reais e veja o que cabe. A sala vira uma lista de orçamento com um clique.</p>
            <div><a class="btn" href="sala.html">${icon('ruler')}Abrir a Sala para montar</a></div>
          </div>
          <div class="teaser__plan" id="teaser-plan"></div>
        </div>
      </section>

      <section class="section" id="designers" aria-labelledby="designers-title">
        <div class="wrap">
          <div class="section-head">
            <div><h2 id="designers-title">Quem desenha</h2><p class="lead">Designers e estúdios que assinam peças com a fábrica.</p></div>
            <a class="link-arrow" href="designers.html">Todos os 16 designers ${icon('arrow')}</a>
          </div>
          <div class="designers">
            ${designers.map((d) => `<a class="designer" href="designers.html"><div class="designer__photo"><img src="${img(d.img)}" alt="Retrato de ${esc(d.name)}" loading="lazy"></div><h3>${esc(d.name)}</h3><p class="meta">${esc(d.note)}</p></a>`).join('')}
          </div>
        </div>
      </section>

      <section class="section section--paper" id="fabrica" aria-labelledby="fabrica-title">
        <div class="wrap factory">
          <div class="factory__media"><img src="${img('fabrica')}" alt="Detalhe de marcenaria: tampo de madeira e estrutura de uma peça Franccino" loading="lazy"></div>
          <div class="factory__copy">
            <h2 id="fabrica-title">Da madeira bruta ao acabamento à mão, em Cláudio, Minas Gerais.</h2>
            <p class="lead">Marcenaria, estofaria e metalurgia próprias. Cada peça é feita sob encomenda, com medidas e revestimentos ajustáveis ao projeto.</p>
            <dl class="facts">
              <div><dt>Produção</dt><dd>100% interna desde 2021</dd></div>
              <div><dt>Sob medida</dt><dd>Dimensões, madeiras e tecidos</dd></div>
              <div><dt>Atendimento</dt><dd>Assistência técnica própria</dd></div>
            </dl>
            <div><a class="link-arrow" href="fabrica.html">Conhecer a fábrica ${icon('arrow')}</a></div>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="tec-title">
        <div class="wrap">
          <div class="section-head">
            <div><h2 id="tec-title">Para quem especifica</h2><p class="lead">Medidas, fichas técnicas e blocos 2D e 3D de cada peça, numa tabela só.</p></div>
            <a class="link-arrow" href="catalogo.html?view=tabela">Abrir a área técnica ${icon('arrow')}</a>
          </div>
          ${techTable(products.slice(0, 5))}
        </div>
      </section>

      <section class="section section--paper" id="lojas" aria-labelledby="lojas-title">
        <div class="wrap stores">
          <div style="display:grid;gap:20px;align-content:start">
            <h2 id="lojas-title">Veja e sente nas lojas</h2>
            <p class="lead">Lojas exclusivas e revendas autorizadas. Escolha o estado.</p>
            <div class="chips" role="group" aria-label="Estado">${states.map((s, i) => `<button class="chip" type="button" data-state="${s}" aria-pressed="${i === 0}">${s}</button>`).join('')}</div>
            <a class="btn btn--ghost" href="https://wa.me/${contact.quotesWhatsapp}">${icon('chat')}Falar com um consultor</a>
          </div>
          <div class="store-list" id="store-list"></div>
        </div>
      </section>`;

    $('#teaser-plan').innerHTML = planSVG({
      room: { w: 500, d: 400 },
      pieces: [
        { slug: 'sofa-majestic', x: 130, y: 280, r: 0 },
        { slug: 'mesa-de-centro-trem', x: 190, y: 170, r: 0 },
        { slug: 'poltrona-orvalho', x: 40, y: 130, r: 90 },
        { slug: 'poltrona-terezinha', x: 390, y: 130, r: 270 },
        { slug: 'mesa-lateral-rito', x: 70, y: 300, r: 0 },
      ],
    });

    const renderStores = (state) => {
      $('#store-list').innerHTML = stores
        .filter((s) => s.state === state)
        .map((s) => `<article class="store"><h3>${esc(s.name)}</h3><address>${esc(s.address)}<br>${esc(s.city)} — ${s.state}</address><p class="meta">${s.type} · <a href="tel:${s.phone.replace(/\D/g, '')}">${s.phone}</a></p></article>`)
        .join('');
    };
    $$('[data-state]').forEach((b) =>
      b.addEventListener('click', () => {
        $$('[data-state]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        renderStores(b.dataset.state);
      }),
    );
    renderStores(states[0]);
    bindQuickAdd(main);
  }

  function techTable(list) {
    return `<div class="table-scroll"><table class="tech-table">
      <thead><tr><th scope="col"><span class="visually-hidden">Imagem</span></th><th scope="col">Peça</th><th scope="col">Linha</th><th scope="col">Designer</th><th scope="col">L × P × A (cm)</th><th scope="col">Arquivos</th><th scope="col"><span class="visually-hidden">Lista</span></th></tr></thead>
      <tbody>${list
        .map(
          (p) => `<tr>
          <td><img class="thumb" src="${img(p.img)}" alt="" loading="lazy"></td>
          <td><a href="produto.html?p=${p.slug}"><strong>${esc(p.name)}</strong></a><div class="meta">${p.category}</div></td>
          <td><span class="area-dot area-dot--${p.area}"></span>${p.area === 'casa' ? 'Casa' : 'Giardini'}</td>
          <td>${esc(p.designer)}</td>
          <td class="num nowrap">${p.shape === 'round' ? `Ø ${cm(p.w)} × ${cm(p.h)}` : `${cm(p.w)} × ${cm(p.d)} × ${cm(p.h)}`}</td>
          <td><div class="file-links"><a href="#">Ficha PDF</a><a href="#">DWG</a><a href="#">SKP</a></div></td>
          <td><button class="btn btn--ghost" style="min-height:38px;padding:0 12px" type="button" data-add="${p.slug}" aria-label="Adicionar ${esc(p.name)} à lista">${icon('plus')}</button></td>
        </tr>`,
        )
        .join('')}</tbody></table></div>`;
  }

  /* ---------- catálogo ---------- */
  function renderCatalog() {
    const q = new URLSearchParams(location.search);
    const state = {
      area: q.get('area'),
      novos: q.get('novos') === '1',
      view: q.get('view') === 'tabela' ? 'tabela' : 'grade',
      category: '',
      designer: '',
    };
    const title = state.view === 'tabela' ? 'Área técnica' : state.novos ? 'Lançamentos' : areaName[state.area ?? 'casa'];
    const intro =
      state.view === 'tabela'
        ? 'Todas as peças com medidas e arquivos para especificação. Clique na peça para ver acabamentos.'
        : state.novos
          ? 'As peças que chegaram em 2026, nas linhas Casa e Giardini.'
          : state.area === 'giardini'
            ? 'Peças para varandas, jardins e áreas de piscina.'
            : 'Peças para salas, jantares e escritórios.';
    if (!state.area && !state.novos && state.view !== 'tabela') state.area = 'casa';

    const base = products.filter((p) => (state.novos ? p.isNew : state.area ? p.area === state.area : true));
    const categories = [...new Set(base.map((p) => p.category))];
    const designerNames = [...new Set(base.map((p) => p.designer))].sort();

    $('main').innerHTML = `
      <div class="wrap">
        <nav class="crumbs" aria-label="Você está em"><a href="index.html">Início</a><span>/</span><span>${title}</span></nav>
        <div class="catalog-head">
          <div style="display:grid;gap:12px"><h1>${title}</h1><p class="lead">${intro}</p></div>
          <p class="meta num" id="count"></p>
        </div>
        <div class="toolbar">
          <div class="chips" role="group" aria-label="Categoria">
            <button class="chip" type="button" data-cat="" aria-pressed="true">Todas</button>
            ${categories.map((c) => `<button class="chip" type="button" data-cat="${c}" aria-pressed="false">${c}</button>`).join('')}
          </div>
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <label class="visually-hidden" for="designer">Designer</label>
            <select id="designer"><option value="">Todos os designers</option>${designerNames.map((d) => `<option>${esc(d)}</option>`).join('')}</select>
            <div class="view-toggle" role="group" aria-label="Visualização">
              <button type="button" data-view="grade" aria-pressed="${state.view === 'grade'}">${icon('grid')}Grade</button>
              <button type="button" data-view="tabela" aria-pressed="${state.view === 'tabela'}">${icon('table')}Tabela técnica</button>
            </div>
          </div>
        </div>
        <div id="results" style="padding-bottom:96px"></div>
      </div>`;

    const draw = () => {
      const list = base.filter((p) => (!state.category || p.category === state.category) && (!state.designer || p.designer === state.designer));
      $('#count').textContent = `${list.length} ${list.length === 1 ? 'peça' : 'peças'}`;
      $('#results').innerHTML = list.length
        ? state.view === 'tabela'
          ? techTable(list)
          : `<div class="grid-plates">${list.map((p) => plate(p, state.novos)).join('')}</div>`
        : `<div class="empty"><h2>Nenhuma peça com esses filtros.</h2><p class="lead">Tire um filtro ou fale com a equipe: muitas peças são feitas sob medida.</p><button class="btn btn--ghost" type="button" id="clear">Limpar filtros</button></div>`;
      bindQuickAdd($('#results'));
      $('#clear')?.addEventListener('click', () => {
        state.category = '';
        state.designer = '';
        $('#designer').value = '';
        $$('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === '')));
        draw();
      });
    };

    $$('[data-cat]').forEach((b) =>
      b.addEventListener('click', () => {
        state.category = b.dataset.cat;
        $$('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      }),
    );
    $('#designer').addEventListener('change', (e) => {
      state.designer = e.target.value;
      draw();
    });
    $$('[data-view]').forEach((b) =>
      b.addEventListener('click', () => {
        state.view = b.dataset.view;
        $$('[data-view]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      }),
    );
    draw();
  }

  /* ---------- produto ---------- */
  function dimsSVG(p) {
    // vista frontal (L × A) e lateral (P × A), mesma escala
    const s = 0.16;
    const W = p.w * s;
    const D = p.d * s;
    const H = p.h * s;
    const gap = 60;
    const pad = 44;
    const vw = W + D + gap + pad * 2;
    const vh = H + pad * 2 + 10;
    const seat = p.seat ? p.seat * s : null;
    const dimLine = (x1, y1, x2, y2, label, vertical = false) => `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8a887f"/>
      <line x1="${vertical ? x1 - 5 : x1}" y1="${vertical ? y1 : y1 - 5}" x2="${vertical ? x1 + 5 : x1}" y2="${vertical ? y1 : y1 + 5}" stroke="#8a887f"/>
      <line x1="${vertical ? x2 - 5 : x2}" y1="${vertical ? y2 : y2 - 5}" x2="${vertical ? x2 + 5 : x2}" y2="${vertical ? y2 : y2 + 5}" stroke="#8a887f"/>
      <text x="${vertical ? x1 - 10 : (x1 + x2) / 2}" y="${vertical ? (y1 + y2) / 2 : y1 - 9}" text-anchor="middle" ${vertical ? `transform="rotate(-90 ${x1 - 10} ${(y1 + y2) / 2})"` : ''}>${label}</text>`;
    const baseY = pad + H;
    const round = p.shape === 'round';
    return `<svg viewBox="0 0 ${vw} ${vh}" role="img" aria-label="Desenho com as medidas: ${round ? `diâmetro ${cm(p.w)} cm` : `largura ${cm(p.w)} cm, profundidade ${cm(p.d)} cm`}, altura ${cm(p.h)} cm" font-family="Archivo, sans-serif" font-size="11" fill="#57564f">
      <rect x="${pad}" y="${pad}" width="${W}" height="${H}" fill="none" stroke="#171717" stroke-width="1.4"/>
      ${seat ? `<line x1="${pad}" y1="${baseY - seat}" x2="${pad + W}" y2="${baseY - seat}" stroke="#171717" stroke-dasharray="3 3"/>` : ''}
      ${dimLine(pad, pad - 16, pad + W, pad - 16, `${round ? 'Ø ' : ''}${cm(p.w)}`)}
      ${dimLine(pad - 16, pad, pad - 16, baseY, cm(p.h), true)}
      <rect x="${pad + W + gap}" y="${pad}" width="${D}" height="${H}" fill="none" stroke="#171717" stroke-width="1.4"/>
      ${round ? '' : dimLine(pad + W + gap, pad - 16, pad + W + gap + D, pad - 16, cm(p.d))}
      ${seat ? `<text x="${pad + W + gap + D + 6}" y="${baseY - seat + 4}" text-anchor="start">${cm(p.seat)}</text><line x1="${pad + W + gap}" y1="${baseY - seat}" x2="${pad + W + gap + D}" y2="${baseY - seat}" stroke="#171717" stroke-dasharray="3 3"/>` : ''}
      <line x1="${pad - 20}" y1="${baseY}" x2="${vw - pad + 20}" y2="${baseY}" stroke="#bdb9ae"/>
      <text x="${pad + W / 2}" y="${baseY + 20}" text-anchor="middle">frente</text>
      <text x="${pad + W + gap + D / 2}" y="${baseY + 20}" text-anchor="middle">lateral</text>
    </svg>`;
  }

  function renderProduct() {
    const q = new URLSearchParams(location.search);
    const p = bySlug(q.get('p')) ?? bySlug('cadeira-aura');
    document.title = `${p.name} · Franccino`;
    const selected = defaultFinishes(p);
    let qty = 1;
    const designer = designers.find((d) => d.name === p.designer);
    const related = products.filter((x) => x.slug !== p.slug && (x.category === p.category || x.area === p.area)).slice(0, 8);
    const groups = Object.keys(p.finishes);

    $('main').innerHTML = `
      <div class="wrap">
        <nav class="crumbs" aria-label="Você está em"><a href="index.html">Início</a><span>/</span><a href="catalogo.html?area=${p.area}">${areaName[p.area]}</a><span>/</span><span>${p.category}</span><span>/</span><span aria-current="page">${esc(p.name)}</span></nav>
        <div class="product">
          <div class="gallery">
            <div class="gallery__stage" id="stage">
              <img id="stage-img" src="${img(p.img)}" alt="${esc(p.name)} em fundo branco" width="1024" height="768">
              <div class="stage-3d" id="stage-3d">
                <p class="stage-3d__status meta" id="viewer-status">Carregando o modelo 3D…</p>
                <p class="stage-3d__label meta">Modelo ilustrativo (SheenChair, Khronos Group). O GLB de cada peça entra quando a Franccino entregar os arquivos.</p>
              </div>
              <div class="stage-toggle" role="group" aria-label="Visualização">
                <button type="button" data-stage="foto" aria-pressed="true">${icon('photo')}Fotos</button>
                <button type="button" data-stage="3d" aria-pressed="false">${icon('cube')}3D</button>
              </div>
            </div>
            <div class="thumbs">
              <button type="button" aria-current="true" data-src="${img(p.img)}" aria-label="Foto 1: peça em fundo branco"><img src="${img(p.img)}" alt=""></button>
              <button type="button" aria-current="false" data-src="${img(p.area)}" aria-label="Foto 2: ambiente"><img src="${img(p.area)}" alt="" style="object-fit:cover"></button>
            </div>
          </div>

          <div class="panel">
            <div class="panel__head">
              <h1>${esc(p.name)}</h1>
              <p class="meta">${p.category.replace(/s$/, '').replace(/õe$/, 'ão')} · <span class="area-dot area-dot--${p.area}"></span>${areaName[p.area]} · Design <a href="#">${esc(p.designer)}</a></p>
              <p class="lead">Estrutura em madeira maciça de manejo certificado e acabamento feito à mão. Medidas e revestimentos podem ser ajustados ao seu projeto.</p>
            </div>

            <section class="block" aria-labelledby="fin-title">
              <div class="block__title">
                <h2 id="fin-title">Acabamentos</h2>
                <div class="tabs" role="tablist">${groups.map((g, i) => `<button role="tab" type="button" data-group="${g}" aria-selected="${i === 0}">${groupName[g]}</button>`).join('')}</div>
              </div>
              <div class="swatches" id="swatches" role="radiogroup"></div>
              <p class="swatch-name" id="swatch-name"></p>
              <p class="meta">Amostras recortadas das fotos; alguns tons são ilustrativos. Peça amostras físicas numa loja ou pelo WhatsApp.</p>
            </section>

            <section class="block" aria-labelledby="dim-title">
              <div class="block__title"><h2 id="dim-title">Medidas (cm)</h2><span class="meta">Sob medida sob consulta</span></div>
              <div class="dims">
                ${dimsSVG(p)}
                <dl class="num">
                  ${p.shape === 'round' ? `<div><dt>Diâmetro</dt><dd>${cm(p.w)}</dd></div>` : `<div><dt>Largura</dt><dd>${cm(p.w)}</dd></div><div><dt>Profundidade</dt><dd>${cm(p.d)}</dd></div>`}
                  <div><dt>Altura</dt><dd>${cm(p.h)}</dd></div>
                  ${p.seat ? `<div><dt>Altura do assento</dt><dd>${cm(p.seat)}</dd></div>` : ''}
                </dl>
              </div>
            </section>

            <section class="block buy" aria-label="Orçamento">
              <div class="buy__row">
                <div class="stepper" role="group" aria-label="Quantidade">
                  <button type="button" data-step="-1" aria-label="Diminuir">${icon('minus')}</button>
                  <output id="qty" class="num" aria-live="polite">1</output>
                  <button type="button" data-step="1" aria-label="Aumentar">${icon('plus')}</button>
                </div>
                <button class="btn" type="button" id="add">${icon('list')}Adicionar à lista de orçamento</button>
              </div>
              <div class="buy__secondary">
                <a class="btn btn--ghost" id="wa" href="#" target="_blank" rel="noopener">${icon('chat')}WhatsApp</a>
                <a class="btn btn--ghost" href="index.html#lojas">${icon('pin')}Onde comprar</a>
              </div>
              <p class="feedback" id="feedback" role="status"></p>
            </section>

            <section class="block" aria-labelledby="dl-title">
              <div class="block__title"><h2 id="dl-title">Arquivos técnicos</h2><span class="meta">Link seguro por 10 min</span></div>
              <div class="downloads">
                <a href="#">${icon('download')}<strong>Ficha técnica</strong><small>PDF · 1,2 MB</small></a>
                <a href="#">${icon('download')}<strong>Bloco 2D</strong><small>DWG · 860 KB</small></a>
                <a href="#">${icon('download')}<strong>Bloco 3D</strong><small>SKP · 4,1 MB</small></a>
              </div>
            </section>
          </div>
        </div>
      </div>

      <section class="section section--paper section--tight" aria-labelledby="designer-title">
        <div class="wrap">
          <div class="designer-strip${designer ? '' : ' designer-strip--text'}">
            ${designer ? `<img src="${img(designer.img)}" alt="Retrato de ${esc(designer.name)}">` : ''}
            <div style="display:grid;gap:14px">
              <h2 id="designer-title">${esc(p.designer)}</h2>
              ${designer ? '' : '<p class="meta">Retrato a receber da Franccino.</p>'}<p class="lead">${designer ? esc(designer.note) : 'Designer parceiro da Franccino.'} Cada peça é desenvolvida em diálogo com a fábrica, com protótipos testados até chegar à proporção certa.</p>
              <div><a class="link-arrow" href="#">Peças de ${esc(p.designer)} ${icon('arrow')}</a></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="rel-title">
        <div class="wrap">
          <div class="section-head"><h2 id="rel-title">Para compor com a ${esc(p.name.split(' ').slice(-1)[0])}</h2><a class="link-arrow" href="catalogo.html?area=${p.area}">Ver ${areaName[p.area]} ${icon('arrow')}</a></div>
          <div class="rail" tabindex="0" aria-label="Peças relacionadas">${related.map((p) => plate(p)).join('')}</div>
        </div>
      </section>`;

    let group = groups[0];
    const drawSwatches = () => {
      $('#swatches').innerHTML = p.finishes[group]
        .map((f) => `<button type="button" class="swatch" role="radio" aria-checked="${selected[group] === f.id}" data-id="${f.id}" aria-label="${f.name}, código ${f.code}"><span style="background:${f.color} url(img/finishes/${f.tex}.jpg) center/cover"></span></button>`)
        .join('');
      const f = p.finishes[group].find((x) => x.id === selected[group]);
      $('#swatch-name').innerHTML = `<strong>${f.name}</strong> <span class="meta">· ${f.code}</span>`;
      $$('.swatch').forEach((b) =>
        b.addEventListener('click', () => {
          selected[group] = b.dataset.id;
          drawSwatches();
          syncWhatsApp();
        }),
      );
    };
    $$('[data-group]').forEach((b) =>
      b.addEventListener('click', () => {
        group = b.dataset.group;
        $$('[data-group]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
        drawSwatches();
      }),
    );

    const syncWhatsApp = () => {
      const text = `Olá! Tenho interesse em ${qty} × ${p.name} (${finishLabel(p, selected)}). Pode me ajudar com o orçamento?`;
      $('#wa').href = `https://wa.me/${contact.quotesWhatsapp}?text=${encodeURIComponent(text)}`;
    };

    $$('[data-step]').forEach((b) =>
      b.addEventListener('click', () => {
        qty = Math.max(1, Math.min(99, qty + Number(b.dataset.step)));
        $('#qty').textContent = qty;
        syncWhatsApp();
      }),
    );

    $('#add').addEventListener('click', () => {
      quote.add(p.slug, { ...selected }, qty);
      const btn = $('#add');
      btn.classList.add('is-added');
      btn.innerHTML = `${icon('check')}Na lista`;
      $('#feedback').innerHTML = `${qty} × ${esc(p.name)} · ${esc(finishLabel(p, selected))}. <a href="lista.html">Ver lista (${quote.count()})</a>`;
      setTimeout(() => {
        btn.classList.remove('is-added');
        btn.innerHTML = `${icon('list')}Adicionar à lista de orçamento`;
      }, 2400);
    });

    const stage = $('#stage');
    let viewerReady = false;
    const load3d = () => {
      if (viewerReady) return;
      viewerReady = true;
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js';
      document.head.append(script);
      const viewer = document.createElement('model-viewer');
      Object.entries({
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
        alt: `Modelo 3D ilustrativo no lugar de ${p.name}`,
        'camera-controls': '',
        'touch-action': 'pan-y',
        'shadow-intensity': '0.8',
        exposure: '1.05',
        ar: '',
        'ar-modes': 'webxr scene-viewer quick-look',
      }).forEach(([k, v]) => viewer.setAttribute(k, v));
      viewer.addEventListener('load', () => $('#viewer-status')?.remove());
      viewer.addEventListener('error', () => {
        $('#viewer-status').textContent = 'Não foi possível carregar o 3D agora. Veja as fotos ou tente de novo.';
      });
      $('#stage-3d').prepend(viewer);
    };
    $$('[data-stage]').forEach((b) =>
      b.addEventListener('click', () => {
        $$('[data-stage]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        const is3d = b.dataset.stage === '3d';
        stage.classList.toggle('is-3d', is3d);
        if (is3d) load3d();
      }),
    );
    $$('.thumbs button').forEach((b) =>
      b.addEventListener('click', () => {
        $$('.thumbs button').forEach((x) => x.setAttribute('aria-current', String(x === b)));
        stage.classList.add('is-swapping');
        setTimeout(() => {
          $('#stage-img').src = b.dataset.src;
          $('#stage-img').style.objectFit = b.dataset.src.includes(p.img) ? 'contain' : 'cover';
          stage.classList.remove('is-swapping');
        }, 180);
      }),
    );

    drawSwatches();
    syncWhatsApp();
    bindQuickAdd($('main'));
    if (q.get('view') === '3d') $('[data-stage="3d"]').click();
  }

  /* ---------- sala para montar ---------- */
  function renderPlanner() {
    const PKEY = 'franccino.plan.v1';
    let plan;
    try {
      plan = JSON.parse(localStorage.getItem(PKEY));
    } catch {
      plan = null;
    }
    plan ??= {
      room: { w: 500, d: 400 },
      pieces: [
        { slug: 'sofa-majestic', x: 130, y: 280, r: 0 },
        { slug: 'mesa-de-centro-trem', x: 190, y: 170, r: 0 },
        { slug: 'poltrona-orvalho', x: 40, y: 130, r: 90 },
      ],
    };
    let selected = null;
    const save = () => {
      try {
        localStorage.setItem(PKEY, JSON.stringify(plan));
      } catch {
        /* ok */
      }
    };

    $('main').innerHTML = `
      <div class="wrap">
        <nav class="crumbs" aria-label="Você está em"><a href="index.html">Início</a><span>/</span><span aria-current="page">Sala para montar</span></nav>
        <div class="catalog-head" style="padding-top:8px">
          <div style="display:grid;gap:12px"><h1>Sala para montar</h1><p class="lead">Desenhe o ambiente com as medidas reais, arraste as peças e veja o que cabe. Tudo em escala.</p></div>
        </div>
        <div class="planner">
          <aside class="planner__side" aria-label="Ambiente e peças">
            <div class="field">
              <span class="label">Medidas do ambiente (m)</span>
              <div class="pair">
                <div class="field"><label for="rw">Largura</label><input id="rw" type="number" min="1.5" max="20" step="0.1" inputmode="decimal"></div>
                <div class="field"><label for="rd">Profundidade</label><input id="rd" type="number" min="1.5" max="20" step="0.1" inputmode="decimal"></div>
              </div>
            </div>
            <details class="library" id="library" open>
              <summary>Peças do catálogo</summary>
              <div class="field">
                <label for="find">Buscar peça</label>
                <input id="find" type="search" placeholder="Sofá, poltrona, mesa…">
              </div>
              <div class="piece-list" id="palette"></div>
            </details>
          </aside>

          <div class="planner__canvas">
            <div class="canvas-bar">
              <span id="hint">Arraste para mover. Selecione e use as setas; R gira; Delete remove.</span>
              <span style="display:flex;gap:8px">
                <button type="button" id="rot" disabled>${icon('rotate')}Girar</button>
                <button type="button" id="del" disabled>${icon('trash')}Remover</button>
              </span>
            </div>
            <div id="canvas"></div>
          </div>

          <aside class="planner__side" aria-label="Resumo">
            <h2 style="font-size:1.1rem">Conferência</h2>
            <ul class="checks" id="checks" style="list-style:none;margin:0;padding:0"></ul>
            <h2 style="font-size:1.1rem">Peças na sala</h2>
            <ul class="summary-list num" id="summary"></ul>
            <button class="btn btn--block" type="button" id="to-quote">${icon('list')}Enviar sala para a lista</button>
            <p class="meta">Vai para a lista de orçamento com as medidas do ambiente anotadas.</p>
          </aside>
        </div>
      </div>`;

    $('#rw').value = (plan.room.w / 100).toFixed(1);
    $('#rd').value = (plan.room.d / 100).toFixed(1);

    const conflictsOf = () => {
      const set = new Set();
      const boxes = plan.pieces.map(box);
      boxes.forEach((a, i) => {
        if (a.x < 0 || a.y < 0 || a.x + a.w > plan.room.w || a.y + a.d > plan.room.d) set.add(i);
        boxes.forEach((b, j) => {
          if (i < j && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.d && a.y + a.d > b.y) {
            set.add(i);
            set.add(j);
          }
        });
      });
      return set;
    };

    const draw = () => {
      const conflicts = conflictsOf();
      $('#canvas').innerHTML = planSVG({ room: plan.room, pieces: plan.pieces, selected, interactive: true, conflicts });
      $('#rot').disabled = selected === null;
      $('#del').disabled = selected === null;
      const used = plan.pieces.map(box).reduce((s, b) => s + b.w * b.d, 0);
      const floor = plan.room.w * plan.room.d;
      const pct = Math.round((used / floor) * 100);
      $('#checks').innerHTML = [
        conflicts.size
          ? `<li class="bad">${icon('close')}${conflicts.size} ${conflicts.size === 1 ? 'peça sobreposta ou fora' : 'peças sobrepostas ou fora'} do ambiente.</li>`
          : `<li class="good">${icon('check')}Todas as peças cabem sem sobreposição.</li>`,
        `<li>${icon('ruler')}Piso ocupado: <strong class="num">&nbsp;${pct}%</strong>${pct > 45 ? ', pouca área de circulação' : ''}</li>`,
      ].join('');
      const counts = {};
      plan.pieces.forEach((pc) => (counts[pc.slug] = (counts[pc.slug] ?? 0) + 1));
      $('#summary').innerHTML = Object.entries(counts)
        .map(([slug, n]) => `<li><span>${esc(bySlug(slug).name)}</span><span>${n}×</span></li>`)
        .join('') || '<li><span class="meta">Nenhuma peça ainda.</span></li>';
      bindCanvas();
      save();
    };

    const palette = (filter = '') => {
      const f = filter.trim().toLowerCase();
      $('#palette').innerHTML = products
        .filter((p) => !f || `${p.name} ${p.category}`.toLowerCase().includes(f))
        .map((p) => `<div class="piece-option"><img src="${img(p.img)}" alt=""><div><div style="font-size:.875rem;font-weight:500">${esc(p.name)}</div><div class="meta num">${p.shape === 'round' ? `Ø ${cm(p.w)}` : `${cm(p.w)} × ${cm(p.d)}`} cm</div></div><button type="button" data-put="${p.slug}" aria-label="Pôr ${esc(p.name)} na sala">${icon('plus')}</button></div>`)
        .join('');
      $$('[data-put]').forEach((b) =>
        b.addEventListener('click', () => {
          const p = bySlug(b.dataset.put);
          plan.pieces.push({ slug: p.slug, x: Math.max(0, Math.round((plan.room.w - p.w / 10) / 2)), y: Math.max(0, Math.round((plan.room.d - p.d / 10) / 2)), r: 0 });
          selected = plan.pieces.length - 1;
          draw();
        }),
      );
    };

    let drag = null;
    function bindCanvas() {
      const svg = $('#canvas svg');
      const toPlan = (e) => {
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
      };
      $$('.piece', svg).forEach((g) => {
        const i = Number(g.dataset.i);
        g.addEventListener('pointerdown', (e) => {
          const pos = toPlan(e);
          selected = i;
          drag = { i, dx: pos.x - plan.pieces[i].x, dy: pos.y - plan.pieces[i].y };
          g.setPointerCapture(e.pointerId);
          g.classList.add('is-dragging', 'is-selected');
        });
        g.addEventListener('pointermove', (e) => {
          if (!drag || drag.i !== i) return;
          const pos = toPlan(e);
          plan.pieces[i].x = Math.round((pos.x - drag.dx) / 5) * 5;
          plan.pieces[i].y = Math.round((pos.y - drag.dy) / 5) * 5;
          const pc = plan.pieces[i];
          g.setAttribute('transform', g.getAttribute('transform').replace(/translate\([^)]*\)/, `translate(${pc.x} ${pc.y})`));
        });
        const end = () => {
          if (drag) {
            drag = null;
            draw();
            $(`.piece[data-i="${i}"]`)?.focus();
          }
        };
        g.addEventListener('pointerup', end);
        g.addEventListener('pointercancel', end);
        g.addEventListener('focus', () => {
          if (selected !== i && !drag) {
            selected = i;
            $$('.piece', svg).forEach((x) => x.classList.toggle('is-selected', Number(x.dataset.i) === i));
            $('#rot').disabled = false;
            $('#del').disabled = false;
          }
        });
        g.addEventListener('keydown', (e) => {
          const step = e.shiftKey ? 1 : 5;
          const pc = plan.pieces[i];
          const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
          if (moves[e.key]) {
            e.preventDefault();
            pc.x += moves[e.key][0];
            pc.y += moves[e.key][1];
            draw();
            $(`.piece[data-i="${i}"]`)?.focus();
          } else if (e.key === 'r' || e.key === 'R') {
            rotate(i);
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            remove(i);
          }
        });
      });
    }

    const rotate = (i) => {
      plan.pieces[i].r = (plan.pieces[i].r + 90) % 360;
      draw();
      $(`.piece[data-i="${i}"]`)?.focus();
    };
    const remove = (i) => {
      plan.pieces.splice(i, 1);
      selected = null;
      draw();
    };

    $('#rot').addEventListener('click', () => selected !== null && rotate(selected));
    $('#del').addEventListener('click', () => selected !== null && remove(selected));
    const resize = () => {
      const w = Math.round(Math.min(20, Math.max(1.5, Number($('#rw').value) || 5)) * 100);
      const d = Math.round(Math.min(20, Math.max(1.5, Number($('#rd').value) || 4)) * 100);
      plan.room = { w, d };
      draw();
    };
    $('#rw').addEventListener('change', resize);
    $('#rd').addEventListener('change', resize);
    $('#find').addEventListener('input', (e) => palette(e.target.value));
    $('#to-quote').addEventListener('click', () => {
      if (!plan.pieces.length) {
        toast('Adicione ao menos uma peça à sala.');
        return;
      }
      const note = `Sala ${(plan.room.w / 100).toLocaleString('pt-BR')} × ${(plan.room.d / 100).toLocaleString('pt-BR')} m`;
      const counts = {};
      plan.pieces.forEach((pc) => (counts[pc.slug] = (counts[pc.slug] ?? 0) + 1));
      Object.entries(counts).forEach(([slug, n]) => quote.add(slug, defaultFinishes(bySlug(slug)), n, note));
      toast(`Sala enviada para a lista (${plan.pieces.length} peças). <a href="lista.html">Ver lista</a>`);
    });

    if (window.matchMedia('(max-width: 1200px)').matches) $('#library').open = false;
    palette();
    draw();
  }

  /* ---------- lista de orçamento ---------- */
  function renderQuote() {
    if (new URLSearchParams(location.search).has('demo') && !quote.read().length) {
      quote.add('cadeira-aura', { madeira: 'nogueira', tecido: 'boucle' }, 6);
      quote.add('sofa-majestic', defaultFinishes(bySlug('sofa-majestic')), 1, 'Sala 5,0 × 4,0 m');
      quote.add('poltrona-so-corda', defaultFinishes(bySlug('poltrona-so-corda')), 2);
    }
    const draw = () => {
      const items = quote.read();
      if (!items.length) {
        $('main').innerHTML = `<div class="wrap" style="padding-block:64px 120px">
          <div class="empty">
            <h1>Sua lista de orçamento está vazia</h1>
            <p class="lead">Junte as peças que interessam, com acabamento e quantidade, e mande tudo de uma vez para a nossa equipe.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a class="btn" href="catalogo.html?area=casa">Ver o catálogo</a><a class="btn btn--ghost" href="sala.html">Montar uma sala</a></div>
          </div></div>`;
        return;
      }
      $('main').innerHTML = `
        <div class="wrap">
          <nav class="crumbs" aria-label="Você está em"><a href="index.html">Início</a><span>/</span><span aria-current="page">Lista de orçamento</span></nav>
          <div class="catalog-head" style="padding-top:8px"><div style="display:grid;gap:12px"><h1>Lista de orçamento</h1><p class="lead">Confira acabamentos e quantidades. A equipe responde com valores, prazos e a loja mais próxima.</p></div></div>
          <div class="quote">
            <div class="quote-items">
              ${items
                .map((it, i) => {
                  const p = bySlug(it.slug);
                  return `<article class="quote-item">
                    <img src="${img(p.img)}" alt="">
                    <div style="display:grid;gap:6px">
                      <h2 style="font-size:1.1rem"><a href="produto.html?p=${p.slug}" style="text-decoration:none">${esc(p.name)}</a></h2>
                      <p class="meta">${esc(finishLabel(p, it.finishes))}</p>
                      ${it.note ? `<p class="meta">${esc(it.note)}</p>` : ''}
                    </div>
                    <div style="display:grid;gap:10px;justify-items:end">
                      <div class="stepper" role="group" aria-label="Quantidade de ${esc(p.name)}">
                        <button type="button" data-q="${i}" data-step="-1" aria-label="Diminuir">${icon('minus')}</button>
                        <output class="num">${it.qty}</output>
                        <button type="button" data-q="${i}" data-step="1" aria-label="Aumentar">${icon('plus')}</button>
                      </div>
                      <button class="remove" type="button" data-remove="${i}">${icon('trash')}Remover</button>
                    </div>
                  </article>`;
                })
                .join('')}
            </div>
            <form class="quote-form" id="qf" novalidate>
              <h2 style="font-size:1.25rem">Seus dados</h2>
              <div class="field"><label for="f-name">Nome</label><input id="f-name" name="name" autocomplete="name" required></div>
              <div class="pair">
                <div class="field"><label for="f-email">E-mail</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
                <div class="field"><label for="f-phone">Telefone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
              </div>
              <div class="pair">
                <div class="field"><label for="f-city">Cidade</label><input id="f-city" name="city" autocomplete="address-level2"></div>
                <div class="field"><label for="f-uf">UF</label><select id="f-uf" name="uf"><option value="">—</option>${['SP', 'MG', 'RJ', 'DF', 'PR', 'Outro'].map((u) => `<option>${u}</option>`).join('')}</select></div>
              </div>
              <div class="field"><label for="f-prof">Você é</label><select id="f-prof" name="profession"><option value="end_customer">Cliente final</option><option value="architect">Arquiteto(a)</option><option value="interior_designer">Designer de interiores</option><option value="retailer">Lojista</option></select></div>
              <div class="field"><label for="f-msg">Observações</label><textarea id="f-msg" name="message" rows="3" placeholder="Prazo, endereço de entrega, medidas especiais…"></textarea></div>
              <label class="consent"><input type="checkbox" id="f-consent" required><span>Concordo com a <a href="#">política de privacidade</a> e com o contato da Franccino sobre este orçamento.</span></label>
              <p class="field error" id="f-error" role="alert" hidden></p>
              <button class="btn btn--block" type="submit">Enviar pedido de orçamento</button>
              <a class="btn btn--ghost btn--block" id="wa-all" target="_blank" rel="noopener" href="#">${icon('chat')}Enviar a lista pelo WhatsApp</a>
            </form>
          </div>
        </div>`;

      const lines = items.map((it) => {
        const p = bySlug(it.slug);
        return `• ${it.qty} × ${p.name} (${finishLabel(p, it.finishes)})${it.note ? ` — ${it.note}` : ''}`;
      });
      $('#wa-all').href = `https://wa.me/${contact.quotesWhatsapp}?text=${encodeURIComponent(`Olá! Quero um orçamento destas peças:\n${lines.join('\n')}`)}`;

      $$('[data-step]').forEach((b) =>
        b.addEventListener('click', () => {
          const list = quote.read();
          const it = list[Number(b.dataset.q)];
          it.qty = Math.max(1, Math.min(99, it.qty + Number(b.dataset.step)));
          quote.write(list);
          draw();
        }),
      );
      $$('[data-remove]').forEach((b) =>
        b.addEventListener('click', () => {
          const list = quote.read();
          const [gone] = list.splice(Number(b.dataset.remove), 1);
          quote.write(list);
          draw();
          toast(`${esc(bySlug(gone.slug).name)} saiu da lista.`);
        }),
      );
      $('#qf').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#f-name');
        const email = $('#f-email');
        const consent = $('#f-consent');
        const problems = [];
        name.setAttribute('aria-invalid', String(!name.value.trim()));
        email.setAttribute('aria-invalid', String(!email.validity.valid || !email.value));
        if (!name.value.trim()) problems.push('informe seu nome');
        if (!email.value || !email.validity.valid) problems.push('confira o e-mail');
        if (!consent.checked) problems.push('aceite a política de privacidade');
        const err = $('#f-error');
        if (problems.length) {
          err.hidden = false;
          err.textContent = `Para enviar: ${problems.join(', ')}.`;
          return;
        }
        err.hidden = true;
        $('#qf').innerHTML = `<div class="form-status" role="status"><strong>Pedido recebido.</strong> A equipe responde em até 1 dia útil pelo e-mail informado. (Protótipo: nada foi enviado.)</div>`;
      });
    };
    draw();
  }

  /* ---------- telas restantes (plano P5a, Task 1) ----------
     Estrutura igual à que as Tasks 3–11 implementam em web/, com as classes de pages.css.
     Texto entre colchetes é espaço reservado: no site ele vem do painel. Nada aqui é conteúdo final. */
  const slot = (label) => `[${label}]`;
  const unique = (list) => [...new Set(list)];
  const plural = (n, one, other) => `${n} ${n === 1 ? one : other}`;
  const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const rule = '<hr style="border:0;border-top:1px solid var(--line);margin:0 0 40px">';
  const route = (path) => `<p class="meta" style="padding-top:8px">Tela de detalhe · ${path}</p>`;
  const photoOf = (name) => designers.find((d) => d.name === name);
  const piecesOfCollection = (c) => products.filter((p) => p.name.includes(c.match));

  function crumbs(items) {
    return `<nav class="crumbs" aria-label="Você está em"><a href="index.html">Início</a>${items
      .map(([label, href]) => `<span>/</span>${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}`)
      .join('')}</nav>`;
  }

  function pageHead({ title, lead = '', meta = '', level = 1 }) {
    return `<div class="catalog-head"><div style="display:grid;gap:12px"><h${level}>${esc(title)}</h${level}>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}</div>${meta ? `<p class="meta num">${meta}</p>` : ''}</div>`;
  }

  function tile({ href, image = '', title, meta = '', text = '', portrait = false, attrs = '' }) {
    return `<a class="tile${portrait ? ' tile--portrait' : ''}" href="${href}"${attrs}>
      <div class="tile__media">${image ? `<img src="${img(image)}" alt="" loading="lazy" width="1024" height="768">` : ''}</div>
      <div class="tile__copy"><h2 class="tile__title">${esc(title)}</h2>${meta ? `<p class="meta">${meta}</p>` : ''}${text ? `<p class="tile__text">${esc(text)}</p>` : ''}</div>
    </a>`;
  }

  function pagination(label) {
    return `<nav class="pagination" aria-label="${label}"><span></span><span class="meta num">Página 1 de 2</span><a class="link-arrow" href="#">Próxima ${icon('arrow')}</a></nav>`;
  }

  const frame = '<div class="tile__media"></div>';

  function collectionTile(c) {
    const n = piecesOfCollection(c).length;
    return tile({
      href: 'colecoes.html#detalhe',
      image: c.img,
      title: c.name,
      meta: n ? plural(n, 'peça', 'peças') : 'sem peças',
      text: c.summary ?? '',
    });
  }

  function designerTile(name) {
    const d = photoOf(name);
    return tile({ href: 'designers.html#detalhe', image: d?.img ?? '', title: name, text: d?.note ?? '', portrait: true });
  }

  function renderCollectionsPage() {
    const c = collections[0];
    const pieces = piecesOfCollection(c);
    $('main').innerHTML = `
      <div class="wrap">
        ${crumbs([['Coleções']])}
        ${pageHead({ title: 'Coleções', lead: 'Coleções da Franccino e as peças de cada uma.', meta: plural(collections.length, 'coleção', 'coleções') })}
        <div class="tiles">${collections.map(collectionTile).join('')}</div>
        ${rule}
        <section id="detalhe">
          ${route('/colecoes/arp')}
          ${pageHead({ title: c.name, level: 2 })}
          <div class="detail-hero">
            <div class="detail-hero__media"><img src="${img(c.img)}" alt="" width="1024" height="768"></div>
            <div class="detail-hero__copy">
              <div class="prose"><p>${esc(c.summary)}</p><p>${slot('Descrição da coleção cadastrada no painel')}</p></div>
              <dl class="facts"><div><dt>Design</dt><dd>${c.designers.map(esc).join(', ')}</dd></div></dl>
            </div>
          </div>
          <h2 class="section-title">Imagens da coleção</h2>
          <ul class="gallery-strip">${pieces.map((p) => `<li><img src="${img(p.img)}" alt="" loading="lazy" width="1024" height="768"></li>`).join('')}</ul>
          <h2 class="section-title">Peças da coleção</h2>
          <div class="grid-plates" style="padding-bottom:96px">${pieces.map((p) => plate(p)).join('')}</div>
        </section>
      </div>`;
    bindQuickAdd($('main'));
  }

  function renderDesignersPage() {
    const names = unique([...designers.map((d) => d.name), ...products.map((p) => p.designer)]);
    const name = 'Sérgio J. Matos';
    const d = photoOf(name);
    const pieces = products.filter((p) => p.designer === name);
    const own = collections.filter((c) => c.designers.includes(name));
    $('main').innerHTML = `
      <div class="wrap">
        ${crumbs([['Designers']])}
        ${pageHead({ title: 'Designers', lead: 'Designers e estúdios que assinam peças com a Franccino.', meta: plural(names.length, 'designer', 'designers') })}
        <div class="tiles">${names.map(designerTile).join('')}</div>
        ${rule}
        <section id="detalhe">
          ${route('/designers/sergio-j-matos')}
          ${pageHead({ title: name, level: 2 })}
          <div class="detail-hero">
            <div class="detail-hero__media"><img src="${img(d.img)}" alt="Retrato de ${esc(name)}" width="800" height="1000"></div>
            <div class="detail-hero__copy">
              <div class="prose"><p>${esc(d.note)}</p><p>${slot('Biografia cadastrada no painel')}</p></div>
              <ul class="store__links"><li><a href="#">Site</a></li><li><a href="#">Instagram</a></li></ul>
              <h3 style="font-size:1rem">Coleções do designer</h3>
              <div class="chips">${own.map((c) => `<a class="chip" href="colecoes.html#detalhe">${esc(c.name)}</a>`).join('')}</div>
            </div>
          </div>
          <h2 class="section-title">Peças do designer</h2>
          <div class="grid-plates" style="padding-bottom:96px">${pieces.map((p) => plate(p)).join('')}</div>
        </section>
      </div>`;
    bindQuickAdd($('main'));
  }

  const projectTypes = { residential: 'Residencial', corporate: 'Corporativo' };
  const projectSlots = ['residential', 'corporate', 'residential', 'residential', 'corporate', 'residential'];

  function projectTile(type) {
    return tile({
      href: 'projetos.html#detalhe',
      title: slot('Título do projeto'),
      meta: `${projectTypes[type]} · ${slot('Cidade')} · ${slot('Ano')}`,
      text: slot('Resumo do projeto'),
      attrs: ` data-type="${type}"`,
    });
  }

  function renderProjectsPage() {
    $('main').innerHTML = `
      <div class="wrap">
        ${crumbs([['Projetos']])}
        ${pageHead({ title: 'Projetos', lead: 'Projetos residenciais e corporativos com peças da Franccino.', meta: `<span id="p-count"></span>` })}
        <div class="chips" role="group" aria-label="Tipo de projeto" style="margin-bottom:32px">
          <button class="chip" type="button" data-type-filter="" aria-pressed="true">Todos</button>
          <button class="chip" type="button" data-type-filter="residential" aria-pressed="false">Residencial</button>
          <button class="chip" type="button" data-type-filter="corporate" aria-pressed="false">Corporativo</button>
        </div>
        <div class="tiles" id="p-list" style="padding-bottom:0">${projectSlots.map(projectTile).join('')}</div>
        ${pagination('Páginas de projetos')}
        ${rule}
        <section id="detalhe">
          ${route('/projetos/[slug]')}
          ${pageHead({ title: slot('Título do projeto'), level: 2 })}
          <div class="detail-hero">
            <div class="detail-hero__media">${frame}</div>
            <div class="detail-hero__copy">
              <dl class="facts">
                <div><dt>Cliente</dt><dd>${slot('Cliente')}</dd></div>
                <div><dt>Arquitetura</dt><dd>${slot('Escritório')}</dd></div>
                <div><dt>Local</dt><dd>${slot('Cidade — UF')}</dd></div>
                <div><dt>Ano</dt><dd class="num">${slot('Ano')}</dd></div>
              </dl>
              <div class="prose"><p>${slot('Descrição do projeto cadastrada no painel')}</p></div>
            </div>
          </div>
          <h2 class="section-title">Imagens do projeto</h2>
          <ul class="gallery-strip">${'<li><div class="tile__media"></div></li>'.repeat(3)}</ul>
          <h2 class="section-title">Peças no projeto</h2>
          <div class="grid-plates" style="padding-bottom:72px">${products.slice(0, 3).map((p) => plate(p)).join('')}</div>
        </section>
        ${rule}
        <section id="corporativo">
          ${route('/corporativo')}
          ${pageHead({ title: 'Corporativo', lead: slot('Introdução cadastrada no painel'), level: 2 })}
          <div class="blocks" style="padding-bottom:56px">
            <div class="block-image-text" data-image-position="left">
              <div class="block-image-text__media">${frame}</div>
              <div class="prose"><h2>${slot('Título do bloco')}</h2><p>${slot('Texto do bloco de imagem e texto')}</p></div>
            </div>
          </div>
          <h2 class="section-title">Projetos corporativos</h2>
          <div class="tiles">${['corporate', 'corporate', 'corporate'].map(projectTile).join('')}</div>
          <h2 class="section-title">Clientes</h2>
          <ul class="logo-wall">${`<li><span class="meta">${slot('Logo do cliente')}</span></li>`.repeat(6)}</ul>
        </section>
      </div>`;

    const draw = (type) => {
      const tiles = $$('#p-list .tile');
      tiles.forEach((t) => (t.hidden = Boolean(type) && t.dataset.type !== type));
      const n = tiles.filter((t) => !t.hidden).length;
      $('#p-count').textContent = plural(n, 'projeto', 'projetos');
    };
    $$('[data-type-filter]').forEach((b) =>
      b.addEventListener('click', () => {
        $$('[data-type-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        draw(b.dataset.typeFilter);
      }),
    );
    draw('');
  }

  function renderFactoryPage() {
    $('main').innerHTML = `
      <div class="wrap">
        ${crumbs([['Fábrica']])}
        ${pageHead({ title: 'Fábrica' })}
        <img class="page-cover" src="${img('fabrica')}" alt="" width="1600" height="900">
        <div class="blocks">
          <div class="prose"><p>${slot('Introdução cadastrada no painel')}</p></div>
          <dl class="stats num">
            ${`<div><dt>${slot('Número')}</dt><dd>${slot('Legenda')}</dd></div>`.repeat(3)}
          </dl>
          <ol class="timeline">
            ${`<li><span class="timeline__year num">${slot('Ano')}</span><div><h3>${slot('Marco')}</h3><p>${slot('Descrição do marco')}</p></div></li>`.repeat(3)}
          </ol>
          <div class="block-image-text" data-image-position="left">
            <div class="block-image-text__media"><img src="${img('fabrica')}" alt="" loading="lazy" width="1024" height="768"></div>
            <div class="prose"><h2>${slot('Título do bloco')}</h2><p>${slot('Texto do bloco, imagem à esquerda')}</p></div>
          </div>
          <div class="block-image-text" data-image-position="right">
            <div class="block-image-text__media">${frame}</div>
            <div class="prose"><h2>${slot('Título do bloco')}</h2><p>${slot('Texto do bloco, imagem à direita')}</p></div>
          </div>
          <blockquote class="block-quote"><p>${slot('Citação cadastrada no painel')}</p><cite>${slot('Autor')}</cite></blockquote>
          <figure class="block-gallery" style="margin:0">
            <ul>${products.slice(0, 3).map((p) => `<li><img src="${img(p.img)}" alt="" loading="lazy" width="1024" height="768"></li>`).join('')}</ul>
            <figcaption>${slot('Legenda da galeria')}</figcaption>
          </figure>
        </div>
      </div>`;
  }

  function renderFinishesPage() {
    const groups = { ...bySlug('cadeira-aura').finishes, ...bySlug('sofa-adhara').finishes };
    const total = Object.values(groups).reduce((sum, list) => sum + list.length, 0);
    // Tons marcados como ilustrativos mostram o cartão sem imagem (código em texto), como o site faz sem foto.
    const card = (f) => `<li class="finish-card">
        <div class="finish-card__swatch">${f.name.includes('ilustrativo') ? `<span class="finish-card__fallback num">${esc(f.code)}</span>` : `<img src="img/finishes/${f.tex}.jpg" alt="" loading="lazy" width="400" height="400">`}</div>
        <strong>${esc(f.name)}</strong>
        <span class="meta num">${esc(f.code)}</span>
      </li>`;
    $('main').innerHTML = `
      <div class="wrap">
        ${crumbs([['Acabamentos']])}
        ${pageHead({ title: 'Acabamentos', meta: plural(total, 'acabamento', 'acabamentos') })}
        ${Object.entries(groups)
          .map(([group, list]) => `<section class="finish-group"><h2 class="section-title">${groupName[group]}</h2><ul class="finish-grid">${list.map(card).join('')}</ul></section>`)
          .join('')}
      </div>`;
  }

  const storeType = { 'Loja exclusiva': 'exclusive', Revenda: 'reseller' };

  function renderStoresPage() {
    const states = unique(stores.map((s) => s.state));
    const filter = { state: '', type: '' };
    const chip = (attr, value, label, pressed) => `<button class="chip" type="button" data-${attr}="${value}" aria-pressed="${pressed}">${label}</button>`;
    $('main').innerHTML = `
      <div class="wrap">
        ${crumbs([['Lojas']])}
        ${pageHead({ title: 'Lojas', meta: '<span id="s-count"></span>' })}
        <div class="stores" style="padding-bottom:96px">
          <div style="display:grid;gap:20px;align-content:start">
            <div class="chips" role="group" aria-label="Estado">${chip('state', '', 'Todos os estados', true)}${states.map((s) => chip('state', s, s, false)).join('')}</div>
            <div class="chips" role="group" aria-label="Tipo de loja">${chip('type', '', 'Todos os tipos', true)}${chip('type', 'exclusive', 'Loja exclusiva', false)}${chip('type', 'reseller', 'Revenda', false)}</div>
          </div>
          <div class="store-list" id="s-list"></div>
        </div>
      </div>`;

    const mapLink = (s) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.address}, ${s.city} - ${s.state}`)}`;
    const draw = () => {
      const list = stores.filter((s) => (!filter.state || s.state === filter.state) && (!filter.type || storeType[s.type] === filter.type));
      $('#s-count').textContent = plural(list.length, 'loja', 'lojas');
      $('#s-list').innerHTML = list.length
        ? list
            .map(
              (s) => `<article class="store">
            <h2 style="font-size:1.1rem">${esc(s.name)}</h2>
            <address>${esc(s.address)}<br>${esc(s.city)} — ${s.state}</address>
            <p class="meta">${s.type}</p>
            <ul class="store__links">
              <li><a href="tel:${s.phone.replace(/\D/g, '')}">${s.phone}</a></li>
              <li><a href="${mapLink(s)}" target="_blank" rel="noopener">${icon('pin')}Ver no mapa<span class="visually-hidden"> (abre em nova janela)</span></a></li>
            </ul>
          </article>`,
            )
            .join('')
        : '<p class="meta">Nenhuma loja encontrada.</p>';
    };
    for (const attr of ['state', 'type']) {
      $$(`[data-${attr}]`).forEach((b) =>
        b.addEventListener('click', () => {
          $$(`[data-${attr}]`).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          filter[attr] = b.dataset[attr];
          draw();
        }),
      );
    }
    draw();
  }

  function renderDownloadsPage() {
    $('main').innerHTML = `
      <div class="wrap">
        ${crumbs([['Downloads']])}
        ${pageHead({ title: 'Downloads', meta: '<span id="d-count"></span>' })}
        <form class="search-form" id="d-form">
          <div class="field" style="flex:0 1 220px"><label for="d-area">Linha</label><select id="d-area"><option value="">Todas as linhas</option><option value="casa">Casa</option><option value="giardini">Giardini</option></select></div>
          <div class="field"><label for="d-q">Buscar peça</label><input id="d-q" type="search"></div>
          <button class="btn" type="submit">Filtrar</button>
        </form>
        <div id="d-results"></div>
        ${pagination('Páginas de downloads')}
      </div>`;

    const draw = () => {
      const area = $('#d-area').value;
      const q = fold($('#d-q').value.trim());
      const list = products.filter((p) => (!area || p.area === area) && (!q || fold(p.name).includes(q)));
      $('#d-count').textContent = plural(list.length, 'peça com arquivos', 'peças com arquivos');
      $('#d-results').innerHTML = list.length
        ? `<div class="table-scroll" role="region" aria-label="Arquivos técnicos por peça" tabindex="0"><table class="tech-table">
          <caption class="visually-hidden">Peças e arquivos técnicos para download</caption>
          <thead><tr><th scope="col"><span class="visually-hidden">Imagem</span></th><th scope="col">Peça</th><th scope="col">Linha</th><th scope="col">Arquivos</th></tr></thead>
          <tbody>${list
            .map(
              (p) => `<tr>
              <td><img class="thumb" src="${img(p.img)}" alt="" loading="lazy"></td>
              <td><a href="produto.html?p=${p.slug}"><strong>${esc(p.name)}</strong></a><div class="meta">${p.category}</div></td>
              <td><span class="area-dot area-dot--${p.area}"></span>${p.area === 'casa' ? 'Casa' : 'Giardini'}</td>
              <td><div class="file-links"><a href="#">Ficha PDF</a><a href="#">DWG</a><a href="#">SKP</a></div></td>
            </tr>`,
            )
            .join('')}</tbody></table></div>`
        : '<div class="empty"><p class="lead">Nenhuma peça com arquivos para estes filtros.</p></div>';
    };
    $('#d-form').addEventListener('submit', (e) => {
      e.preventDefault();
      draw();
    });
    draw();
  }

  function renderContactPage() {
    const wa = (n) => `<a href="https://wa.me/${n}" target="_blank" rel="noopener">Conversar no WhatsApp</a>`;
    const types = ['Orçamento', 'Assistência técnica', 'Parceria', 'Imprensa', 'Outro'];
    $('main').innerHTML = `
      <div class="wrap">
        ${crumbs([['Contato']])}
        ${pageHead({ title: 'Contato' })}
        <div class="contact-layout">
          <section style="display:grid;gap:20px" aria-labelledby="ch-title">
            <h2 id="ch-title" style="font-size:1.25rem">Fale com a Franccino</h2>
            <dl class="facts">
              <div><dt>Telefone</dt><dd><a href="tel:+553733814204">${contact.phone}</a></dd></div>
              <div><dt>E-mail</dt><dd><a href="mailto:${contact.email}">${contact.email}</a></dd></div>
              <div><dt>Orçamentos</dt><dd>${wa(contact.quotesWhatsapp)}</dd></div>
              <div><dt>Assistência técnica</dt><dd>${wa(contact.assistanceWhatsapp)}</dd></div>
              <div><dt>Fábrica</dt><dd>${esc(contact.address)}</dd></div>
            </dl>
          </section>
          <form class="quote-form" id="cf" novalidate>
            <h2 style="font-size:1.25rem">Envie uma mensagem</h2>
            <div class="field"><label for="c-name">Nome</label><input id="c-name" autocomplete="name" required></div>
            <div class="pair">
              <div class="field"><label for="c-email">E-mail</label><input id="c-email" type="email" autocomplete="email" required></div>
              <div class="field"><label for="c-phone">Telefone</label><input id="c-phone" type="tel" autocomplete="tel"></div>
            </div>
            <div class="field"><label for="c-type">Assunto</label><select id="c-type">${types.map((t) => `<option>${t}</option>`).join('')}</select></div>
            <div class="field"><label for="c-msg">Mensagem</label><textarea id="c-msg" rows="4" required></textarea></div>
            <label class="consent"><input type="checkbox" id="c-consent" required><span>Li e concordo com a <a href="legal.html">política de privacidade</a>.</span></label>
            <p class="field error" id="c-error" role="alert" hidden></p>
            <button class="btn btn--block" type="submit">Enviar</button>
          </form>
        </div>
        <section class="faq" style="margin-bottom:96px" aria-labelledby="faq-title">
          <h2 id="faq-title" class="section-title" style="padding-top:20px">${slot('Título do bloco de perguntas')}</h2>
          ${`<details><summary>${slot('Pergunta cadastrada no painel')}</summary><p>${slot('Resposta cadastrada no painel')}</p></details>`.repeat(3)}
        </section>
      </div>`;

    $('#cf').addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = ['#c-name', '#c-email', '#c-msg'].map((sel) => $(sel));
      fields.forEach((f) => f.setAttribute('aria-invalid', String(!f.value.trim() || !f.validity.valid)));
      const ok = fields.every((f) => f.value.trim() && f.validity.valid) && $('#c-consent').checked;
      const err = $('#c-error');
      err.hidden = ok;
      if (!ok) {
        err.textContent = 'Confira nome, e-mail, mensagem e o aceite da política de privacidade.';
        return;
      }
      $('#cf').innerHTML = '<div class="form-status" role="status"><strong>Enviado com sucesso.</strong> (Protótipo: nada foi enviado.)</div>';
    });
  }

  function renderSearchPage() {
    const query = new URLSearchParams(location.search).get('q') ?? 'Matos';
    const q = fold(query.trim());
    const hit = (s) => q && fold(s).includes(q);
    const foundProducts = products.filter((p) => hit(p.name) || hit(p.designer));
    const foundDesigners = unique(products.map((p) => p.designer)).filter(hit);
    const foundCollections = collections.filter((c) => hit(c.name) || c.designers.some(hit));
    const group = (title, body) => `<section class="result-group"><h2 class="section-title">${title}</h2>${body}</section>`;
    const empty = '<div class="empty"><h2>Nenhum resultado encontrado.</h2><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a class="btn btn--ghost" href="catalogo.html?area=casa">Ver o catálogo</a></div></div>';
    const any = foundProducts.length + foundDesigners.length + foundCollections.length;
    $('main').innerHTML = `
      <div class="wrap" style="padding-bottom:96px">
        ${crumbs([['Busca']])}
        ${pageHead({ title: 'Busca' })}
        <form class="search-form" action="busca.html" role="search">
          <div class="field"><label for="s-q">Buscar</label><input id="s-q" name="q" type="search" value="${esc(query)}" placeholder="O que você procura?"></div>
          <button class="btn" type="submit">Buscar</button>
        </form>
        ${
          any
            ? `<p class="meta" style="margin-bottom:24px">Resultados para “${esc(query)}”</p>
          ${foundProducts.length ? group('Peças', `<div class="grid-plates">${foundProducts.map((p) => plate(p)).join('')}</div>`) : ''}
          ${foundDesigners.length ? group('Designers', `<div class="tiles" style="padding-bottom:0">${foundDesigners.map(designerTile).join('')}</div>`) : ''}
          ${foundCollections.length ? group('Coleções', `<div class="tiles" style="padding-bottom:0">${foundCollections.map(collectionTile).join('')}</div>`) : ''}`
            : empty
        }
        ${any ? `<div style="margin-top:72px">${rule}<p class="meta" style="margin-bottom:16px">Estado sem resultado</p>${empty}</div>` : ''}
      </div>`;
    bindQuickAdd($('main'));
  }

  function renderLegalPage() {
    const section = `<h2>${slot('Título da seção')}</h2><p>${slot('Texto jurídico cadastrado no painel pela Franccino')}</p>`;
    $('main').innerHTML = `
      <div class="wrap" style="padding-bottom:96px">
        ${crumbs([['Política de privacidade']])}
        ${pageHead({ title: 'Política de privacidade', lead: slot('Introdução cadastrada no painel') })}
        <div class="prose">${section.repeat(3)}</div>
        <div id="termos" style="margin-top:72px">
          ${rule}
          <p class="meta">Página sem texto publicado · /termos</p>
          ${pageHead({ title: 'Termos de uso', level: 2 })}
          <div class="empty"><p class="lead">O texto desta página ainda não foi publicado.</p></div>
        </div>
      </div>`;
  }

  function renderErrorPage() {
    const actions = (first) => `<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">${first}</div>`;
    $('main').innerHTML = `
      <div class="wrap error-page">
        <div class="empty">
          <h1>Página não encontrada</h1>
          <p class="lead">O conteúdo que você procura não existe ou foi movido.</p>
          ${actions('<a class="btn" href="index.html">Voltar para a página inicial</a><a class="btn btn--ghost" href="catalogo.html?area=casa">Ver o catálogo</a>')}
        </div>
      </div>
      <div class="wrap">${rule}<p class="meta">Erro no servidor (500)</p></div>
      <div class="wrap error-page">
        <div class="empty">
          <h2>Algo deu errado</h2>
          <p class="lead">Não foi possível concluir esta ação. Tente novamente.</p>
          ${actions('<button class="btn" type="button" onclick="location.reload()">Tentar novamente</button><a class="btn btn--ghost" href="index.html">Voltar para a página inicial</a>')}
        </div>
      </div>`;
  }

  renderChrome();
  ({
    home: renderHome,
    catalogo: renderCatalog,
    produto: renderProduct,
    sala: renderPlanner,
    lista: renderQuote,
    colecoes: renderCollectionsPage,
    designers: renderDesignersPage,
    projetos: renderProjectsPage,
    fabrica: renderFactoryPage,
    acabamentos: renderFinishesPage,
    lojas: renderStoresPage,
    downloads: renderDownloadsPage,
    contato: renderContactPage,
    busca: renderSearchPage,
    legal: renderLegalPage,
    erro: renderErrorPage,
  })[page]?.();
})();
