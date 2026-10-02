"""Poltrona Maria (design Zia Costa) - ficha: L 715 x P 790 x A 750 mm, braco 520, assento 440.

Passos na ordem em que rodaram no 3D Jutsu (revisoes 4 e 5 do projeto):
1. modelagem com ajuste final as medidas da ficha; 2. mapas normais em 512 px (GLB abaixo de 5 MB).
Para rodar num Blender local: blender -b -P maria.py (nao testado fora do 3D Jutsu).
"""
import os, math
import bpy
import numpy as np
from mathutils import Vector, Matrix

exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib_blender.py'), encoding='utf-8').read())

# ---------------- 1. modelagem ----------------
coll, root = setup('Poltrona_Maria', {
    'produto': 'Poltrona Maria - design Zia Costa',
    'medidas_ficha_mm': 'L 715 x P 790 x A 750; braco 520; assento 440',
    'unidade': 'metro (glTF); 1 unidade = 1000 mm',
})
RNG = np.random.default_rng(11)
w_rgb, w_n = wood_maps(1024, (0.56, 0.40, 0.22), (0.44, 0.29, 0.14), RNG, rings_n=14)
WOOD = make_material('Madeira_Macica_Natural', soften(w_rgb, 0.7), w_n, 1024, 0.42, 0.3)
v_rgb, v_n = wood_maps(1024, (0.56, 0.40, 0.22), (0.34, 0.22, 0.10), RNG, rings_n=9, warp_amt=5.0)
VENEER = make_material('Lamina_Natural_Concha', soften(v_rgb, 0.85), v_n, 1024, 0.40, 0.25)
f_rgb, f_n = fabric_maps(1024, (0.30, 0.29, 0.28), RNG, threads=220, fleck=0.12)
FABRIC = make_material('Tecido_Cinza', f_rgb, f_n, 1024, 0.85, 0.7, sheen=0.3)
GLIDE = flat_material('Sapata_Preta', (0.02, 0.02, 0.02), 0.6)

D = 0.79; W = 0.715
def Y(yf): return yf - D / 2
T = 0.044                     # espessura das laterais (eixo X)
xs = W / 2 - T / 2

# laterais em madeira macica: perna dianteira com curva, braco reto, montante traseiro em "<"
front = line((0.068, 0.0), (0.040, 0.43), 12)[:-1] + bezier((0.040, 0.43), (0.034, 0.497), (0.095, 0.497), 10)
fw = [0.036 + 0.012 * min(1, p[1] / 0.43) if p[1] < 0.43 else 0.046 for p in front]
ARM_Y0, ARM_Y1 = 0.090, 0.600
rear = line((0.776, 0.0), (0.600, 0.42), 14)[:-1] + bezier((0.600, 0.42), (0.570, 0.50), (0.600, 0.56), 8)[:-1] + line((0.600, 0.56), (0.660, 0.715), 10)
rw = [0.034 + 0.020 * min(1, p[1] / 0.47) if p[1] < 0.47 else 0.054 - 0.016 * min(1, (p[1] - 0.47) / 0.25) for p in rear]
for side, s in (('E', -1), ('D', 1)):
    x0, x1 = s * xs - T / 2, s * xs + T / 2
    prism_yz(f'Perna_dianteira_{side}', ribbon([(Y(y), z) for y, z in front], fw, floor=0.0), x0, x1, WOOD, grain='Z', bevel=0.009, bevel_segs=4, sharp_deg=40)
    prism_yz(f'Braco_{side}', [(Y(ARM_Y0), 0.474), (Y(ARM_Y1), 0.474), (Y(ARM_Y1), 0.520), (Y(ARM_Y0), 0.520)], x0, x1, WOOD, grain='Y', bevel=0.009, bevel_segs=4, sharp_deg=40)
    prism_yz(f'Montante_traseiro_{side}', ribbon([(Y(y), z) for y, z in rear], rw, floor=0.0), x0, x1, WOOD, grain='Z', bevel=0.009, bevel_segs=4, sharp_deg=40)
    cylinder(f'Sapata_dianteira_{side}', (s * xs, Y(0.068), 0.0), (s * xs, Y(0.068), 0.003), 0.012, GLIDE, segs=16)
    cylinder(f'Sapata_traseira_{side}', (s * xs, Y(0.776), 0.0), (s * xs, Y(0.776), 0.003), 0.012, GLIDE, segs=16)

# concha do assento: compensado moldado em U, com lamina, caindo 6 graus para tras
IW = W - 2 * T
SW = IW - 0.004
tilt = math.radians(6)
def u_profile(width, depth_side, r, th, n=10):
    hw = width / 2
    outer, inner = [(-hw, depth_side)], []
    for i in range(n + 1):
        a = math.pi + (math.pi / 2) * i / n
        outer.append((-hw + r + r * math.cos(a), r + r * math.sin(a)))
    for i in range(n + 1):
        a = 1.5 * math.pi + (math.pi / 2) * i / n
        outer.append((hw - r + r * math.cos(a), r + r * math.sin(a)))
    outer.append((hw, depth_side))
    ri = r - th
    inner.append((hw - th, depth_side))
    for i in range(n + 1):
        a = 2 * math.pi - (math.pi / 2) * i / n
        inner.append((hw - r + ri * math.cos(a), r + ri * math.sin(a)))
    for i in range(n + 1):
        a = 1.5 * math.pi - (math.pi / 2) * i / n
        inner.append((-hw + r + ri * math.cos(a), r + ri * math.sin(a)))
    inner.append((-hw + th, depth_side))
    return outer + inner
