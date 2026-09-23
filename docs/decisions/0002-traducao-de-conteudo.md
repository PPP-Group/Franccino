# 0002 — Tradução do conteúdo (pt/en)

- Status: Aceita (2026-09-23)

## Contexto

Todo conteúdo cadastrável (produtos, coleções, designers, páginas...) existe em português e inglês. O site
atual não tem versão em inglês, então o inglês pode chegar depois do português, ou nem chegar antes do go-live.

Opções consideradas:

1. **Colunas JSON por campo** (`{"pt": "...", "en": "..."}`) com `spatie/laravel-translatable`.
2. **Tabelas de tradução** (`products` + `product_translations`) com `astrotomic/laravel-translatable`.

## Decisão

Opção 1. Cada campo traduzível é uma coluna JSON. No painel Filament, os campos aparecem em **abas PT/EN lado
a lado** no mesmo formulário (não um seletor de idioma que troca o formulário inteiro).

Regras:

- `pt` é obrigatório; `en` é opcional.
- A API recebe `locale=pt|en`. Campo sem valor em `en` volta em `pt` e o recurso traz `locale_fallback: true`.
- Slugs também são traduzíveis e únicos por idioma (validação na aplicação).
- Idiomas ativos são configuráveis (`APP_LOCALES` na API, `NEXT_PUBLIC_SITE_LOCALES` no front), para o site poder
  ir ao ar só em `pt`.

## Consequências

- Uma linha por registro, sem joins para ler conteúdo; integração simples com Filament.
- Unicidade de slug por idioma não é garantida por índice de banco; os testes cobrem a validação.
- Busca textual usa a coluna `products.search_text` (normalizada, sem acento), mantida pelo model.
