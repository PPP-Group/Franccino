#!/usr/bin/env python3
"""Baixa do Google Drive os arquivos da auditoria e envia para a API pela importação em massa.

Uso (instruções completas no LEIA-ME.md desta pasta):

    python3 -I design/drive/importar.py design/drive/2026-11-12-auditoria.json [--so files|media] [--simular]

- Lê o manifesto (um item por arquivo do Drive, já ligado ao registro do site).
- Baixa cada arquivo pela API do Drive (`drive.readonly`), converte o que pede conversão (HEIC para JPG) e reduz as
  fotos grandes com o ImageMagick (`convert`), e envia: blocos e fichas por `/api/import/files`, fotos por
  `/api/import/media` (com `source=drive:<id>`, então rodar de novo não duplica).
- Os tokens vêm do ambiente: `GOOGLE_DRIVE_TOKEN` e `CONTENT_IMPORT_TOKEN`. Sem a variável, o pedido sai sem o
  cabeçalho (para o caso de o token ser posto pelo proxy da sessão). Nunca escreva um token neste arquivo.
- Guarda o que já foi enviado em `--estado` (padrão: `.importados.json` nesta pasta, fora do git), para continuar de onde
  parou se a rede cair ou o token do Drive vencer (ele vale cerca de 1 hora).

Só a biblioteca padrão do Python, o `curl` e o ImageMagick: nenhuma dependência do projeto.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

API = os.environ.get('API_URL', 'https://api-preview-franccino.valenteai.cloud')
DRIVE = 'https://www.googleapis.com/drive/v3/files/{id}?alt=media&supportsAllDrives=true'


def auth(variable: str) -> list[str]:
    token = os.environ.get(variable, '').strip()
    return ['-H', f'Authorization: Bearer {token}'] if token else []


def baixar(item: dict, pasta: Path) -> Path:
    destino = pasta / item['name']
    subprocess.run(
        ['curl', '-fsSL', '--retry', '3', '--retry-all-errors', '-o', str(destino),
         *auth('GOOGLE_DRIVE_TOKEN'), DRIVE.format(id=item['drive_id'])],
        check=True,
    )
    return destino


def preparar(item: dict, arquivo: Path) -> Path:
    """HEIC e RAW viram JPG; foto maior que `resize` px no lado maior é reduzida (qualidade 85, sem metadados).

    Com `pillow-heif` e `rawpy` no Python que roda o script, o HEIC do iPhone e o RAW da Sony saem por eles (o
    ImageMagick de muitas máquinas não lê o HEIC do iPhone); sem eles, pelo ImageMagick (`convert`).
    """
    if item['kind'] != 'media' or not (item.get('convert') or item.get('resize')):
        return arquivo
    saida = arquivo.with_suffix('.jpg')
    if saida == arquivo:
        saida = arquivo.with_name(arquivo.stem + '-web.jpg')
    lado = item.get('resize', 4000)
    try:
        from PIL import Image, ImageOps  # noqa: PLC0415 - opcional, só na máquina de quem roda
        import pillow_heif  # noqa: PLC0415

        pillow_heif.register_heif_opener()
        if arquivo.suffix.lower() == '.arw':
            import rawpy  # noqa: PLC0415

            with rawpy.imread(str(arquivo)) as raw:
                imagem = Image.fromarray(raw.postprocess(use_camera_wb=True))
        else:
            imagem = ImageOps.exif_transpose(Image.open(arquivo))
        imagem = imagem.convert('RGB')
        imagem.thumbnail((lado, lado), Image.Resampling.LANCZOS)
        imagem.save(saida, 'JPEG', quality=85, optimize=True, progressive=True)
        return saida
    except ImportError:
        pass
    subprocess.run(
        ['convert', str(arquivo), '-auto-orient', '-resize', f'{lado}x{lado}>', '-strip', '-quality', '85', str(saida)],
        check=True,
    )
    return saida


def enviar(item: dict, arquivo: Path) -> dict:
    if item['kind'] == 'file':
        rota = '/api/import/files'
        campos = {'target': item['target'], 'key': item['key'], 'type': item['type'], 'title': item['title']}
        if item.get('title_en'):
            campos['title_en'] = item['title_en']
    else:
        rota = '/api/import/media'
        campos = {'target': item['target'], 'key': item['key'], 'collection': item['collection'],
                  'source': f"drive:{item['drive_id']}"}
        # Galeria com nome numa página (ex.: "Peças em produção", na Fábrica).
        for campo in ('caption', 'caption_en'):
            if item.get(campo):
                campos[campo] = item[campo]
    form: list[str] = []
    for nome, valor in campos.items():
        form += ['--form-string', f'{nome}={valor}']
    # O nome original do arquivo (o do Drive) é o que a API guarda e usa para trocar o bloco numa nova rodada.
    nome = item['name'] if arquivo.suffix.lower() == Path(item['name']).suffix.lower() else Path(item['name']).stem + arquivo.suffix
    resposta = subprocess.run(
        ['curl', '-sS', '--retry', '2', '-w', '\n%{http_code}', *auth('CONTENT_IMPORT_TOKEN'),
         '-H', 'Accept: application/json', *form, '-F', f'file=@{arquivo};filename="{nome}"', API + rota],
        check=True, capture_output=True, text=True,
    ).stdout
    corpo, _, codigo = resposta.rpartition('\n')
    if not codigo.startswith('2'):
        raise RuntimeError(f'{codigo}: {corpo[:300]}')
    return json.loads(corpo or '{}')


def main() -> int:
    args = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    args.add_argument('manifesto')
    args.add_argument('--so', choices=['files', 'media'], help='só os blocos e fichas (files) ou só as fotos (media)')
    args.add_argument('--simular', action='store_true', help='lista o que seria feito, sem baixar nem enviar')
    args.add_argument('--estado', default=str(Path(__file__).with_name('.importados.json')))
    opcoes = args.parse_args()

    itens = json.loads(Path(opcoes.manifesto).read_text())['items']
    if opcoes.so:
        itens = [i for i in itens if i['kind'] == ('file' if opcoes.so == 'files' else 'media')]
    estado_arquivo = Path(opcoes.estado)
    feitos: dict = json.loads(estado_arquivo.read_text()) if estado_arquivo.exists() else {}

    pendentes = [i for i in itens if i['drive_id'] not in feitos]
    print(f'{len(itens)} itens, {len(itens) - len(pendentes)} já enviados, {len(pendentes)} a enviar')
    if opcoes.simular:
        for item in pendentes:
            print(f"  {item['kind']:5} {item['target']:10} {item['key']:40} {item['name']}")
        return 0

    falhas = 0
    for numero, item in enumerate(pendentes, 1):
        pasta = Path(tempfile.mkdtemp(prefix='drive-'))
        try:
            arquivo = preparar(item, baixar(item, pasta))
            resultado = enviar(item, arquivo)
            feitos[item['drive_id']] = resultado.get('data', {})
            estado_arquivo.write_text(json.dumps(feitos, indent=1))
            print(f"[{numero}/{len(pendentes)}] ok   {item['key']} · {item['name']}", flush=True)
        except Exception as erro:  # noqa: BLE001 - segue para o próximo e mostra o erro
            falhas += 1
            print(f"[{numero}/{len(pendentes)}] ERRO {item['key']} · {item['name']}: {erro}", flush=True)
        finally:
            shutil.rmtree(pasta, ignore_errors=True)
    print(f'Fim: {len(pendentes) - falhas} enviados, {falhas} com erro (rode de novo para tentar só esses).')
    return 1 if falhas else 0


if __name__ == '__main__':
    sys.exit(main())
