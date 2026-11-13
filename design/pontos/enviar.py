"""Envia os pontos clicáveis das fotos ao site (POST /api/import/image-points).

Uso: CONTENT_IMPORT_TOKEN no ambiente (nunca no chat nem em arquivo).
    python3 -I design/pontos/enviar.py design/pontos/2026-11-13-pontos.json [--simular] [--api URL]
Cada item troca os pontos daquela foto pelos da lista (os que ela tinha saem).
"""
import json
import os
import sys
import urllib.request

API = 'https://api-preview-franccino.valenteai.cloud'


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    api = sys.argv[sys.argv.index('--api') + 1] if '--api' in sys.argv else API
    if '--api' in sys.argv:
        args.remove(api)
    data = json.load(open(args[0]))
    items = []
    for item in data['items']:
        out = {k: item[k] for k in ('media_id', 'scene_id') if k in item}
        out['title'] = item['where'][:160]
        out['points'] = [{'x': p['x'], 'y': p['y'], 'product': p['product']} for p in item['points']]
        items.append(out)
    print(len(items), 'fotos,', sum(len(i['points']) for i in items), 'pontos')
    if '--simular' in sys.argv:
        return
    token = os.environ['CONTENT_IMPORT_TOKEN']
    for start in range(0, len(items), 100):
        body = json.dumps({'items': items[start:start + 100]}).encode()
        req = urllib.request.Request(f'{api}/api/import/image-points', data=body, method='POST', headers={
            'Authorization': f'Bearer {token}', 'Content-Type': 'application/json', 'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'})
        print(json.load(urllib.request.urlopen(req, timeout=120)))


if __name__ == '__main__':
    main()
