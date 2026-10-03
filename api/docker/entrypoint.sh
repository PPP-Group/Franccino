#!/bin/sh
# Prepara a API a cada início do container: pastas do volume, chave, migrations, admin, snapshot opcional e
# worker da fila. Depois entrega o processo principal (FrankenPHP). Ver docs/deploy-preview.md.
set -e
cd /app

mkdir -p storage/app/public storage/app/private storage/framework/cache/data storage/framework/sessions \
    storage/framework/views storage/logs bootstrap/cache

# Sem APP_KEY no ambiente, gera uma vez e guarda no volume (sobrevive a redeploys).
if [ -z "${APP_KEY}" ]; then
    if [ ! -f storage/.app-key ]; then
        php -r 'echo "base64:".base64_encode(random_bytes(32));' > storage/.app-key
    fi
    APP_KEY="$(cat storage/.app-key)"
    export APP_KEY
fi

if [ "${DB_CONNECTION}" = "sqlite" ] && [ ! -f "${DB_DATABASE}" ]; then
    touch "${DB_DATABASE}"
fi

# CORS da mídia (/storage) para o visualizador 3D: só as origens de FRONTEND_URL, separadas por vírgula, viram a regex
# que o docker/Caddyfile usa. Ponto vira [.], sem barra invertida para o Caddyfile não interpretar.
if [ -z "${MEDIA_CORS_ORIGINS}" ]; then
    origins="$(printf '%s' "${FRONTEND_URL:-http://localhost:3000}" | tr -d ' ' | sed 's/[.]/[.]/g; s/,/|/g')"
    MEDIA_CORS_ORIGINS="^(${origins})\$"
    export MEDIA_CORS_ORIGINS
fi

php artisan storage:link --force > /dev/null
# Num redeploy o container novo sobe antes do antigo parar: a trava no volume impede duas migrations ao mesmo
# tempo no mesmo SQLite (erro "table already exists").
flock storage/.migrate.lock php artisan migrate --force

# Conteúdo de exemplo: SNAPSHOT_URL aponta para um zip de `php artisan franccino:snapshot export`. Importa uma vez
# só: o comando grava storage/.snapshot-imported (também no import manual), e daí em diante vale o que for
# editado no painel. Link fora do ar não derruba a API.
if [ -n "${SNAPSHOT_URL}" ] && [ ! -f storage/.snapshot-imported ]; then
    echo "Baixando o snapshot de conteúdo..."
    if curl -fsSL "${SNAPSHOT_URL}" -o /tmp/snapshot.zip; then
        flock storage/.migrate.lock php artisan franccino:snapshot import /tmp/snapshot.zip --force \
            || echo "Import do snapshot falhou; a API sobe com o conteúdo atual."
    else
        echo "Não foi possível baixar SNAPSHOT_URL; a API sobe com o conteúdo atual."
    fi
    rm -f /tmp/snapshot.zip
fi

php artisan db:seed --class=AdminUserSeeder --force
php artisan optimize > /dev/null

# Workers da fila (fotos redimensionadas, revalidação do site, e-mails), QUEUE_WORKERS em paralelo (padrão 2: o
# catálogo inteiro sai em cerca de meia hora). Reiniciam sozinhos a cada hora. Foto grande num VPS pequeno passa
# de 1 minuto: o limite por tarefa é 5 (e DB_QUEUE_RETRY_AFTER, 10).
if [ "${RUN_QUEUE_WORKER:-true}" = "true" ]; then
    i=0
    while [ "$i" -lt "${QUEUE_WORKERS:-2}" ]; do
        (while true; do php artisan queue:work --tries=3 --sleep=3 --timeout=300 --max-time=3600 || sleep 5; done) &
        i=$((i + 1))
    done
fi

exec "$@"
