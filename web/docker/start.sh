#!/bin/sh
# Site Next.js no container (web/Dockerfile): espera a API responder, gera o build com o conteúdo dela e sobe o
# servidor. O build roda no início (e não na imagem) porque as páginas estáticas saem dos dados da API.
#
# Deploy da API e do site ao mesmo tempo (retorno de 16/11/2026): o build começava com a API antiga no ar e a API caía
# no meio dele, durante a troca de container. O Next grava o `BUILD_ID` antes de gerar as páginas, então o build falhava
# com o `BUILD_ID` já gravado; o container reiniciava, achava o `BUILD_ID` e subia o site pela metade (páginas faltando,
# versões misturadas) até um "forçar rebuild". Agora:
#   - o build só conta como pronto com a marca própria (`.franccino-build-ok`), gravada depois que ele termina;
#   - antes de cada tentativa, a API precisa responder várias vezes seguidas (a troca de container já passou);
#   - o build que falha é apagado e refeito aqui mesmo, depois de esperar a API de novo. O site antigo continua no ar
#     enquanto isso, porque o container novo só fica saudável quando o `next start` sobe.
set -e
cd /repo

READY_MARK=web/.next/.franccino-build-ok
# Respostas seguidas da API antes do build (de 5 em 5 s).
STABLE_CHECKS=${API_STABLE_CHECKS:-6}
BUILD_ATTEMPTS=${BUILD_ATTEMPTS:-4}

api_ok() {
    node -e "fetch(process.env.API_URL + '/api/v1/settings', { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(10000) }).then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
}

# Espera a API responder STABLE_CHECKS vezes seguidas; desiste depois de 15 minutos.
wait_for_api() {
    echo "Aguardando a API em ${API_URL}..."
    ok=0
    i=0
    while [ "$ok" -lt "$STABLE_CHECKS" ]; do
        if api_ok; then
            ok=$((ok + 1))
        else
            ok=0
        fi
        i=$((i + 1))
        if [ "$i" -ge 180 ]; then
            echo "A API não ficou estável em 15 minutos."
            exit 1
        fi
        [ "$ok" -ge "$STABLE_CHECKS" ] || sleep 5
    done
    echo "API estável."
}

if [ "${REBUILD_ON_START:-false}" = "true" ]; then
    rm -f "$READY_MARK"
fi

if [ ! -f "$READY_MARK" ]; then
    attempt=1
    while :; do
        wait_for_api
        rm -rf web/.next
        echo "Build do site (tentativa ${attempt} de ${BUILD_ATTEMPTS})..."
        if pnpm --filter web build; then
            touch "$READY_MARK"
            break
        fi
        if [ "$attempt" -ge "$BUILD_ATTEMPTS" ]; then
            echo "O build falhou ${BUILD_ATTEMPTS} vezes."
            exit 1
        fi
        attempt=$((attempt + 1))
        echo "O build falhou (a API caiu no meio?). Esperando a API para tentar de novo."
    done
fi

cd web
exec node_modules/.bin/next start -H 0.0.0.0 -p "${PORT:-3000}"
