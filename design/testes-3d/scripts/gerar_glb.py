"""Roda um script de modelagem de design/testes-3d/scripts com o bpy e exporta GLB.

Uso: python gerar.py <script.py> <saida.glb>
"""
import os
import runpy
import sys

import bpy

script, saida = sys.argv[1], sys.argv[2]
runpy.run_path(script, run_name='__main__')

# Medidas totais (só malhas), em mm.
mins = [9.0, 9.0, 9.0]
maxs = [-9.0, -9.0, -9.0]
tris = 0
for ob in bpy.data.objects:
    if ob.type != 'MESH':
        continue
    for v in ob.data.vertices:
        co = ob.matrix_world @ v.co
        for i in range(3):
            mins[i] = min(mins[i], co[i])
            maxs[i] = max(maxs[i], co[i])
    ob.data.calc_loop_triangles()
    tris += len(ob.data.loop_triangles)

bpy.ops.export_scene.gltf(
    filepath=saida,
    export_format='GLB',
    export_apply=True,
    export_yup=True,
    export_image_format='AUTO',
)
dims = [round((maxs[i] - mins[i]) * 1000, 1) for i in range(3)]
print(f'RESULTADO {os.path.basename(saida)}: L {dims[0]} x P {dims[1]} x A {dims[2]} mm | '
      f'{tris} triangulos | {os.path.getsize(saida) / 1048576:.2f} MB')
