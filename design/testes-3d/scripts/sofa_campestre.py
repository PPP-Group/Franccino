"""Sofa Campestre 2,00 m, modulo inteiro (Estudio Franccino).

Ficha: 2000 x 1000 mm. Tabela "Padrao de alturas sofas": braco 725, encosto 820, assento 510,
almofada do assento 140, largura do braco e do encosto 110. Altura total com as almofadas soltas nao
esta na ficha (aprox. 910 mm pela foto).
Passos na ordem em que rodaram no 3D Jutsu (revisoes 1 e 2 do projeto):
1. modelagem; 2. almofadas soltas mais baixas, medidas externas da ficha e trama do tecido.
Para rodar num Blender local: blender -b -P sofa_campestre.py (nao testado fora do 3D Jutsu).
"""
import os, math
import bpy
import numpy as np
from mathutils import Vector, Matrix

exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib_blender.py'), encoding='utf-8').read())

# ---------------- 1. modelagem ----------------
coll, root = setup('Sofa_Campestre_200', {
    'produto': 'Sofa Campestre 2,00 m (modulo inteiro) - Estudio Franccino',
    'medidas_ficha_mm': 'L 2000 x P 1000; braco 725; encosto 820; assento 510; almofada do assento 140; braco e encosto 110 de largura',
    'unidade': 'metro (glTF); 1 unidade = 1000 mm',
})
RNG = np.random.default_rng(23)
f_rgb, f_n = fabric_maps(1024, (0.80, 0.80, 0.785), RNG, threads=260)
FABRIC = make_material('Tecido_Algodao_Branco', f_rgb, f_n, 1024, 0.9, 0.55, sheen=0.4)
FEET = flat_material('Madeira_Ebanizada', (0.025, 0.018, 0.014), 0.5)

W, D = 2.0, 1.0
def Y(yf): return yf - D / 2
ARM_W, BACK_W = 0.110, 0.110
SKIRT = 0.010      # capa termina 10 mm acima do piso; os pes embutidos ficam por baixo
SEAT_TOP, CUSH = 0.510, 0.140
DECK = SEAT_TOP - CUSH

# bracos (capa solta, levemente abertos no topo)
for side, s in (('E', -1), ('D', 1)):
    H = 0.725 - SKIRT
    def arm_def(p, s=s, H=H):
        t = (p.z + H / 2) / H
        x = p.x + s * 0.010 * t * t
        y = p.y
        if p.y < 0:
            y -= 0.006 * math.sin(math.pi * t)
        return Vector((s * (W / 2 - ARM_W / 2) + x, Y(D / 2) + y, SKIRT + H / 2 + p.z))
    rounded_box(f'Braco_{side}', (ARM_W, D, H), 0.035, 16, FABRIC, arm_def, grain='Z')

# encosto (entre os bracos)
H = 0.820 - SKIRT
def back_def(p):
    t = (p.z + H / 2) / H
    return Vector((p.x, Y(D - BACK_W / 2) + p.y - 0.010 * t, SKIRT + H / 2 + p.z))
rounded_box('Encosto', (W - 2 * ARM_W + 0.03, BACK_W, H), 0.035, 18, FABRIC, back_def, grain='X')

# base do assento com saia
BW = W - 2 * ARM_W + 0.01
BD = D - BACK_W + 0.01
BH = DECK - SKIRT
def base_def(p):
    t = (p.z + BH / 2) / BH
    y = p.y
    if p.y < 0:
        y -= 0.008 * (1 - t)
    return Vector((p.x, Y(BD / 2) + y, SKIRT + BH / 2 + p.z))
rounded_box('Base_saia', (BW, BD, BH), 0.025, 18, FABRIC, base_def, grain='X')

# almofadas do assento (2), com vivo na metade da altura
CW = (BW - 0.012) / 2; CD = BD + 0.015
for s in (-1, 1):
    cx = s * (CW / 2 + 0.003)
    def cush_def(p, cx=cx):
        xn = 2 * p.x / CW; yn = 2 * p.y / CD
        bul = (1 - xn * xn) * (1 - yn * yn)
        z = p.z * (1 + 0.22 * bul)
        y = p.y - (0.012 if p.y < 0 else 0) * (1 - (2 * p.z / CUSH) ** 2)
        return Vector((cx + p.x, Y(-0.012 + CD / 2) + y, DECK + CUSH / 2 + z))
    rounded_box(f'Almofada_assento_{"E" if s < 0 else "D"}', (CW, CD, CUSH), 0.045, 18, FABRIC, cush_def, grain='X')
    def flange_def(p, cx=cx):
        return Vector((cx + p.x, Y(-0.012 + CD / 2) + p.y - 0.004, DECK + CUSH / 2 + p.z))
    rounded_box(f'Vivo_assento_{"E" if s < 0 else "D"}', (CW + 0.016, CD + 0.020, 0.006), 0.003, 8, FABRIC, flange_def, grain='X')

