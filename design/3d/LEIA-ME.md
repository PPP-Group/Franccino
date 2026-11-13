# Blocos SketchUp → GLB (visualizador 3D)

O site só mostra GLB. O navegador não abre SketchUp (`.skp`) nem AutoCAD (`.dwg`, desenho 2D). Por isso, cada peça
com bloco SketchUp no Drive "Site Franccino" é convertida para GLB e enviada como `model_3d` pela importação
(`docs/api.md`, `POST /api/import/media`).

- `escolha.json`: o SketchUp escolhido para cada peça. Ele aponta o arquivo no Drive, sem cópia do arquivo.
- `converter.py`: baixa, converte e grava `<slug>.glb` em `SAIDA`, uma pasta fora do repositório. Os GLB nunca entram
  no git.
- `openskp-1.5.0-materiais.patch`: correção local do OpenSKP 1.5.0 (MIT).

## Cores: o GLB sai como o arquivo da Franccino

- Cada face fica com a cor do material do SketchUp, inclusive quando o material está no componente (ex.: o estofado
  bege e a borracha preta da Chaise Coce).
- A cor é convertida de sRGB para linear; sem isso, o cinza sai branco.
- Face sem material fica branca, como o próprio SketchUp mostra. Vários blocos da Franccino não têm material nenhum
  (ex.: Banco Dublin, Escrivaninha Pampulha, Mesa lateral Eros). Os arquivos com textura (ex.: Aparador Xove, Banqueta Apruma) saem com a textura, que pede o Pillow. Os sem material saem brancos porque o arquivo é assim. A cor
  real da peça só vem com os acabamentos aplicados no SketchUp ou com o mostruário.

O patch corrige duas coisas no OpenSKP. No formato antigo do SketchUp, ele ignorava o material do componente. Na face
sem material, ele usava a cor da etiqueta (Layer0 rosa) no lugar do branco padrão.

## Rodar

```bash
python3 -m venv skpenv && skpenv/bin/pip install openskp==1.5.0 trimesh numpy pillow
cd skpenv/lib/python3*/site-packages/openskp && patch -p0 < <repo>/design/3d/openskp-1.5.0-materiais.patch
SAIDA=/tmp/glb skpenv/bin/python -I <repo>/design/3d/converter.py      # GOOGLE_DRIVE_TOKEN no ambiente
SAIDA=/tmp/glb python3 -I <repo>/design/3d/enviar.py --simular          # CONTENT_IMPORT_TOKEN no ambiente
SAIDA=/tmp/glb python3 -I <repo>/design/3d/enviar.py
```

O envio precisa da API com o PR #94 no ar: antes dele, a importação recusa `model_3d`. Depois, conferir o botão 3D
na página de algumas peças (ex.: Chaise Coce, Sofá Majestic).

O token do Drive vem do OAuth Playground (`drive.readonly`, vale cerca de 1 hora; `design/drive/LEIA-ME.md`). Ele vai
nas variáveis do ambiente, nunca no chat nem em arquivo. A sessão só lê a variável quando começa: com o token
renovado, abra uma sessão nova.

Limites: GLB de até 20 MB (`franccino.uploads.model_3d_max_kb`) e SketchUp de até 150 MB. Alguns arquivos no formato
antigo não abrem no OpenSKP ("implausible definition count", ex.: Banco ARP); esses pedem o arquivo salvo numa versão
mais nova do SketchUp.

## Teste de acabamentos genéricos (13/11/2026)

Enquanto o mostruário não chega, `acabamento.py` troca as cores lisas de um GLB por materiais genéricos realistas:
madeira, couro e trama de tecido da Poly Haven (licença CC0, uso comercial livre), alumínio e borracha. O mapa de cada
peça (`acabamentos/<slug>.json`) diz qual cor do GLB vira qual material. Os tecidos usam só a trama, tingida com a cor
do arquivo. Aplicado na Chaise Coce e na Cadeira Arreda, no preview, como teste: não é o acabamento real da
Franccino.

```bash
# texturas em TEX_LIB: <nome>_diff.jpg, <nome>_nor.jpg e <nome>_rough.jpg (1k), de api.polyhaven.com/files/<nome>
# european_walnut_veneer_04, fine_grained_wood, rough_linen, brown_leather
TEX_LIB=/tmp/tex skpenv/bin/python -I design/3d/acabamento.py peca.glb peca-acabada.glb design/3d/acabamentos/peca.json
```
