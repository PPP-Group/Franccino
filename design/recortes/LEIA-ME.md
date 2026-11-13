# Recortes e envio de fotos em massa

## Gerar a foto sem fundo (carrossel)

`recortar.py` recorta uma foto de estúdio em fundo branco (instruções no topo do arquivo). As ferramentas (`rembg`,
`numpy`, `scipy`) ficam num ambiente Python à parte, só na máquina de quem gera; não são dependência do site.

## Enviar para a API (sem painel e sem passar pelo repositório)

A API tem a rota de importação `/api/import/*` (docs/api.md, "Importação em massa"). Ela só existe com a variável
`CONTENT_IMPORT_TOKEN` preenchida na API (EasyPanel → serviço da API → Environment; só letras e números). O token vai
no cabeçalho `Authorization: Bearer`, nunca na linha de comando salva no histórico: use a variável de ambiente.

```bash
API=https://api-preview-franccino.valenteai.cloud
read -rs TOKEN   # cola o token sem aparecer na tela

# Uma foto: capa, galeria ou foto sem fundo de uma peça (key = slug em português)
curl -fsS -H "Authorization: Bearer $TOKEN" -F target=product -F key=cadeira-toe -F collection=cutout \
  -F file=@cadeira-toe.webp "$API/api/import/media"

# Em massa: uma pasta com <slug>.webp
for f in recortes/*.webp; do
  curl -fsS -H "Authorization: Bearer $TOKEN" -F target=product -F key="$(basename "$f" .webp)" \
    -F collection=cutout -F file=@"$f" "$API/api/import/media"
done

# Uma lista de capas ou de conteúdo (mesmo formato de api/database/data/covers e api/database/data/wordpress),
# aplicada na fila na hora, sem esperar o deploy
curl -fsS -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  --data @api/database/data/wordpress/2026-11-07-site-antigo.json "$API/api/import/content"
```

Tipos (`target`) e coleções aceitas: `product` (cover, gallery, cutout; `key` = slug), `project` (cover, gallery;
`key` = slug), `store` (image), `client` (logo) e `scene` (image), esses três com `key` = id, e `banner` (image,
image_mobile; `key` = posição no carrossel da home, 1, 2, 3...). `cover`, `cutout`, `image` e `logo` substituem a foto
atual; `gallery` acrescenta.

## Pendente em 07/11/2026

- Cadeira Toé: a capa passa a ser a foto 1972 (marrom) no deploy; o recorte dela precisa ser refeito com
  `recortar.py` a partir dessa foto e enviado como `cutout` (o recorte atual é da foto verde).
