# Protótipo de direção visual

Protótipo navegável (HTML, CSS e JS puros) usado para aprovar a direção visual antes da implementação no Next.js.
Não é código de produção: a implementação real fica em `web/` e consome a API.

Rodar localmente:

```bash
cd design/prototype
python -m http.server 4173
```

Abrir http://localhost:4173. As fotos em `img/` vêm do site atual e não são versionadas (ver `.gitignore`);
medidas, acabamentos e arquivos são ilustrativos.

## Telas

Aprovadas (P1): `index.html` (home), `catalogo.html`, `produto.html`, `sala.html` e `lista.html`.

Para aprovação (plano P5a, Task 1, item B1), com a mesma estrutura que as Tasks 3–11 implementam em `web/`:

| Tela               | O que mostra                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| `colecoes.html`    | Lista de coleções e, abaixo da linha, o detalhe de uma coleção                                     |
| `designers.html`   | Lista de designers e o detalhe de um designer                                                      |
| `projetos.html`    | Lista com filtro por tipo e paginação, detalhe de projeto e a página Corporativo                   |
| `fabrica.html`     | Capa, introdução e os blocos do painel (números, linha do tempo, imagem e texto, citação, galeria) |
| `acabamentos.html` | Acabamentos por grupo; sem foto, o cartão mostra o código                                          |
| `lojas.html`       | Filtro por estado e por tipo, cartões com "Ver no mapa" (link do Google Maps, sem mapa embutido)   |
| `downloads.html`   | Filtro por linha e busca, tabela de arquivos por peça e paginação                                  |
| `contato.html`     | Canais, formulário e perguntas frequentes                                                          |
| `busca.html`       | Resultados em peças, designers e coleções (`?q=` muda o termo) e o estado sem resultado            |
| `legal.html`       | Página com texto (privacidade) e página sem texto publicado (termos)                               |
| `erro.html`        | Página não encontrada (404) e erro no servidor (500)                                               |

- Os textos fixos (títulos, rótulos, botões, avisos) são os mesmos das mensagens previstas no plano P5a.
- **Texto entre colchetes é espaço reservado**: no site ele vem do painel (descrições, biografias, projetos,
  números da fábrica, perguntas frequentes, textos jurídicos). Nada disso é conteúdo final.
- Coleções (`assets/data.js`) e projetos são **ilustrativos**. Lojas e canais de contato vêm do site atual.
- As telas carregam `assets/tokens-web.css` (cópia de `web/src/styles/tokens.css`) e `assets/pages.css`
  (idêntico a `web/src/styles/pages.css` da Task 2): o que for aprovado aqui é o CSS que vai para produção.