pivot = Vector((0, Y(0.035), 0.0))
TILT = Matrix.Translation(pivot) @ Matrix.Rotation(-tilt, 4, 'X') @ Matrix.Translation(-pivot)
shell = prism_xz('Concha_assento', u_profile(SW, 0.105, 0.045, 0.012), Y(0.035), Y(0.615), VENEER, grain='X', bevel=0.003, sharp_deg=60)
shell.data.transform(Matrix.Translation((0, 0, 0.285)) @ TILT)

CX, CY, CZ = SW - 0.030, 0.585, 0.115
def seat_def(p):
    t = (p.y + CY / 2) / CY
    z = p.z
    if z > 0:
        z += 0.010 * math.sin(math.pi * t) * max(0.0, 1 - (2 * p.x / CX) ** 2) ** 0.5
    return TILT @ Vector((p.x, Y(0.030 + CY / 2) + p.y, 0.285 + 0.012 + CZ / 2 + z))
rounded_box('Almofada_assento', (CX, CY, CZ), 0.038, 20, FABRIC, seat_def)

# concha do encosto (curva em planta, reclinada 16 graus) e almofada com 2 botoes
recl = math.radians(16)
BW = IW - 0.006; BH = 0.33; BOW = 0.030
bot = Vector((0, Y(0.600), 0.400))
dvec = Vector((0, math.sin(recl), math.cos(recl))); nvec = Vector((0, math.cos(recl), -math.sin(recl)))
R = Matrix(((1, 0, 0), (0, nvec.y, dvec.y), (0, nvec.z, dvec.z))).to_4x4()
arc_f, arc_b = [], []
N = 32
for i in range(N + 1):
    t = i / N; x = -BW / 2 + BW * t
    bow = BOW * (1 - (2 * t - 1) ** 2)
    arc_f.append((x, bow)); arc_b.append((x, bow + 0.012))
bshell = prism_xy('Concha_encosto', arc_f + arc_b[::-1], 0.0, BH, VENEER, grain='X', bevel=0.003, sharp_deg=60)
bshell.data.transform(Matrix.Translation(bot + nvec * 0.04) @ R)

KX, KT, KH = BW - 0.030, 0.095, 0.320
base_off = 0.04 - KT / 2 + 0.002
cush_c = bot + nvec * base_off + dvec * (KH / 2 + 0.030)
def back_def(p):
    t = (p.z + KH / 2) / KH
    xn = max(-1.0, min(1.0, 2 * p.x / BW))
    ly = p.y + BOW * (1 - xn * xn) - 0.010 * (1 - xn * xn) * math.sin(math.pi * t) * (1 if p.y < 0 else 0)
    return Matrix.Translation(cush_c) @ R @ Vector((p.x, ly, p.z))
rounded_box('Almofada_encosto', (KX, KT, KH), 0.035, 20, FABRIC, back_def, grain='Z')
for sx in (-1, 1):
    xn = 2 * sx * 0.085 / BW
    ly = -KT / 2 + BOW * (1 - xn * xn) - 0.010 * (1 - xn * xn) * math.sin(math.pi * (0.5 + 0.040 / KH))
    c = Matrix.Translation(cush_c) @ R @ Vector((sx * 0.085, ly, 0.040))
    cylinder(f'Botao_{"E" if sx < 0 else "D"}', c + nvec * 0.004, c - nvec * 0.005, 0.011, FABRIC, segs=18, r1=0.008)

# ajuste final as medidas da ficha: profundidade 790 (escala em Y) e altura 750 (sobe o encosto)
mins, maxs = bounds(coll)
sy = 0.790 / (maxs.y - mins.y); cy = (mins.y + maxs.y) / 2
for ob in coll.objects:
    if ob.type != 'MESH': continue
    for v in ob.data.vertices: v.co.y = cy + (v.co.y - cy) * sy
    ob.data.update()
mins, maxs = bounds(coll)
dz = 0.750 - (maxs.z - mins.z)
for ob in coll.objects:
    if ob.type == 'MESH' and (ob.name.startswith('Almofada_encosto') or ob.name.startswith('Botao') or ob.name.startswith('Concha_encosto')):
        for v in ob.data.vertices: v.co.z += dz
        ob.data.update()
mins, maxs = bounds(coll)
oy = -(mins.y + maxs.y) / 2
for ob in coll.objects:
    if ob.type != 'MESH': continue
    for v in ob.data.vertices: v.co.y += oy
    ob.data.update()

# ---------------- 2. mapas normais em 512 px ----------------
for img in bpy.data.images:
    if img.name.endswith('_normal'):
        img.scale(512, 512)
        img.pack()

mins, maxs = bounds(coll)
print('Maria (mm):', round((maxs.x - mins.x) * 1000, 1), round((maxs.y - mins.y) * 1000, 1), round((maxs.z - mins.z) * 1000, 1))
