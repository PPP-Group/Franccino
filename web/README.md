# Web

Site institucional bilíngue (pt/en) da Franccino. Next.js (App Router),
dados vindos da API Laravel em `api/`.

## Comandos

Instale as dependências pela raiz do monorepo (`pnpm install`); os scripts
abaixo rodam com `pnpm --filter web <script>`:

| Comando     | O que faz                              |
| ----------- | -------------------------------------- |
| `dev`       | Sobe o servidor de desenvolvimento     |
| `build`     | Build de produção                      |
| `start`     | Serve o build de produção              |
| `lint`      | ESLint (`eslint .`)                    |
| `typecheck` | TypeScript sem emitir (`tsc --noEmit`) |
| `test`      | Testes com Vitest (`vitest run`)       |
| `format`    | Prettier (`prettier --write .`)        |

Exemplo: `pnpm --filter web dev`.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha os valores (URL da API
Laravel, chaves opcionais etc.). Veja `src/lib/env.ts` para o schema.
