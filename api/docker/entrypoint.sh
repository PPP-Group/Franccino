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

php artisan storage:link --force > /dev/null
php artisan migrate --force

# Conteúdo de exemplo: SNAPSHOT_URL aponta para um zip de `php artisan franccino:snapshot export` (uma vez só).
if [ -n "${SNAPSHOT_URL}" ] && [ ! -f storage/.snapshot-imported ]; then
    echo "Baixando o snapshot de conteúdo..."
    curl -fsSL "${SNAPSHOT_URL}" -o /tmp/snapshot.zip
    php artisan franccino:snapshot import /tmp/snapshot.zip --force
    rm -f /tmp/snapshot.zip
    date > storage/.snapshot-imported
fi

php artisan db:seed --class=AdminUserSeeder --force
php artisan optimize > /dev/null

# Worker da fila (fotos redimensionadas, revalidação do site, e-mails). Reinicia sozinho a cada hora.
if [ "${RUN_QUEUE_WORKER:-true}" = "true" ]; then
    (while true; do php artisan queue:work --tries=3 --sleep=3 --max-time=3600 || sleep 5; done) &
fi

exec "$@"
