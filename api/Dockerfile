# syntax=docker/dockerfile:1
# API Laravel + painel Filament para staging e preview (EasyPanel ou docker compose).
# Banco SQLite, fotos e arquivos ficam no volume /app/storage. Passo a passo em docs/deploy-preview.md.
FROM composer:2 AS composer

FROM dunglas/frankenphp:1-php8.4-bookworm

RUN install-php-extensions intl gd exif zip bcmath opcache pcntl pdo_mysql pdo_sqlite \
    && apt-get update \
    && apt-get install -y --no-install-recommends curl unzip sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --no-progress

COPY . .
RUN composer dump-autoload --optimize --no-dev --no-interaction \
    && cp docker/php.ini "$PHP_INI_DIR/conf.d/zz-franccino.ini" \
    && chmod +x docker/entrypoint.sh

ENV APP_ENV=staging \
    APP_DEBUG=false \
    APP_LOCALE=pt_BR \
    APP_FALLBACK_LOCALE=en \
    APP_LOCALES=pt,en \
    APP_TIMEZONE=America/Sao_Paulo \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/app/storage/database.sqlite \
    DB_BUSY_TIMEOUT=10000 \
    DB_JOURNAL_MODE=wal \
    DB_TRANSACTION_MODE=IMMEDIATE \
    QUEUE_CONNECTION=database \
    DB_QUEUE_RETRY_AFTER=600 \
    SERVER_NAME=:80

VOLUME /app/storage
EXPOSE 80
# A imagem base testa a porta 2019 (admin do Caddy), que o `php-server` não abre: o Swarm do EasyPanel marcava a
# API como doente e a reiniciava sem parar. O teste certo é a rota /up do Laravel. O prazo inicial cobre as
# migrations e o import do SNAPSHOT_URL no primeiro início.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5m --retries=3 \
    CMD curl -fsS -o /dev/null http://localhost/up || exit 1
ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/app/docker/Caddyfile"]
