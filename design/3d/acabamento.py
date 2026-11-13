"""Teste: troca as cores lisas de um GLB por acabamentos genéricos realistas (Poly Haven, CC0).

Uso: acabamento.py entrada.glb saida.glb mapa.json
mapa.json: lista de {"cor": [r, g, b] (cor linear 0-255 no GLB), "material": "madeira" | "linho" | "couro" | "aluminio" |
"borracha" | "tela", "tinta": [r, g, b] opcional (multiplica a textura)}.
A projeção da textura é por caixa (eixo dominante da normal), em metros, então a escala do veio fica real.
"""
import json
import sys
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

# As texturas (Poly Haven, CC0) ficam fora do repositório: baixe-as para TEX_LIB (LEIA-ME.md).
LIB = Path(__import__('os').environ.get('TEX_LIB', Path(__file__).with_name('tex-lib')))
TEX = {
    'madeira_clara': ('european_walnut_veneer_04', 0.6),  # (arquivo, metros por repetição)
    'madeira_escura': ('fine_grained_wood', 0.6),
    'linho': ('rough_linen', 0.35),  # tecidos: só a trama, tingida com a cor do arquivo (`tinta`)
    'tela': ('rough_linen', 0.15),
    'couro': ('brown_leather', 0.5),
}
TINGIR = {'linho', 'tela'}


def linear(v):
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4


def textura(nome, tingir=False):
    diff = Image.open(LIB / f'{nome}_diff.jpg').convert('RGB')
    if tingir:
        # A trama em cinza claro (média ~0,9): a cor vem do baseColorFactor, que é a cor do próprio arquivo.
        cinza = np.asarray(diff.convert('L'), dtype=float)
        cinza = np.clip(cinza * (230 / cinza.mean()), 0, 255).astype(np.uint8)
        diff = Image.fromarray(cinza).convert('RGB')
    nor = Image.open(LIB / f'{nome}_nor.jpg').convert('RGB')
    rough = np.asarray(Image.open(LIB / f'{nome}_rough.jpg').convert('L'))
    mr = np.zeros((*rough.shape, 3), dtype=np.uint8)
    mr[..., 1] = rough  # glTF: rugosidade no canal G, metal no B (0)
    return diff, nor, Image.fromarray(mr)


def uv_caixa(mesh, metros):
    mesh = mesh.copy()
    mesh.unmerge_vertices()
    normais = np.abs(mesh.face_normals)
    eixo = normais.argmax(axis=1)
    v = mesh.vertices
    uv = np.zeros((len(v), 2))
    for f, a in enumerate(eixo):
        idx = mesh.faces[f]
        outros = [i for i in range(3) if i != a]
        uv[idx] = v[idx][:, outros] / metros
    return mesh, uv


def main():
    entrada, saida, mapa_p = sys.argv[1:4]
    mapa = json.load(open(mapa_p))
    cena = trimesh.load(entrada, force='scene')
    malhas = cena.dump(concatenate=False)  # em metros, com as transformações aplicadas
    nova = trimesh.Scene()
    cache = {}
    for m in malhas:
        cor = np.array(m.visual.material.baseColorFactor[:3], dtype=float) if hasattr(m.visual, 'material') else None
        regra = None
        if cor is not None:
            for r in mapa:
                if np.abs(cor - np.array(r['cor'])).max() <= 3:
                    regra = r
                    break
        if regra is None:
            nova.add_geometry(m)
            continue
        tipo = regra['material']
        # A tinta vem em sRGB (a cor do SketchUp); o glTF espera a cor linear.
        tinta = [linear(c / 255) for c in regra.get('tinta', [255, 255, 255])] + [1]
        if tipo == 'aluminio':
            m.visual.material = PBRMaterial(baseColorFactor=[0.80, 0.80, 0.82, 1], metallicFactor=1.0, roughnessFactor=0.35)
            nova.add_geometry(m)
            continue
        if tipo == 'borracha':
            m.visual.material = PBRMaterial(baseColorFactor=[0.03, 0.03, 0.03, 1], metallicFactor=0.0, roughnessFactor=0.9)
            nova.add_geometry(m)
            continue
        nome, metros = TEX[tipo]
        chave = (nome, tipo in TINGIR)
        if chave not in cache:
            cache[chave] = textura(nome, tipo in TINGIR)
        diff, nor, mr = cache[chave]
        malha, uv = uv_caixa(m, metros)
        mat = PBRMaterial(baseColorTexture=diff, normalTexture=nor, metallicRoughnessTexture=mr,
                          baseColorFactor=tinta, metallicFactor=0.0, roughnessFactor=1.0)
        malha.visual = TextureVisuals(uv=uv, material=mat)
        nova.add_geometry(malha)
    nova.export(saida, file_type='glb')
    print(saida, round(Path(saida).stat().st_size / 1e6, 2), 'MB')


if __name__ == '__main__':
    main()
