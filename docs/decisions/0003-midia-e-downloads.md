# 0003 — Mídia, imagens e arquivos técnicos

- Status: Aceita (2026-09-23)

## Contexto

O roadmap pede geração automática de versões de imagem, armazenamento em Cloudflare R2, modelo 3D por produto
e área de downloads técnicos com URLs assinadas e bloqueio de acesso direto ao bucket.

## Decisão

- **Biblioteca de mídia**: `spatie/laravel-medialibrary` + plugin oficial do Filament.
- **Conversões**: WebP nas larguras 480, 960, 1440, 1920 e 2560 (sem ampliar a original) e um placeholder
  de 24 px guardado como `blur_data_url`. Largura e altura da original ficam nas propriedades da mídia.
- **Discos**:
  - `media` (público): imagens e GLB. Local em `storage/app/public/media`; produção no bucket público do R2 com
    domínio próprio e CDN.
  - `downloads` (privado): fichas técnicas e blocos 2D/3D. Local com URLs temporárias do próprio Laravel;
    produção no bucket privado do R2 com URLs pré-assinadas.
- **Downloads**: o navegador pede `POST /api/v1/downloads/{id}/link`, recebe uma URL válida por 10 minutos e o
  download é registrado em `download_logs` (IP guardado só como hash).
- **Imagens no front**: `<img srcset>` nativo a partir das conversões da API, sem o otimizador de imagens da
  hospedagem.

## Consequências

- Nenhum custo de otimização de imagem por requisição; o CDN serve arquivos prontos.
- Trocar de disco local para R2 é só configuração (`R2_*` no `.env`).
- Texto alternativo por imagem ainda não é editável (derivado do nome do item); melhoria futura.
