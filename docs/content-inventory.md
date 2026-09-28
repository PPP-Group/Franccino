# Inventário do site atual (franccino.com.br)

Levantamento técnico feito em 2026-09-23 a partir da API REST pública do WordPress, dos sitemaps do Yoast e
de algumas páginas HTML. Base para o modelo de dados, o script de migração e o mapa de redirects.

## Plataforma

- WordPress com tema Hello Elementor, **Elementor Pro** (layout de todas as páginas e templates) e
  **JetEngine** (tipos de conteúdo, campos personalizados, relações, listagens, mapa de lojas, wishlist),
  além de JetSmartFilters, JetFormBuilder, JetPopup e JetThemeCore.
- SEO pelo **Yoast** (sitemaps e `yoast_head_json` em cada objeto da API).
- Sem WooCommerce, ACF ou plugin de tradução. **Não existe versão em inglês**.

## Volume de conteúdo

| Conteúdo | Endpoint REST | Quantidade | Observação |
|---|---|---|---|
| Produtos | `/wp/v2/produtos` | 400 | URL `/produto/<slug>/` |
| Designers | `/wp/v2/designers` | 16 | URL `/designer/<slug>/` |
| Coleções | `/wp/v2/colecoes` | 11 | tipo de post, não taxonomia |
| Linhas (famílias) | `/wp/v2/linhas` | 286 termos (228 em uso) | agrupam variantes |
| Áreas | `/wp/v2/areas` | 2 | Interna 177, Externa 207 |
| Categorias de produto | `/wp/v2/categorias-produtos` | 41 | duplicadas como "X Casa" e "X Giardini" |
| Downloads | `/wp/v2/downloads` | 316 | posts "Bloco – <produto>", quase todos sem arquivo |
| Lojas | `/wp/v2/lojas` | 22 | taxonomia `estado` (9 UFs em uso) |
| Projetos / Cases / Clientes / Banners | `/projetos`, `/cases`, `/clientes`, `/banners` | 4 / 3 / 8 / 1 | |
| Páginas / Posts | `/pages`, `/posts` | 15 / 3 | blog fora do menu |
| Mídia | `/wp/v2/media` | ~3.900 | 230 PDF, 1 ZIP, o resto imagens servidas em WebP |

## Campos de produto

A API REST expõe só título, slug, datas, termos (linha, área, categoria) e SEO. **Os campos do JetEngine
não saem na API**: descrição, medidas, material, acabamento, designer, galeria e relações só aparecem no
HTML. A página de produto mostra:

- tipo e nome, frase de apoio, descrição rica;
- galeria (a ordem não está na API; imagens anexadas podem ser listadas por `/wp/v2/media?parent=<id>`);
- designer (um por produto);
- tabela técnica: medidas em texto livre (`600L X 600P X 750A`, em mm), material e acabamento em prosa,
  sem cartela de acabamentos;
- bloco de downloads (vazio nos produtos verificados) e produtos relacionados;
- **sem** visualizador 3D, sem "onde encontrar" e sem campo de coleção (a coleção aparece só no texto).

## Arquivos técnicos e 3D

- Nenhum arquivo GLB, GLTF, OBJ, FBX, 3DS, MAX, DWG ou DXF na biblioteca de mídia.
- Um único modelo SketchUp compactado (`CADEIRA-BRISA-S-BRACO.skp_.zip`).
- ~226 PDFs de produto (`NN-Tipo-Nome-Designer.pdf`, maio–junho de 2024) e 4 relatórios de
  transparência salarial linkados no rodapé (exigência legal, precisam continuar acessíveis).
- Os downloads parecem ter sido planejados atrás de um cadastro (popup `cadastro-download`).

**Consequência:** os modelos GLB do visualizador 3D precisam ser produzidos; nada existente pode ser
convertido automaticamente.

## URLs (mapa de redirects)

`sitemap_index.xml` do Yoast com 19 sitemaps, **1.094 URLs** no total:

| Sitemap | URLs | Padrão |
|---|---|---|
| produtos | 401 | `/produto/<slug>/` |
| downloads | 316 | `/downloads/<slug>/` |
| linhas | 228 | `/?taxonomy=linhas&term=<slug>` (query string) |
| categorias-produtos | 38 | `/categoria/interna/<slug>/`, `/categoria/externa/<slug>/` |
| lojas | 23 | `/lojas/<slug>/` |
| designers | 17 | `/designer/<slug>/` |
| page | 15 | `/<slug>/` |
| colecoes | 12 | `/colecoes/<slug>/` |
| estado | 9 | `/estado/<slug>/` |
| clientes, projetos, cases, jet-popup, categorias-de-downloads, post, category, areas, banners, author | 1 a 8 cada | |

Além disso, ~3.900 arquivos em `/wp-content/uploads/AAAA/MM/` fora dos sitemaps.

## Navegação atual

Menu: Produtos (Área Interna `/produtos-indoor/`, Área Externa `/produtos-outdoor/`, Todos os Produtos
`/todos-produtos/`), Coleções, Designers, Lançamentos, Corporativo, Fábrica (`/institucional/`), Lojas,
Contato. Rodapé: categorias Casa e Giardini, Termos, Privacidade, relatórios de transparência salarial,
redes sociais, WhatsApp e newsletter.

Páginas: Home, Institucional (Fábrica), Contato, Corporativo, Lançamentos, Designers, Seja um Parceiro,
Todos os Produtos, Produtos Interno, Produtos Externo, Wishlist, `/belohorizonte/`, `/6369-2/`
(WhatsApp Goiânia), Termos, Privacidade.

## Pontos de atenção para a migração

1. **Campos e relações do JetEngine não estão na API REST.** Caminhos, do mais completo ao menos:
   dump do banco (inclui as tabelas `wp_jet_rel_*`), habilitar "Show in REST" nos campos do JetEngine,
   exportação padrão do WordPress ou do ImportWP, e raspagem do HTML como último recurso.
2. Medidas, materiais e acabamentos são texto livre; a cartela de acabamentos será montada à mão.
3. Área aparece duplicada (taxonomia `areas` e nomes "Casa/Giardini" nas categorias). Variantes são
   produtos separados agrupados por `linhas`.
4. Slugs inconsistentes: sufixos `-2`/`-3`, slugs numéricos (`/produto/6587/`), rascunhos automáticos,
   `/produto/cadeira/` para a Cadeira Dallas, loja "Franccino Londrina" duplicada, downloads de teste.
5. As 228 URLs de linhas usam query string; o redirect precisa casar parâmetros.
6. Mídia servida em `.webp` mesmo quando a API diz jpeg/png: as originais podem não existir mais.
   URLs antigas de `/wp-content/uploads/` (principalmente os PDFs legais) precisam continuar funcionando.
7. Páginas institucionais montadas no Elementor: texto será recadastrado.
8. URLs sem valor indexadas (jet-popup, banners, author, downloads vazios): redirecionar ou responder 410.
