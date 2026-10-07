# Reunião com a Franccino, 05/10/2026

Participantes: Pedro Ivo (tech lead e PM), Pedro Fonseca, Pedro Leite e Matheus Francino (Franccino). Duração: 45 min.
Gravação: https://fathom.video/share/_FvRsMm1GbDHCMjq7-o9JNp-tKzt8o6R (a transcrição completa tem conversa
pessoal, por isso fica só na gravação; aqui está o que importa para o projeto).

## Decisões e pedidos do cliente

- **Velocidade do site aprovada.** A primeira versão segue a linha do site atual; modernizar aos poucos.
- **Fonte:** a Adobe Garamond Pro não tem licença web. Depois da reunião o cliente mandou Cormorant Garamond e EB
  Garamond (licença aberta), que já estão aplicadas (PR #23).
- **3D:** vão subir os blocos que já têm. O download em SketchUp é a prioridade para os arquitetos (a área de
  downloads já aceita "Bloco 3D" e "Bloco 2D" por produto). Eles testam a conversão de um modelo do teste para
  SketchUp. A IA cria linhas que não existem na conversão, e o acabamento passa pela engenharia deles.
- **Painel:** o Matheus pediu acesso ao painel do preview e uma apresentação de como cadastrar produto e coleção.
- **Revisão técnica:** Pedro Ivo e os dois Pedros percorrem o site página por página (links, ícones, espaçamentos).
- **A Franccino faz reunião interna em 06/10** e manda o retorno consolidado. Veio o documento "Ajustes no novo
  site" (06/10), tratado no PR #23.

## Retorno de layout dado na reunião

- Casa e Giardini: menos produtos por linha (3), menu com categorias ao passar o mouse, card só com foto e nome.
- Busca no cabeçalho, com sugestões enquanto digita (feita em 07/10).
- Coleções no estilo do site atual, sem texto nem contagem de peças. Designers: manter. Projetos: aprovado.
- Lançamentos: sem bloco pequeno, com imagem central ou direto nos produtos.
- Fábrica: mais fotos, foto da fábrica e o vídeo institucional. Lojas: foto de cada loja.
- Fotos de produto padronizadas: fundo branco, mesma posição e mesma escala.
- Sala para montar: os blocos brancos viram o desenho da peça quando houver 2D. Fica como está por enquanto.

## O que cada lado precisa entregar (prazo 19/10/2026)

**Franccino:** logo em SVG; textos em inglês (ou o português final, para a equipe traduzir); descrição dos produtos;
lista de acabamentos; fichas técnicas em PDF; fotos originais em alta (produtos, banners, fábrica, lojas); blocos 3D
e 2D existentes; retorno consolidado do layout e da landing page do Marcel.

**Equipe:** liberar acesso ao painel (PPP-116); organizar o painel (PPP-117); revisão técnica (PPP-118);
cadastrar o conteúdo da rodada 1 (`docs/handoff/rodada-1-conteudo-passo-a-passo.md`).

## Fora do escopo (não executar sem orçamento aprovado)

Piloto profissional de blocos 3D das peças restantes; blocos 2D com o desenho da peça na sala para montar;
integração da lista de orçamento com o CRM deles.

## Linear

PPP-42 (rodada 1 do design), PPP-62 (material do cliente, prazo 19/10), PPP-105 (fonte e logo), PPP-20 (3D), PPP-108
(lojas), PPP-99 (treinamento do painel), PPP-116, PPP-117 e PPP-118 (novas).
