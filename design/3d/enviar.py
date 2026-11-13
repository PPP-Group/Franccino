#!/usr/bin/env python3
"""Envia ao site os GLB que o converter.py gravou em SAIDA, como o modelo 3D (`model_3d`) de cada peça.

Uso: SAIDA=<a mesma pasta do converter.py> CONTENT_IMPORT_TOKEN=... python3 -I design/3d/enviar.py [--simular]

- Só envia as peças marcadas como prontas no `estado.json` da conversão (GLB de até 20 MB).
- O modelo 3D é um arquivo só por peça: enviar de novo troca o anterior.
- Grava o que já foi enviado em `SAIDA/enviados.json`, para continuar de onde parou.
- O token vem do ambiente; nunca o escreva neste arquivo.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

API = os.environ.get('API_URL', 'https://api-preview-franccino.valenteai.cloud')


def main() -> int:
    simular = '--simular' in sys.argv
    saida = Path(os.environ['SAIDA'])
    estado = json.loads((saida / 'estado.json').read_text())
    enviados_p = saida / 'enviados.json'
    enviados = json.loads(enviados_p.read_text()) if enviados_p.exists() else {}
    token = os.environ.get('CONTENT_IMPORT_TOKEN')
    auth = ['-H', f'Authorization: Bearer {token}'] if token else []

    prontas = [slug for slug, item in sorted(estado.items()) if item.get('ok') and slug not in enviados]
    print(f'{len(prontas)} peças para enviar')
    for slug in prontas:
        glb = saida / f'{slug}.glb'
        if simular:
            print('enviaria', slug, glb.stat().st_size // 1024, 'KB')
            continue
        resposta = subprocess.run(
            ['curl', '-sS', '--retry', '2', '-w', '\n%{http_code}', *auth, '-H', 'Accept: application/json',
             '--form-string', 'target=product', '--form-string', f'key={slug}',
             '--form-string', 'collection=model_3d',
             '-F', f'file=@{glb};type=model/gltf-binary;filename="{slug}.glb"', f'{API}/api/import/media'],
            capture_output=True, text=True,
        ).stdout
        corpo, _, codigo = resposta.rpartition('\n')
        if codigo.startswith('2'):
            enviados[slug] = True
            enviados_p.write_text(json.dumps(enviados, indent=1))
            print('ok  ', slug)
        else:
            print('ERRO', slug, codigo, corpo[:200])
    return 0


if __name__ == '__main__':
    sys.exit(main())
