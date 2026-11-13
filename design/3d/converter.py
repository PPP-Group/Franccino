"""Converte o SketchUp escolhido de cada peça (escolha.json) para GLB, em metros, com as cores e texturas do arquivo.

Uso: SAIDA=<pasta fora do repositório> GOOGLE_DRIVE_TOKEN=... python -I converter.py
Precisa do OpenSKP 1.5.0 com o patch openskp-1.5.0-materiais.patch (LEIA-ME.md). Os GLB nunca entram no repositório.
"""
import json, os, subprocess, sys, tempfile, traceback
import numpy as np, trimesh, openskp
from openskp.export import glb as G, instanced_glb as IG
import signal
class Lento(Exception): pass
def _alarme(*_): raise Lento('passou de 5 minutos')
signal.signal(signal.SIGALRM, _alarme)

BASE = os.path.dirname(os.path.abspath(__file__))
escolha = json.load(open(os.path.join(BASE, 'escolha.json')))
SAIDA = os.environ['SAIDA']
os.makedirs(SAIDA, exist_ok=True)
estado_p = os.path.join(SAIDA, 'estado.json')
estado = json.load(open(estado_p)) if os.path.exists(estado_p) else {}
def linear(v):
    """O SketchUp guarda a cor em sRGB; o glTF espera a cor linear (sem isso, o cinza vira branco)."""
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

for slug, item in sorted(escolha.items()):
    if slug in estado and estado[slug].get('ok'):
        continue
    if item['size_mb'] > 150:
        estado[slug] = {'ok': False, 'motivo': f"SketchUp com {item['size_mb']} MB"}; continue
    tmp = tempfile.mkdtemp(prefix='skp-')
    signal.alarm(300)
    try:
        skp = os.path.join(tmp, 'm.skp')
        subprocess.run(['curl', '-fsSL', '--retry', '3', '-o', skp, '-H', 'Authorization: Bearer ' + os.environ['GOOGLE_DRIVE_TOKEN'],
                        f"https://www.googleapis.com/drive/v3/files/{item['drive_id']}?alt=media&supportsAllDrives=true"], check=True)
        f = openskp.SkpFile.open(skp); f.parse()
        bruto = os.path.join(tmp, 'm.glb')
        try:
            IG.export(f, bruto, textures=True)
        except Lento:
            raise
        except Exception:
            G.export(f, bruto, textures=True)
        sc = trimesh.load(bruto, force='scene')
        sc.apply_scale(0.001)
        for g in sc.geometry.values():
            mat = getattr(g.visual, 'material', None)
            bc = getattr(mat, 'baseColorFactor', None) if mat is not None else None
            if bc is None:
                continue
            c = np.array(bc, dtype=float)
            if c.max() > 1:
                c = c / 255
            mat.baseColorFactor = [*(linear(x) for x in c[:3]), c[3] if len(c) > 3 else 1]
        out = os.path.join(SAIDA, slug + '.glb')
        sc.export(out, file_type='glb')
        ext = [round(x * 1000) for x in sc.extents]
        mb = round(os.path.getsize(out) / 1e6, 2)
        estado[slug] = {'ok': mb <= 20, 'mb': mb, 'mm': ext, 'origem': item['name'], **({} if mb <= 20 else {'motivo': f'GLB com {mb} MB'})}
        print('ok  ', slug, mb, 'MB', ext, flush=True)
    except Exception as ex:
        estado[slug] = {'ok': False, 'motivo': f'{type(ex).__name__}: {str(ex)[:150]}'}
        print('ERRO', slug, estado[slug]['motivo'], flush=True)
    finally:
        signal.alarm(0)
        subprocess.run(['rm', '-rf', tmp])
        json.dump(estado, open(estado_p, 'w'), indent=1)
ok = sum(1 for v in estado.values() if v.get('ok'))
print('fim:', ok, 'convertidas de', len(escolha))
