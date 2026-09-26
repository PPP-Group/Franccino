# 0001 — Versões da stack

- Status: Aceita (2026-09-23)
- Substitui: versões citadas no roadmap v1.0 e no `CLAUDE.md` inicial (Laravel 11, Node 20, PHP 8.3)

## Contexto

O roadmap de execução e o primeiro `CLAUDE.md` citavam Laravel 11 e Node.js 20 LTS. Em setembro de 2026:

- Laravel 11 está sem correção de segurança desde março de 2026.
- Node.js 20 saiu de suporte em abril de 2026.
- Pest 5 (framework de testes) exige PHP 8.4.

Começar um projeto novo, com vida útil de anos, em versões sem suporte cria dívida desde o primeiro dia.

## Decisão

| Camada                    | Versão                      |
| ------------------------- | --------------------------- |
| PHP                       | 8.4                         |
| Laravel                   | 13.x                        |
| Filament                  | 5.x (Livewire 4)            |
| Testes do back-end        | Pest 5                      |
| Node.js                   | 24 LTS                      |
| Gerenciador de pacotes JS | pnpm 11                     |
| Next.js                   | 16.x (App Router), React 19 |
| Tailwind CSS              | 4.x                         |
| i18n do front             | next-intl 4.x               |
| Banco                     | MySQL 8.4 LTS               |

## Consequências

- Checklist de ambiente de cada dev passa a pedir PHP 8.4 (e não 8.3) e Node 24 (e não 20).
- Hospedagem de produção precisa oferecer PHP 8.4 e Node 24 (Forge, Vercel e VPS comuns oferecem).
- Atualizações menores entram pelo Dependabot, semanalmente, em PR para `develop`.
