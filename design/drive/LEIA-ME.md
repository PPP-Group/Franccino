# Auditoria do Drive: baixar e enviar para o site

`2026-11-12-auditoria.json` é o lote da auditoria do Drive (planilha "Auditoria_Drive_Site_Franccino.xlsx", de
06/11/2026, aba "Para subir ou substituir"). Cada item é um arquivo do Drive já ligado ao registro do site.
`importar.py` baixa cada arquivo do Drive e envia pela importação em massa da API (`docs/api.md`, "Importação em
massa"). Os arquivos não passam pelo repositório nem pelo painel.

## O que entra neste lote (255 arquivos)

| Destino                             | Quantos | Como entra                                                                     |
| ----------------------------------- | ------: | ------------------------------------------------------------------------------ |
| Blocos 3D (SketchUp) e 2D (AutoCAD) |      53 | Arquivos da peça, publicados: 12 peças das coleções ARP, Adhara e Noa          |
| Galeria das peças                   |      83 | Fotos acrescentadas à galeria                                                  |
| Galeria da página Fábrica           |      56 | Fotos HEIC do iPhone convertidas para JPG (2560 px)                            |
| Galeria dos projetos                |      46 | Clara Arte (40 fotos profissionais, reduzidas para 2560 px), Boa Vista e Kûara |
| Galeria das coleções                |      17 | TEMPO, Origem, Elo e Outset                                                    |

O título de cada bloco sai do nome do arquivo da fábrica: "Bloco 3D (SketchUp) – chaise, com braço recuado, com
encosto" (C-BR = com braço, C-ENC = com encosto, ASS = assentos, TPO AL/MD/PD = tampo de alumínio, madeira ou pedra).
O título pode ser corrigido no painel (Produtos → a peça → Arquivos). Os blocos da Mesa de Centro Noa vão para a
redonda ou para a quadrada conforme o nome do arquivo (RED ou QUAD).

## Fora deste lote (precisam de decisão ou de edição)

- 84 fotos de peças que ainda não estão no site (aba "Produtos fora do site"): entram com o cadastro da peça.
- 23 fotos "Conferir: se for outro ângulo": parecidas com fotos que já estão no site.
- 28 fotos de designers: o site tem só o retrato; os banners de 1920 × 500 do site antigo não têm lugar.
- 48 vídeos da Fábrica e 3 de projetos e da TEMPO: precisam de edição (HandBrake, 1080p) antes de subir.
- 47 fotos de peças em produção, 21 fotos institucionais e 14 "Confirmar com a Franccino": esperam a escolha da
  Franccino.
- 6 fotos RAW da Mesa Polux o catálogo do Clara Arte (PDF) e o texto dele: o projeto não tem área de downloads; decidir onde entram.

## Como rodar

1. **Token do Drive (só leitura, vale cerca de 1 hora).** Gere o token logo antes de rodar:
   1. abra https://developers.google.com/oauthplayground com a conta que vê o Drive "Site Franccino";
   2. no passo 1, digite o escopo `https://www.googleapis.com/auth/drive.readonly` e clique em "Authorize APIs";
   3. no passo 2, "Exchange authorization code for tokens" e copie o "Access token".
2. **Os dois tokens na sessão, nunca no chat nem em arquivo.** Nas configurações do ambiente da sessão (Network
   secrets, ou variáveis de ambiente), ponha `GOOGLE_DRIVE_TOKEN` (o do passo 1) e `CONTENT_IMPORT_TOKEN` (o mesmo da
   API no EasyPanel). Em máquina própria: `read -rs GOOGLE_DRIVE_TOKEN; export GOOGLE_DRIVE_TOKEN` (e o mesmo para o
   outro).
3. **Rodar** (precisa de `curl` e do ImageMagick com HEIC, `convert -list format | grep HEIC`):

   ```bash
   python3 -I design/drive/importar.py design/drive/2026-11-12-auditoria.json --simular
   python3 -I design/drive/importar.py design/drive/2026-11-12-auditoria.json --so files
   python3 -I design/drive/importar.py design/drive/2026-11-12-auditoria.json --so media
   ```

   Os blocos primeiro (`--so files`, cerca de 1,2 GB). O script guarda em `.importados.json` o que já foi enviado:
   rodar de novo continua de onde parou. Se o token do Drive vencer no meio, gere outro (passo 1) e rode de novo. A API
   também não duplica: o mesmo bloco troca o arquivo, e a mesma foto (`source=drive:<id>`) é ignorada.

4. **Conferir:** a página de uma peça com bloco (ex.: `/pt/produtos/sofa-noa`), seção "Integre ao seu projeto", e a
   Área do Profissional (`/pt/area-do-profissional`). O download pede o cadastro na primeira vez.

O limite de um arquivo técnico é 200 MB (`franccino.uploads.downloads_max_kb`): o maior bloco, Poltrona Noa, tem
188 MB.

## Fotos a tirar (13/11/2026)

`2026-11-13-remover.json` lista 70 fotos em 25 registros do preview: versões irmãs que este lote pôs no produto errado
(a planilha ligava a pasta de uma peça a um produto só; todas já existem, iguais, no produto certo), as fotos repetidas
dentro da mesma peça e as 3 cópias antigas do começo da galeria do Clara Arte. Com `CONTENT_IMPORT_TOKEN` no ambiente:

```bash
python3 -I -c "
import json, os, urllib.request
for j in json.load(open('design/drive/2026-11-13-remover.json'))['items']:
    r = urllib.request.Request('https://api-preview-franccino.valenteai.cloud/api/import/media/remove', data=json.dumps(j).encode(), method='POST', headers={'Authorization': 'Bearer ' + os.environ['CONTENT_IMPORT_TOKEN'], 'Content-Type': 'application/json', 'Accept': 'application/json'})
    print(j['key'], json.load(urllib.request.urlopen(r))['data'])
"
```

A rota só apaga as fotos daquele registro e daquela coleção; um id que não é dele volta em `not_found`.