# almofadas de encosto: 2 grandes atras + 3 menores na frente (foto e planta da ficha)
def pillow(name, w, th, h, base_center, tilt_deg, yaw_deg=0.0):
    tilt = math.radians(tilt_deg); yaw = math.radians(yaw_deg)
    R = Matrix.Rotation(yaw, 4, 'Z') @ Matrix.Rotation(-tilt, 4, 'X')
    def pd(p):
        xn = 2 * p.x / w; zn = 2 * p.z / h
        puff = max(0.0, (1 - xn * xn) * (1 - zn * zn))
        y = p.y * (0.25 + 0.75 * puff ** 0.6)
        zz = p.z + 0.010 * (xn * xn) * (1 if p.z > 0 else -1) * abs(zn) ** 3
        return Matrix.Translation(base_center) @ R @ Vector((p.x, y, zz + h / 2))
    rounded_box(name, (w, th, h), 0.012, 18, FABRIC, pd, grain='X')
    def fd(p):
        return Matrix.Translation(base_center) @ R @ Vector((p.x, p.y, p.z + h / 2))
    rounded_box(name + '_aba', (w + 0.014, 0.005, h + 0.014), 0.002, 6, FABRIC, fd, grain='X')

pillow('Almofada_encosto_tras_E', 0.640, 0.200, 0.470, Vector((-0.415, Y(0.845), SEAT_TOP + 0.010)), 14)
pillow('Almofada_encosto_tras_D', 0.640, 0.200, 0.470, Vector((0.415, Y(0.845), SEAT_TOP + 0.010)), 14)
pillow('Almofada_frente_E', 0.500, 0.170, 0.420, Vector((-0.560, Y(0.700), SEAT_TOP + 0.020)), 17, 6)
pillow('Almofada_frente_C', 0.500, 0.170, 0.420, Vector((0.000, Y(0.705), SEAT_TOP + 0.020)), 17, 0)
pillow('Almofada_frente_D', 0.500, 0.170, 0.420, Vector((0.560, Y(0.700), SEAT_TOP + 0.020)), 17, -6)

# pes embutidos (madeira ebanizada), escondidos pela saia
for sx in (-1, 1):
    for yf in (0.07, 0.93):
        cylinder(f'Pe_{"E" if sx < 0 else "D"}_{"frente" if yf < 0.5 else "tras"}', (sx * (W / 2 - 0.07), Y(yf), 0.0), (sx * (W / 2 - 0.07), Y(yf), 0.018), 0.022, FEET, segs=18)

# ---------------- 2. ajustes ----------------
# almofadas soltas mais baixas (topo ~910 mm, como na foto)
def scale_z_from_bottom(prefix, k):
    for ob in [o for o in coll.objects if o.type == 'MESH' and o.name.startswith(prefix)]:
        zmin = min(v.co.z for v in ob.data.vertices)
        for v in ob.data.vertices:
            v.co.z = zmin + (v.co.z - zmin) * k
        ob.data.update()
for nm in ('Almofada_encosto_tras_E', 'Almofada_encosto_tras_D'):
    scale_z_from_bottom(nm, 0.83)
for nm in ('Almofada_frente_E', 'Almofada_frente_C', 'Almofada_frente_D'):
    scale_z_from_bottom(nm, 0.88)

# medidas externas da ficha: 2000 x 1000
mins, maxs = bounds(coll)
sx = 2.000 / (maxs.x - mins.x); sy = 1.000 / (maxs.y - mins.y)
cx = (mins.x + maxs.x) / 2; cy = (mins.y + maxs.y) / 2
for ob in coll.objects:
    if ob.type != 'MESH': continue
    for v in ob.data.vertices:
        v.co.x = (v.co.x - cx) * sx
        v.co.y = (v.co.y - cy) * sy
    ob.data.update()

# tecido: trama fina de algodao/linho no lugar da textura com aspecto escovado
rng = np.random.default_rng(23)
size = 1024
u = np.linspace(0, 1, size, endpoint=False)
warp = (np.sin(u * 300 * 2 * math.pi) * 0.5 + 0.5)
weave = 0.5 * warp[None, :] + 0.5 * warp[:, None]
check = ((np.floor(u * 300)[None, :] + np.floor(u * 300)[:, None]) % 2) * 0.15
slub = tile_noise(size, size, 300, 18, rng)
mott = fractal(size, size, 8, 8, 4, rng)
t = 0.45 * weave + check + 0.20 * slub + 0.20 * mott
rgb = np.array((0.80, 0.80, 0.785))[None, None, :] * (0.88 + 0.20 * t[..., None])
img = bpy.data.images['Tecido_Algodao_Branco_base']
px = np.ones((size, size, 4), dtype=np.float32); px[..., :3] = np.clip(rgb, 0, 1)
img.pixels.foreach_set(px.ravel()); img.update(); img.pack()
nrm = normal_from_height(0.7 * weave + 0.3 * slub, 2.0)
nimg = bpy.data.images['Tecido_Algodao_Branco_normal']
nimg.scale(512, 512)
px = np.ones((512, 512, 4), dtype=np.float32); px[..., :3] = np.clip(nrm[::2, ::2], 0, 1)
nimg.pixels.foreach_set(px.ravel()); nimg.update(); nimg.pack()
for ob in coll.objects:
    if ob.type == 'MESH' and ob.active_material and ob.active_material.name.startswith('Tecido'):
        for d in ob.data.uv_layers.active.data:
            d.uv = (d.uv[0] * 1.6, d.uv[1] * 1.6)

mins, maxs = bounds(coll)
print('Sofa (mm):', round((maxs.x - mins.x) * 1000, 1), round((maxs.y - mins.y) * 1000, 1), round((maxs.z - mins.z) * 1000, 1))
