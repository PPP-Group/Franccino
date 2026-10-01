# SDD ledger — plan: docs/plans/2026-09-29-p5a-web-paginas-restantes.md

Spec: docs/specs/2026-09-23-fundacao-design.md (binding). Base: `develop` com os PRs #9 (API, P2 T12–T14) e #10 (web, P4 T8–T12) mergeados.

## Rulings

As decisões R1–R24 do ledger do P4 (docs/handoff/p4-web-paginas-ledger.md) continuam valendo. Novas decisões deste plano entram aqui como "Ruling (Rn, Tn)".

## Aprovação de design (B1)

Registrar para cada rodada: data, quem aprovou (tech lead e Franccino), telas cobertas e ajustes pedidos. As Tasks 2–11 só começam depois da aprovação por escrito.

## Progress

Plano escrito em 2026-09-29; aguardando aprovação do tech lead.

- **Task 1 (telas no protótipo), 2026-09-29, branch `feature/p5a-prototipo`:** adiantada enquanto #9–#11 aguardam revisão, a pedido do Pedro Silva, porque só mexe em `design/prototype/` e o que ela produz é justamente o material da aprovação B1. **Desvio registrado:** o plano pede B4 (#9 e #10 mergeados) para todas as tasks; aqui a base é `feature/p5a-plano`, e `tokens-web.css` foi copiado de `feature/fundacao-web` (#10). Se #10 mudar `tokens.css` antes do merge, recopiar.
  - Entregue: `assets/tokens-web.css`, `assets/pages.css` (idêntico ao CSS da Task 2, Step 3), 11 telas (`colecoes`, `designers`, `projetos` com corporativo, `fabrica`, `acabamentos`, `lojas`, `downloads`, `contato`, `busca`, `legal`, `erro`), com os renderizadores no `app.js`, como as telas já aprovadas. Coleções ilustrativas em `data.js`. Header e rodapé apontam para as telas novas. `.pagination` copiada de `web/src/styles/catalog.css` para `styles.css`. README com a lista das telas.
  - Textos fixos = mensagens pt previstas no plano. Conteúdo do painel aparece como espaço reservado entre colchetes (nada inventado).
  - Conferido no navegador em 375 e 1440 px: sem rolagem horizontal nas 11 telas; filtros (projetos, lojas, downloads), formulário de contato, busca com e sem resultado e FAQ funcionando, sem erro de JS. Links de texto nas tabelas e o checkbox de aceite ficam abaixo de 44 px, igual às telas já aprovadas.
  - Achado fora do escopo: a home do protótipo (`index.html`) passa de 375 px (820 px). É o mesmo problema da `.table-scroll` que o P4 corrigiu no site; não foi mexido aqui.
  - **Falta:** Step 4 (aprovação por escrito do tech lead + Franccino). As Tasks 2–11 continuam bloqueadas até lá.
- **Tasks 2–11, 2026-10-01, branch `claude/awesome-keller-iv02zw`:** executadas a pedido do product owner (Pedro Ivo) para adiantar o projeto e montar a prévia do cliente. **Desvio registrado:** o plano só libera as Tasks 2–11 depois da aprovação B1 por escrito, que ainda não existe; se a Franccino pedir ajustes nas telas, eles entram por cima. Base: `develop` + PRs #9–#13 por cherry-pick (B4 cumprido na branch, não no `develop`).
  - Um commit por task (`026363d` a `7e7400b`), cada um com lint, typecheck, testes e build verdes.
  - Acrescentado fora do plano, a pedido: carrossel da home, Mapa do site (PPP-110), foto e descrição das lojas (PPP-108), vídeos e links (PPP-106), downloads em designer e lançamento (PPP-109). Detalhes no `HANDOFF.md`, seção 4.5.
  - Corrigido depois: `generateStaticParams` de projetos pedia `per_page: 100` e a API limita a 48; o build quebrava com qualquer projeto publicado. Agora pagina (`getAllProjectSlugs`).
  - **Falta:** aprovação B1 das telas e revisão do tech lead (a branch ainda não tem PR).
