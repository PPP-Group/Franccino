# Pesquisa: fonte oficial, fundo branco nas fotos e capa padronizada (06/11/2026)

Uso interno da equipe: os preços abaixo não vão para o Linear nem para o cliente. Valores em US$, consultados em
06/11/2026; confirmar na página do fornecedor antes de orçar.

## 1. Fonte oficial (Adobe Garamond Pro)

### O que o site carrega hoje

`web/src/app/fonts.ts` (`next/font/google`, só `latin`, `display: 'swap'`, servido pelo próprio site):

- **EB Garamond** (texto): sem `weight`, então vem o arquivo variável 400–800, **só no estilo normal**.
- **Cormorant Garamond** (títulos): pesos 400, 500, 600 e 700 estáticos, **só normal**.
- O CSS usa 400, 500 e 600 nas duas famílias; todos existem, então não há negrito sintético.

### Defeitos encontrados no código

1. **Itálico falso.** `api/app/Support/RichText.php` permite `<em>`, mas nenhuma das fontes carrega itálico: o
   navegador inclina a fonte normal (oblíquo sintético), que fica feio em Garamond. Correção:
   `style: ['normal', 'italic']` no `EB_Garamond` (e no Cormorant, se títulos ou citações usarem itálico).
2. **Cormorant em 4 arquivos.** O Google oferece a versão variável (300–700); listar os pesos baixa 4 arquivos
   estáticos. Tirar o `weight` carrega um arquivo só.
3. Se a fonte mudar para Adobe Garamond Pro: ela **não tem peso 500** (só Regular, Semibold e Bold, com itálicos).
   Os `font-weight: 500` dos títulos (`base.css`, `components.css`, `product.css`, `home.css` e outros) teriam de ir
   para 400 ou 600, senão o navegador arredonda para o peso mais próximo.

### Caminhos para usar a Adobe Garamond Pro no site

| Caminho                                                           | Como funciona                                                              | Custo                                                                                                                               | Prós e contras                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Adobe Fonts (web project)**                                  | Projeto web no fonts.adobe.com; o site carrega um CSS de `use.typekit.net` | Plano Creative Cloud com a biblioteca completa (Standard ou Pro, ~US$ 55–70/mês). Sem limite de pageviews                           | Desde 2020 o projeto tem de estar na **assinatura do próprio cliente**, não da agência. Se a assinatura acaba, a fonte some do site. Exige abrir a CSP (`style-src` e `font-src` para `use.typekit.net`, mais `p.typekit.net`), soma uma conexão a outro domínio e um CSS que bloqueia a renderização; não dá para hospedar os arquivos |
| **B. Licença webfont perpétua (Adobe Originals pela Fontspring)** | Compra única dos arquivos WOFF2, hospedados no site com `next/font/local`  | Família de 6 estilos listada a ~US$ 169 na Fontspring; a licença web é por faixa de pageviews mensais (mínimo de 500 mil), perpétua | Sem assinatura, sem domínio externo, CSP inalterada, mesmo desempenho de hoje. Licença no nome da Franccino. Monotype/MyFonts vende webfont em pacotes anuais de pageviews: evitar                                                                                                                                                      |
| **C. Manter as livres**                                           | EB Garamond e Cormorant Garamond (OFL 1.1), já no ar                       | Zero                                                                                                                                | A EB Garamond é a releitura livre mais fiel ao Garamond clássico; diferença pequena para leigos                                                                                                                                                                                                                                         |

**Recomendação:** B, se a Franccino quiser a fonte oficial no site; C, se não quiser pagar. A deixa o site refém da
assinatura de terceiros e piora desempenho e CSP.

**O que o cliente decide e fornece:**

1. Se quer a fonte oficial no site (B) ou mantém as livres (C).
2. Se B: compra em nome da Franccino (CNPJ e e-mail da empresa), na faixa de pageviews que estimarmos (o site atual
   cabe na menor) e nos 6 estilos; envia os arquivos web e o PDF da licença. Os arquivos .otf de desktop não servem.
