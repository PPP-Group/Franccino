"""Simplifica um GLB pesado mantendo as repetições (instâncias) e os materiais.

Uso: simplificar.py entrada.glb saida.glb alvo_faces_total
Cada malha única é soldada (vértices iguais viram um só, ignorando normais) e reduzida na proporção que leva o total de
faces desenhadas ao alvo. Malhas pequenas (menos de 500 faces) ficam como estão.
"""
import sys

import fast_simplification
import numpy as np
import trimesh


def main():
    entrada, saida, alvo = sys.argv[1], sys.argv[2], int(sys.argv[3])
    cena = trimesh.load(entrada, force='scene')
    usos = {}
    for no in cena.graph.nodes_geometry:
        _, nome = cena.graph[no]
        usos[nome] = usos.get(nome, 0) + 1
    total = sum(len(g.faces) * usos.get(n, 1) for n, g in cena.geometry.items())
    razao = min(1.0, alvo / max(total, 1))
    print('faces desenhadas', total, '-> alvo', alvo, 'razão', round(razao, 3))
    for nome, g in list(cena.geometry.items()):
        if len(g.faces) < 500 or razao >= 0.98:
            continue
        material = getattr(g.visual, 'material', None)
        tem_uv = getattr(g.visual, 'uv', None) is not None and getattr(material, 'baseColorTexture', None) is not None
        if tem_uv:
            # Com textura, a solda separaria a UV: reduz sem soldar as costuras.
            v, f = fast_simplification.simplify(g.vertices.astype(np.float32), g.faces.astype(np.int64),
                                                target_reduction=1 - razao)
            nova = trimesh.Trimesh(v, f, process=False)
            # Sem UV confiável depois da redução: usa a cor média da textura.
            cor = np.asarray(material.baseColorTexture.convert('RGB')).reshape(-1, 3).mean(0)
            nova.visual.material = trimesh.visual.material.PBRMaterial(
                baseColorFactor=[*(cor / 255), 1], metallicFactor=0.0, roughnessFactor=0.8)
        else:
            soldada = trimesh.Trimesh(g.vertices, g.faces, process=True)
            soldada.merge_vertices(merge_tex=True, merge_norm=True)
            v, f = fast_simplification.simplify(soldada.vertices.astype(np.float32), soldada.faces.astype(np.int64),
                                                target_reduction=1 - razao)
            nova = trimesh.Trimesh(v, f, process=False)
            if material is not None and getattr(material, 'baseColorTexture', None) is not None:
                # A solda perde a UV: a textura vira a cor média dela, multiplicada pela cor do material.
                cor = np.asarray(material.baseColorTexture.convert('RGB')).reshape(-1, 3).mean(0) / 255
                fator = np.asarray(material.baseColorFactor if material.baseColorFactor is not None else [255] * 4,
                                   dtype=float)
                fator = fator / 255 if fator.max() > 1 else fator
                nova.visual.material = trimesh.visual.material.PBRMaterial(
                    baseColorFactor=[*(cor * fator[:3]), 1], metallicFactor=0.0, roughnessFactor=0.8)
            elif material is not None:
                nova.visual = trimesh.visual.TextureVisuals(material=material)
        cena.geometry[nome] = nova
    cena.export(saida, file_type='glb')
    depois = sum(len(g.faces) * usos.get(n, 1) for n, g in cena.geometry.items())
    print('faces depois', depois)


if __name__ == '__main__':
    main()
