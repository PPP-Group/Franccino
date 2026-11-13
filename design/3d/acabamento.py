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
    # A escala do mundo (metros) sobre a malha local: a trama da palhinha é uma malha repetida centenas de vezes, então
    # o acabamento vai na malha original e as repetições ficam (o arquivo não cresce).
    escala = {}
    for no in cena.graph.nodes_geometry:
        matriz, nome_geo = cena.graph[no]
        escala.setdefault(nome_geo, float(np.cbrt(abs(np.linalg.det(matriz[:3, :3])))) or 1.0)
    cache, materiais = {}, {}
    for nome_geo, m in list(cena.geometry.items()):
        material = getattr(m.visual, 'material', None)
        fator = getattr(material, 'baseColorFactor', None)
        if fator is None:
            continue
        cor = np.array(fator[:3], dtype=float)
        regra = next((r for r in mapa if np.abs(cor - np.array(r['cor'])).max() <= 3), None)
        if regra is None:
            continue
        tipo = regra['material']
        tinta = [linear(c / 255) for c in regra.get('tinta', [255, 255, 255])] + [1]
        if tipo in ('aluminio', 'borracha'):
            base = [0.80, 0.80, 0.82, 1] if tipo == 'aluminio' else [0.03, 0.03, 0.03, 1]
            m.visual.material = PBRMaterial(baseColorFactor=base, metallicFactor=1.0 if tipo == 'aluminio' else 0.0,
                                            roughnessFactor=0.35 if tipo == 'aluminio' else 0.9)
            continue
        nome, metros = TEX[tipo]
        chave = (nome, tipo in TINGIR)
        if chave not in cache:
            cache[chave] = textura(nome, tipo in TINGIR)
        diff, nor, mr = cache[chave]
        chave_mat = (tipo, tuple(tinta))
        if chave_mat not in materiais:
            materiais[chave_mat] = PBRMaterial(baseColorTexture=diff, normalTexture=nor, metallicRoughnessTexture=mr,
                                               baseColorFactor=tinta, metallicFactor=0.0, roughnessFactor=1.0)
        malha, uv = uv_caixa(m, metros / escala.get(nome_geo, 1.0))
        malha.visual = TextureVisuals(uv=uv, material=materiais[chave_mat])
        cena.geometry[nome_geo] = malha
    cena.export(saida, file_type='glb')
    print(saida, round(Path(saida).stat().st_size / 1e6, 2), 'MB')


if __name__ == '__main__':
    main()
