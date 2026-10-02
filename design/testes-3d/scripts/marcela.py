"""Cadeira Marcela sem braco (Estudio Franccino) - ficha: L 550 x P 610 x A 850 mm, assento 460 mm.

Passos na ordem em que rodaram no 3D Jutsu (revisoes 2, 3 e 4 do projeto):
1. modelagem; 2. ajuste final do encosto as medidas da ficha; 3. cor do couro.
Para rodar num Blender local: blender -b -P marcela.py (nao testado fora do 3D Jutsu).
"""
import os, math
import bpy
import numpy as np
from mathutils import Vector

exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib_blender.py'), encoding='utf-8').read())

# ---------------- 1. modelagem ----------------
coll, root = setup('Cadeira_Marcela_sem_braco', {
    'produto': 'Cadeira Marcela sem braco - Estudio Franccino',
    'medidas_ficha_mm': 'L 550 x P 610 x A 850; assento 460',
    'unidade': 'metro (glTF); 1 unidade = 1000 mm',
})
RNG = np.random.default_rng(7)
wood_rgb, wood_n = wood_maps(1024, (0.36, 0.17, 0.075), (0.19, 0.08, 0.032), RNG)
WOOD = make_material('Madeira_Tauari', wood_rgb, wood_n, 1024, 0.45, 0.35)
lea_rgb, lea_n = leather_maps(1024, (0.46, 0.27, 0.13), RNG)
LEATHER = make_material('Couro_Caramelo', lea_rgb, lea_n, 1024, 0.55, 0.5)
GLIDE = flat_material('Sapata_Preta', (0.02, 0.02, 0.02), 0.6)

D = 0.61
def Y(yf): return yf - D / 2      # yf = distancia a partir da frente
HWF = 0.265; LEG = 0.034
xl = HWF - LEG / 2

# pernas dianteiras, levemente conicas
for side, s in (('E', -1), ('D', 1)):
    prof = [(Y(0.040 - 0.013), 0.0), (Y(0.040 + 0.013), 0.0), (Y(0.050 + 0.017), 0.425), (Y(0.050 - 0.017), 0.425)]
    prism_yz(f'Perna_dianteira_{side}', prof, s * xl - 0.017, s * xl + 0.017, WOOD,
             hw=lambda z: 0.013 + 0.004 * z / 0.425, xc=s * xl, grain='Z', bevel=0.004)

# pernas traseiras em curva, subindo ate a travessa do encosto
rear_c = bezier((0.530, 0.0), (0.400, 0.470), (0.570, 0.640), 28)
rear_w = [0.026 + 0.010 * min(1, i / 16) - 0.004 * max(0, (i - 16) / 12) for i in range(len(rear_c))]
for side, s in (('E', -1), ('D', 1)):
    prof = ribbon([(Y(y), z) for y, z in rear_c], rear_w, floor=0.0)
    prism_yz(f'Perna_traseira_{side}', prof, s * xl - 0.017, s * xl + 0.017, WOOD,
             hw=lambda z: 0.013 + 0.004 * min(1, z / 0.42), xc=s * xl, grain='Z', bevel=0.004)

# travessas laterais do assento, arqueadas
for side, s in (('E', -1), ('D', 1)):
    top, bot = [], []
    N = 24
    for i in range(N + 1):
        t = i / N; yf = 0.06 + (0.455 - 0.06) * t
        top.append((Y(yf), 0.425 - 0.010 * math.sin(math.pi * t)))
        bot.append((Y(yf), 0.366 + 0.024 * math.sin(math.pi * t)))
    x = s * (HWF - 0.013)
    prism_yz(f'Travessa_lateral_assento_{side}', top + bot[::-1], x - 0.011, x + 0.011, WOOD, grain='Y', bevel=0.003)

prism_yz('Travessa_frontal_assento', [(Y(0.042), 0.372), (Y(0.064), 0.372), (Y(0.064), 0.425), (Y(0.042), 0.425)],
         -(HWF - 0.03), HWF - 0.03, WOOD, grain='X', bevel=0.003)
prism_yz('Travessa_traseira_assento', [(Y(0.445), 0.380), (Y(0.467), 0.380), (Y(0.467), 0.425), (Y(0.445), 0.425)],
         -(HWF - 0.03), HWF - 0.03, WOOD, grain='X', bevel=0.003)

