#!/bin/sh
# Site Next.js no container (web/Dockerfile): espera a API responder, gera o build com o conteúdo dela e sobe o
# servidor. O build roda no início (e não na imagem) porque as páginas estáticas saem dos dados da API.
set -e
cd /repo

echo "Aguardando a API em ${API_URL}..."
i=0
until node -e "fetch(process.env.API_URL + '/api/v1/settings', { headers: { accept: 'application/json' } }).then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"; do
    i=$((i + 1))
    if [ "$i" -ge 120 ]; then
        echo "A API não respondeu em 10 minutos."
        exit 1
    fi
    sleep 5
done

if [ ! -f web/.next/BUILD_ID ] || [ "${REBUILD_ON_START:-false}" = "true" ]; then
    pnpm --filter web build
fi

cd web
exec node_modules/.bin/next start -H 0.0.0.0 -p "${PORT:-3000}"