3. Se A (não recomendado): assinatura própria de Creative Cloud, com o projeto web criado na conta da empresa e o
   acesso compartilhado com a equipe.

Fontes: [Adobe Fonts, limites](https://helpx.adobe.com/fonts/using/plan-limits.html),
[Adobe Garamond Pro no Adobe Fonts](https://fonts.adobe.com/fonts/adobe-garamond-pro),
[projeto web exige assinatura do cliente](https://community.adobe.com/t5/adobe-fonts-discussions/wait-what-client-must-have-a-creative-cloud-subscription-for-a-font/td-p/11212521),
[fonte some sem assinatura](https://community.adobe.com/t5/adobe-fonts-discussions/what-happens-to-the-web-project-fonts-when-account-became-inactive/m-p/10574003),
[Fontspring, Adobe Garamond Pro](https://www.fontspring.com/fonts/adobe/adobe-garamond-pro/adobe-garamond-pro-semibold),
[Fontspring, pageviews](https://support.fontspring.com/hc/en-us/articles/10244205972891-Pageviews-FAQ),
[Monotype, licença webfont](https://foundrysupport.monotype.com/hc/en-us/articles/10839926029588-Webfont-License).

## 2. Fundo branco nas fotos dos produtos

### Comparação (cerca de 1.500 fotos)

| Opção                            | Bordas em móveis (pés finos, corda, palhinha, vidro)                                                                  | Lote                 | Custo por foto / 1.500                                | Licença                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Photoroom API, Image Editing** | Muito boa; já entrega fundo `FFFFFF`, `padding`, tamanho de saída e sombra de contato (`shadow.mode`) numa só chamada | API REST             | ~US$ 0,10 (Plus) / **~US$ 150**; só recorte ~US$ 0,02 | Comercial, incluída                                                                                 |
| **Bria RMBG-2.0 pela API**       | Muito boa em cabelo, corda e trama; só recorte                                                                        | API (Bria, fal.ai)   | ~US$ 0,018 / ~US$ 27                                  | API inclui licença comercial; **os pesos abertos são CC BY-NC 4.0** (uso comercial só com contrato) |
| remove.bg                        | Boa; sombra e fundo pelo próprio app                                                                                  | API                  | ~US$ 0,07–0,23 / ~US$ 150–350                         | Comercial                                                                                           |
| BiRefNet (aberto)                | A melhor das abertas em alta resolução                                                                                | Script próprio (GPU) | Só máquina                                            | MIT                                                                                                 |
| rembg/U2Net, InSPyReNet          | Inferiores em detalhes finos                                                                                          | Script               | Só máquina                                            | MIT                                                                                                 |
| Photoshop API / Firefly          | Boa, mas cara e com contrato corporativo                                                                              | API                  | Sob consulta                                          | Comercial                                                                                           |

Nenhum modelo resolve bem **vidro e palhinha vazada**: o fundo antigo aparece pela transparência. Essas fotos
precisam de revisão manual ou de nova foto.

### Fotos de baixa qualidade (upscale)

- Real-ESRGAN (aberto, BSD) e o upscale da Photoroom: aumentam 2× com pouca invenção.
- Topaz e Magnific: mais nítidos, mas **inventam textura** (trama de tecido, veio da madeira). Num catálogo isso é
  informação falsa sobre o produto: usar só em último caso, com 2× no máximo e revisão.
- Regra: **partir sempre do maior original do cliente.** Recortar os WebP comprimidos do WordPress só para peças
  sem original, e marcar essas peças para foto nova.

### Pipeline proposto

1. **Entrada:** originais em alta (JPG/TIFF/PSD, ≥ 2.500 px), numa pasta por peça com o nome igual ao slug ou código.
2. **Recorte:** Photoroom Image Editing (ou Bria + composição própria, se o custo pesar).
3. **Composição padrão:** tela `#FFFFFF`, 2000 × 2000 px (ou a proporção da capa do site), peça centrada com
   margem fixa de 10% e apoiada na mesma linha de chão, sombra de contato suave igual para todas (parâmetros
   fixos de `shadow.*`).
4. **Exportação:** JPG de qualidade 90 em sRGB; o site gera os tamanhos menores sozinho.
5. **Revisão:** folha de contato com todas as fotos lado a lado, para achar bordas ruins.
6. **Envio:** pelo painel; para o lote, um comando artisan que lê a pasta e anexa à galeria e à capa (comando novo,
   não existe hoje). Guardar o original no Drive e o resultado no R2, nunca no Git.

### Piloto

10 peças escolhidas pela dificuldade: 2 de madeira com pés finos, 2 de corda, 2 de palhinha, 1 com vidro, 1 com metal
fino e 2 estofadas. Rodar Photoroom e Bria nas mesmas fotos e comparar lado a lado com a Franccino. Custo do piloto:
menos de US$ 5 em créditos. A equipe gasta cerca de 1 dia. Depois da aprovação, rodar o lote (2 a 3 dias com revisão).

**O cliente fornece:** os originais em alta de cada peça (sem compressão de WhatsApp) e a aprovação do piloto (margem,
sombra e tom de branco).

Fontes: [Photoroom, sombras e parâmetros](https://docs.photoroom.com/image-editing-api-plus-plan/ai-shadows),
[Photoroom, cobrança](https://docs.photoroom.com/getting-started/pricing), [Photoroom, preços](https://www.photoroom.com/api/pricing),
[Bria RMBG-2.0, licença](https://huggingface.co/briaai/RMBG-2.0), [Bria, uso comercial](https://bria.ai/rmbg-for-commercial-use),
[Bria no fal.ai](https://fal.ai/explore/background-remover-apis), [remove.bg, preços](https://remove.bg/pricing),
[BiRefNet](https://github.com/ZhengPeng7/BiRefNet), [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN).

## 3. Capa padronizada (peça em 3/4, virada para a esquerda)

O produto já tem uma coleção `cover` separada da `gallery` (`api/app/Models/Product.php`); o padrão cabe sem mudar o
schema.

1. **Curadoria manual (já dá para fazer):** acrescentar a regra na dica do campo de capa
   (`api/lang/pt_BR/panel-help.php`, chave `cover`): "Peça na diagonal (3/4), virada para a esquerda, fundo branco".
   Esforço: 15 minutos de código; a escolha nas ~400 peças leva de 7 a 10 horas de quem cadastra.
2. **Assistido (recomendado):** um comando lê a galeria de cada peça, manda as fotos a um modelo de visão (por
   exemplo, a API da Anthropic) e classifica o ângulo (frente, 3/4 esquerda, 3/4 direita, lateral, costas,
   detalhe, ambiente). O painel mostra a sugestão e um filtro "capa fora do padrão"; uma pessoa confirma. O custo
   da API fica na ordem de dezenas de dólares para 1.500 fotos (confirmar na tabela de preços). Esforço: 2 a 3 dias.
   O SDK é dependência nova e precisa de aprovação do tech lead.
3. **Sem foto 3/4 à esquerda:**
   - Peça simétrica (a maioria de cadeiras, mesas e poltronas): espelhar a 3/4 à direita, só depois de revisão humana.
   - **Nunca espelhar** peças assimétricas (chaise, sofá com braço de um lado só, módulos de canto), peças com logo,
     etiqueta, texto ou costura visível, nem peças com veio ou trama direcional evidente. Espelhar engana o
     arquiteto sobre o lado da peça.
   - Sem foto simétrica utilizável: entrar na lista de fotos que a Franccino precisa produzir.
   - Na base, guardar se a capa foi espelhada, para refazer quando a foto real chegar.

Fazer depois do fundo branco: o recorte e o ângulo saem do mesmo lote de originais.