# travessa curva do encosto (une o topo das pernas traseiras)
arc_front, arc_back = [], []
N = 30
for i in range(N + 1):
    t = i / N; x = -(HWF - 0.005) + 2 * (HWF - 0.005) * t
    bow = 0.016 * (1 - (2 * t - 1) ** 2)
    arc_front.append((x, Y(0.548 + bow))); arc_back.append((x, Y(0.570 + bow)))
prism_xy('Travessa_encosto', arc_front + arc_back[::-1], 0.578, 0.628, WOOD, grain='X', bevel=0.004)

# travessas baixas: as fotos laterais mostram as duas em alturas diferentes (ficha mostra uma so)
for side, s, z in (('E', -1, 0.215), ('D', 1, 0.300)):
    yf_front = 0.040 + 0.010 * z / 0.425
    yf_rear = interp_y(rear_c, z)
    cylinder(f'Travessa_baixa_{side}', (s * xl, Y(yf_front), z), (s * xl, Y(yf_rear), z), 0.0095, WOOD)

for side, s in (('E', -1), ('D', 1)):
    cylinder(f'Sapata_dianteira_{side}', (s * xl, Y(0.040), 0.0), (s * xl, Y(0.040), 0.004), 0.011, GLIDE, segs=16)
    cylinder(f'Sapata_traseira_{side}', (s * xl, Y(0.530), 0.0), (s * xl, Y(0.530), 0.004), 0.011, GLIDE, segs=16)

# assento estofado
SX, SY, SZ = 0.515, 0.445, 0.058
def seat_def(p):
    t = (p.y + SY / 2) / SY
    x = p.x * (1 - 0.06 * t)
    z = p.z
    if z > 0:
        z -= 0.008 * math.sin(math.pi * min(1, t * 1.1)) * (1 - (2 * p.x / SX) ** 2)
    return Vector((x, Y(0.003 + SY / 2) + p.y, 0.402 + SZ / 2 + z))
rounded_box('Assento_estofado', (SX, SY, SZ), 0.022, 18, LEATHER, seat_def)

# encosto estofado: reclinado, abre para cima, cantos superiores levantados (como nas fotos)
BX, BT, BL = 0.450, 0.052, 0.402
p_bot = Vector((0, Y(0.468), 0.470)); p_top = Vector((0, Y(0.577), 0.838))
dvec = (p_top - p_bot).normalized(); nvec = Vector((0, dvec.z, -dvec.y))
center = (p_bot + p_top) / 2
def back_def(p):
    t = (p.z + BL / 2) / BL
    x = p.x * (1 + 0.245 * t * t)
    xn = x / 0.275
    lz = p.z + 0.014 * t * t * xn * xn
    ly = p.y + 0.020 * xn * xn - 0.006 * math.sin(math.pi * t)
    return center + Vector((x, 0, 0)) + nvec * ly + dvec * lz
rounded_box('Encosto_estofado', (BX, BT, BL), 0.020, 18, LEATHER, back_def, grain='Z')

# ---------------- 2. ajuste do encosto as medidas totais da ficha (A 850, P 610) ----------------
mins, maxs = bounds(coll)
dz = 0.850 - (maxs.z - mins.z)
dy = 0.610 - (maxs.y - mins.y)
back = bpy.data.objects['Encosto_estofado']
for v in back.data.vertices:
    v.co.z += dz
    v.co.y += dy
back.data.update()

# ---------------- 3. couro menos saturado (mais proximo das fotos) ----------------
rgb, _ = leather_maps(1024, (0.40, 0.265, 0.15), np.random.default_rng(7))
img = bpy.data.images['Couro_Caramelo_base']
px = np.ones((1024, 1024, 4), dtype=np.float32); px[..., :3] = np.clip(rgb, 0, 1)
img.pixels.foreach_set(px.ravel()); img.update(); img.pack()

mins, maxs = bounds(coll)
print('Marcela (mm):', round((maxs.x - mins.x) * 1000, 1), round((maxs.y - mins.y) * 1000, 1), round((maxs.z - mins.z) * 1000, 1))
