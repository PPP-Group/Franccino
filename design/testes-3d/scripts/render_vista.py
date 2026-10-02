"""Render de uma vista (frente, tres_quartos ou lateral) com fundo claro, sem alterar o modelo.

Usado para as imagens de comparacao com as fotos. No 3D Jutsu cada vista rodou numa consulta
separada (limite de 5 min por execucao) e a imagem foi publicada pelo `artifacts`; num Blender
local a imagem e gravada em RENDER_SAIDA.
Variaveis: VIEW, RF (distancia da camera em multiplos da maior medida) e, para o sofa, fundo cinza e
exposicao -1,2 (tecido branco).
"""
import os, math
import bpy
from mathutils import Vector

exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib_blender.py'), encoding='utf-8').read())

VIEW = os.environ.get('VIEW', 'tres_quartos')
RF = float(os.environ.get('RF', '3.3'))
SAIDA = os.environ.get('RENDER_SAIDA', f'//{VIEW}.png')
DIRS = {'frente': (0, -1, 0.10), 'tres_quartos': (-0.72, -0.85, 0.42), 'lateral': (1, 0, 0.10)}

scene = bpy.context.scene
coll = bpy.data.collections[0]
mins, maxs = bounds(coll); size = maxs - mins
target = Vector((0, (mins.y + maxs.y) / 2, size.z * 0.46))
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1400; scene.render.resolution_y = 1050
scene.render.image_settings.file_format = 'PNG'
scene.eevee.taa_render_samples = 24
scene.view_settings.view_transform = 'Khronos PBR Neutral'
world = bpy.data.worlds.new('W'); world.use_nodes = True
bg = world.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (1, 1, 1, 1); bg.inputs['Strength'].default_value = 0.85
scene.world = world
bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, 0))
floor = bpy.context.active_object
fm = bpy.data.materials.new('floor'); fm.use_nodes = True
fm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.97, 0.97, 0.97, 1)
fm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.9
floor.data.materials.append(fm)


def light(name, loc, energy, sz):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = energy; ld.size = sz
    ob = bpy.data.objects.new(name, ld); scene.collection.objects.link(ob); ob.location = loc
    ob.rotation_euler = (target - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


light('key', (-1.8, -2.2, 2.6), 520, 2.2); light('fill', (2.4, -1.4, 1.5), 170, 2.8); light('rim', (0.6, 2.6, 2.2), 240, 2.2)
cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 60
cam = bpy.data.objects.new('cam', cam_d); scene.collection.objects.link(cam); scene.camera = cam
loc = target + Vector(DIRS[VIEW]).normalized() * max(size.x, size.y, size.z) * RF
cam.location = loc; cam.rotation_euler = (target - loc).to_track_quat('-Z', 'Y').to_euler()
scene.render.filepath = SAIDA
bpy.ops.render.render(write_still=True)
