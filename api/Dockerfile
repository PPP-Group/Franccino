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
    QUEUE_CONNECTION=database \
    SERVER_NAME=:80

VOLUME /app/storage
EXPOSE 80
ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["frankenphp", "php-server", "--root", "/app/public", "--listen", ":80"]
