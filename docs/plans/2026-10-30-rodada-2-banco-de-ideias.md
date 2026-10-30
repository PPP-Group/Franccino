# Rodada 2 do design: o que a Franccino aprovou no banco de ideias

Plano de ação da etapa 2 do contrato (layout e design, PPP-43) para as ideias aprovadas em 26/10/2026. A decisão de cada
ideia está em [`docs/reunioes/2026-10-26-retorno-banco-de-ideias.md`](../reunioes/2026-10-26-retorno-banco-de-ideias.md);
quando a Franccino e o marketing divergem, vale a Franccino.

**Regra de execução:** tudo o que é movimento novo é fácil de desligar ("se não gostar, tira"). Quem pediu menos
movimento no sistema (`prefers-reduced-motion`) não vê nenhuma animação nova. Nenhuma dependência nova.

## 1. Feito nesta entrega (branch `claude/banner-cover-images-vcdpmb`)

| Ideia | O que mudou                                                                                                                                                                                                                                                                     | Onde                                                                                                     | Como desligar                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1     | Esteira limpa: só foto e nome, sem etiqueta "Lançamentos" e sem botões; o clique abre a peça. Usa o `Rail` (setas discretas que somem quando tudo cabe). Na home (Lançamentos) e na página da peça (mesma linha e relacionadas)                                                 | `components/products/ProductRail.tsx`, `styles/plates.css`                                               | —                                                            |
| 2     | O nome vem para frente junto com a peça no hover (o movimento passou para o link inteiro; a sombra continua só na foto)                                                                                                                                                         | `styles/plates.css`                                                                                      | —                                                            |
| 3, 14 | Banner com foto: sem título cadastrado, nada é escrito por cima (nem botão, nem sombra); o título da seção fica só para leitor de tela; com `cta_url`, o banner inteiro é o link. Carrossel sem setas, pontos e pausa na tela; troca suave a cada 7 s; pausa no hover e no foco | `components/home/HeroSection.tsx`, `HeroCarousel.tsx`, `styles/home.css`                                 | —                                                            |
| 14    | Vídeo curto em loop no banner: MP4 sem som, enviado no painel (Banners → "Vídeo em loop", até 20 MB). A foto é o pôster e fica para quem pediu menos movimento ou economia de dados; o vídeo só baixa quando o banner está na tela e é o slide visível                          | API: coleção `video` do `Banner`, campo `video` em `GET /banners`. Site: `HeroVideo.tsx`                 | Tirar o vídeo do banner no painel                            |
| 4     | Revelação na rolagem: coleções, projetos, fábrica, linhas, designers e blocos de imagem sobem e aparecem ao entrar na tela; a peça em destaque da home "vira e se desfaz" ao sair. Só CSS (`animation-timeline: view()`); navegador sem suporte mostra tudo parado              | `styles/motion.css`                                                                                      | Apagar o `@import` de `motion.css` em `globals.css`          |
| 5     | Cabeçalho branco sólido, sem vidro fosco                                                                                                                                                                                                                                        | `styles/chrome.css`                                                                                      | —                                                            |
| 7     | Ambientes com pontos clicáveis: foto do ambiente e um ponto em cada peça; o ponto abre um cartão com foto e nome que leva à peça. Painel: Conteúdo → Ambientes (posição do ponto em % da foto). Seção "Ambientes" na home, depois de Casa/Giardini; some sem ambiente           | API: `scenes` e `scene_hotspots` (migration `2026_10_30_100000`), `GET /scenes`. Site: `SceneViewer.tsx` | Despublicar os ambientes no painel                           |
| 9     | Acabamento em detalhe: a amostra da página Acabamentos abre uma janela com a imagem fixa em alta (a conversão de 2560 px que a API já gera), inteira ou no tamanho real para percorrer a textura. Sem lupa que segue o mouse. Só onde há foto                                   | `components/catalog/FinishZoom.tsx`, `styles/pages.css`                                                  | —                                                            |
| 10    | A foto do card cresce até a foto grande da página da peça (`<ViewTransition>` do React 19.3, sem configuração no Next 16). Navegador sem suporte troca de página normalmente                                                                                                    | `ProductPlate.tsx`, `ProductStage.tsx`, `styles/motion.css`                                              | Apagar o `@import` de `motion.css` (e os `<ViewTransition>`) |
| 12    | Números que contam até o valor ao entrar na tela (bloco "Números" das páginas, ex.: anos da fábrica); o HTML já traz o valor final e o leitor de tela só lê o final. Faixa em degradê nas fotos dos cards e das coleções até a imagem carregar                                  | `lib/ui/count-up.ts`, `components/ui/CountUp.tsx`, `ImageLoadWatcher.tsx`, `motion.css`                  | `motion.css` (faixa); contador: `Blocks.tsx`                 |

Contrato e modelo atualizados no mesmo PR: `docs/api.md` (`Banner.video`, `GET /scenes`, tag `scenes`) e
`docs/data-model.md` (`banners.video`, `scenes` e `scene_hotspots`). Ajuda do painel: dicas dos campos novos em
`lang/pt_BR/panel-help.php` e o guia "Ambientes com pontos clicáveis" em `lang/pt_BR/guides.php`.

### Decisões tomadas nesta entrega (o tech lead confirma ou muda)

- **Pausa do carrossel (WCAG 2.2.2).** O cliente pediu o banner sem botões. A pausa continua existindo para o teclado e
  o leitor de tela: aparece só com o foco, como o "pular para o conteúdo". O mouse pausa com o hover.
- **Ideia 1 nos dois lugares.** O marketing queria a esteira só dentro da página da peça; a Franccino também quer em
  Lançamentos. Valeu a Franccino.
- **Ideia 7 dentro do contrato.** O `docs/HANDOFF.md` (§5.2, item 4) lista "preparo do banco de ideias (fotos por
  acabamento, hotspots…)" como escopo novo. Como o banco de ideias foi apresentado como parte da etapa 2 e o tech lead
  pediu para adiantar o que foi aprovado, o ambiente com pontos entrou. O que continua fora do contrato: a troca de
  acabamento por foto (ideia 8) e o configurador 3D com troca de acabamento.
- **Posição do ponto por número.** No painel, cada ponto leva "Da esquerda (%)" e "Do topo (%)". Um seletor visual
  (clicar na foto para marcar o ponto) é o próximo passo (seção 2).

## 2. Próximos passos da rodada 2

1. **Conferir com o PDF** do banco de ideias e o PDF de respostas da Franccino: nome e número de cada ideia, e se
   alguma resposta do PDF muda a tabela da reunião.
2. **Publicar no preview e mostrar à Franccino**, com um ambiente de teste cadastrado (foto do Drive) e um banner com
   vídeo curto. Recolher o retorno numa lista só.
3. **Ambientes:** seletor visual de pontos no painel; decidir se os ambientes também aparecem em Projetos e
   Lançamentos (o componente já serve para qualquer página).
4. **Acabamento em detalhe também na página da peça** (a "aba de acabamento" da conversa), quando houver as fotos
   digitalizadas.
5. **Redesenho do resto do site** (PPP-43), tomando como base o documento "Alterações primeira versão".
6. **Imagens definitivas** (banners, capas, Fábrica): só depois que mapa do site e páginas fecharem, como pediu o
   marketing. Até lá, o painel usa as fotos do Drive.
7. **Textos:** usar os do site antigo. O importador do WordPress já copiou o que havia; conferir no relatório de lacunas
   (`storage/app/migration/relatorio-*.md`) o que ainda falta.

## 3. Fora desta rodada

- Ideia 8 (troca de acabamento por foto) e o configurador 3D com troca de acabamento: escopo com orçamento à parte.
- Ideias 6, 11 e 15: descartadas pela Franccino.
- Ideia 5 (vidro fosco): "mais tarde"; o cabeçalho ficou branco sólido.
