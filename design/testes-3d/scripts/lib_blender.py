"""Funcoes comuns dos testes 3D (Blender 5.2, bpy + numpy).

No teste, este codigo rodou no Blender do 3D Jutsu (Higgsfield) guardado como texto `franccino_lib`
dentro do .blend; os scripts de cada produto fazem `exec` dele. Unidades em metros, frente da peca em -Y,
piso em z = 0. Texturas sao geradas aqui (numpy) e empacotadas no .blend, por isso vao embutidas no .glb.
"""
import bpy, bmesh, math
import numpy as np
from mathutils import Vector, Matrix


# ---------------- texturas procedurais (imagens 1024 px, repetiveis) ----------------

def tile_noise(h, w, gh, gw, rng):
    g = rng.random((gh, gw))
    ys = np.arange(h) * gh / h; xs = np.arange(w) * gw / w
    y0 = np.floor(ys).astype(int); x0 = np.floor(xs).astype(int)
    fy = ys - y0; fx = xs - x0
    fy = fy * fy * (3 - 2 * fy); fx = fx * fx * (3 - 2 * fx)
    y1 = (y0 + 1) % gh; x1 = (x0 + 1) % gw
    a = g[y0][:, x0]; b = g[y0][:, x1]; c = g[y1][:, x0]; d = g[y1][:, x1]
    top = a + (b - a) * fx[None, :]; bot = c + (d - c) * fx[None, :]
    return top + (bot - top) * fy[:, None]


def fractal(h, w, gh, gw, octaves, rng, gain=0.5):
    out = np.zeros((h, w)); amp = 1.0; tot = 0
    for o in range(octaves):
        out += amp * tile_noise(h, w, gh * 2 ** o, gw * 2 ** o, rng); tot += amp; amp *= gain
    return out / tot


def make_image(name, rgb, size):
    img = bpy.data.images.new(name, size, size, alpha=False)
    px = np.ones((size, size, 4), dtype=np.float32)
    px[..., :3] = np.clip(rgb, 0, 1)
    img.pixels.foreach_set(px.ravel())
    img.file_format = 'PNG'
    img.pack()
    return img


def normal_from_height(hmap, strength):
    gy, gx = np.gradient(hmap)
    nx = -gx * strength; ny = -gy * strength; nz = np.ones_like(hmap)
    l = np.sqrt(nx * nx + ny * ny + nz * nz)
    return np.stack([nx / l * 0.5 + 0.5, ny / l * 0.5 + 0.5, nz / l * 0.5 + 0.5], axis=-1)


def wood_maps(size, base_light, base_dark, rng, rings_n=22, warp_amt=2.2):
    """Madeira: veio ao longo do eixo U da imagem."""
    warp = fractal(size, size, 2, 1, 4, rng)
    v = np.linspace(0, 1, size, endpoint=False)[:, None]
    rings = np.sin((v * rings_n + warp * warp_amt) * 2 * math.pi) * 0.5 + 0.5
    rings = rings ** 1.6
    streak = fractal(size, size, 96, 3, 3, rng)
    pores = tile_noise(size, size, 512, 24, rng)
    t = np.clip(0.55 * rings + 0.35 * streak + 0.10 * pores, 0, 1)
    light = np.array(base_light); dark = np.array(base_dark)
    rgb = light[None, None, :] * (1 - t[..., None]) + dark[None, None, :] * t[..., None]
    rgb *= (0.92 + 0.08 * fractal(size, size, 3, 3, 3, rng))[..., None]
    h = 0.6 * pores + 0.4 * rings
    return rgb, normal_from_height(h, 2.5)


def leather_maps(size, base, rng):
    mott = fractal(size, size, 6, 6, 5, rng)
    grain = tile_noise(size, size, 256, 256, rng)
    crease = np.abs(fractal(size, size, 24, 24, 3, rng) - 0.5) * 2
    t = 0.65 * mott + 0.2 * grain + 0.15 * crease
    rgb = np.array(base)[None, None, :] * (0.82 + 0.36 * t[..., None])
    h = 0.7 * grain + 0.3 * (1 - crease)
    return rgb, normal_from_height(h, 1.6)


def fabric_maps(size, base, rng, threads=180, boucle=0.0, fleck=0.0):
    u = np.linspace(0, 1, size, endpoint=False)
    w1 = (np.sin(u * threads * 2 * math.pi) * 0.5 + 0.5)
    weave = w1[None, :] * 0.5 + w1[:, None] * 0.5
    slub = fractal(size, size, 64, 4, 3, rng)
    fuzz = tile_noise(size, size, 384, 384, rng)
    t = 0.45 * weave + 0.30 * slub + 0.25 * fuzz
    if boucle:
        loops = tile_noise(size, size, 160, 160, rng)
        t = (1 - boucle) * t + boucle * loops
    rgb = np.array(base)[None, None, :] * (0.80 + 0.40 * t[..., None])
    if fleck:
        f = (tile_noise(size, size, 300, 40, rng) > 0.86).astype(float)
        rgb = rgb * (1 - fleck * f[..., None])
    return rgb, normal_from_height(t, 3.0)


def make_material(name, rgb, nrm, size, roughness, nstrength=0.6, sheen=0.0):
    """Principled BSDF com cor + mapa normal em imagem (exporta para glTF)."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get('Principled BSDF')
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = make_image(name + '_base', rgb, size)
    nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    ntex = nt.nodes.new('ShaderNodeTexImage'); ntex.image = make_image(name + '_normal', nrm, size)
    ntex.image.colorspace_settings.name = 'Non-Color'
    nmap = nt.nodes.new('ShaderNodeNormalMap'); nmap.inputs['Strength'].default_value = nstrength
    nt.links.new(ntex.outputs['Color'], nmap.inputs['Color'])
    nt.links.new(nmap.outputs['Normal'], bsdf.inputs['Normal'])
    bsdf.inputs['Roughness'].default_value = roughness
    if sheen and 'Sheen Weight' in bsdf.inputs:
        bsdf.inputs['Sheen Weight'].default_value = sheen
    return mat


def flat_material(name, rgb, roughness):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = roughness
    return m


# ---------------- geometria ----------------

CTX = {}


def finish_mesh(name, bm, mat, tile=0.5, grain='Z', bevel=0.0, bevel_segs=3, sharp_deg=35):
    """Chanfra arestas vivas, gera UV por projecao em caixa (veio no eixo `grain`) e cria o objeto."""
    if bevel > 0:
        edges = [e for e in bm.edges if e.is_manifold and e.calc_face_angle(0) > math.radians(sharp_deg)]
        bmesh.ops.bevel(bm, geom=edges, offset=bevel, segments=bevel_segs, profile=0.5, affect='EDGES', clamp_overlap=True)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    uv = bm.loops.layers.uv.new('UVMap')
    g = {'X': 0, 'Y': 1, 'Z': 2}[grain]
    for f in bm.faces:
        n = f.normal; dom = max(range(3), key=lambda i: abs(n[i]))
        others = [i for i in range(3) if i != dom]
        if g in others:
            ua = g; va = [i for i in others if i != g][0]
        else:
            ua, va = others
        for l in f.loops:
            co = l.vert.co
            l[uv].uv = (co[ua] / tile, co[va] / tile)
    for f in bm.faces:
        f.smooth = True
    for e in bm.edges:
        e.smooth = not (e.is_manifold and e.calc_face_angle(0) > math.radians(sharp_deg))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    CTX['coll'].objects.link(ob); ob.parent = CTX['root']
    me.materials.append(mat)
    return ob


def prism_yz(name, profile, x0, x1, mat, hw=None, xc=None, **kw):
    """Perfil (y, z) extrudado em X; hw(z) opcional afina a peca em X em torno de xc."""
    bm = bmesh.new(); n = len(profile)

    def X(x, z):
        if hw is None:
            return x
        s = hw(z) / ((x1 - x0) / 2)
        return xc + (x - xc) * s
    a = [bm.verts.new((X(x0, z), y, z)) for y, z in profile]
    b = [bm.verts.new((X(x1, z), y, z)) for y, z in profile]
    bm.faces.new(a[::-1]); bm.faces.new(b)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((a[i], a[j], b[j], b[i]))
    return finish_mesh(name, bm, mat, **kw)


def prism_xz(name, profile, y0, y1, mat, **kw):
    bm = bmesh.new(); n = len(profile)
    a = [bm.verts.new((x, y0, z)) for x, z in profile]
    b = [bm.verts.new((x, y1, z)) for x, z in profile]
    bm.faces.new(a[::-1]); bm.faces.new(b)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((a[i], a[j], b[j], b[i]))
    return finish_mesh(name, bm, mat, **kw)


def prism_xy(name, profile, z0, z1, mat, **kw):
    bm = bmesh.new(); n = len(profile)
    a = [bm.verts.new((x, y, z0)) for x, y in profile]
    b = [bm.verts.new((x, y, z1)) for x, y in profile]
    bm.faces.new(a[::-1]); bm.faces.new(b)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((a[i], a[j], b[j], b[i]))
    return finish_mesh(name, bm, mat, **kw)


def ribbon(center, widths, floor=None):
    """Contorno fechado a partir de uma linha central (y, z) e larguras."""
    left, right = [], []
    for i, (p, w) in enumerate(zip(center, widths)):
        p = Vector(p)
        q0 = Vector(center[max(i - 1, 0)]); q1 = Vector(center[min(i + 1, len(center) - 1)])
        t = (q1 - q0).normalized(); nrm = Vector((-t.y, t.x))
        left.append(p + nrm * w / 2); right.append(p - nrm * w / 2)
    pts = left + right[::-1]
    if floor is not None:
        pts = [Vector((q.x, max(q.y, floor))) for q in pts]
    return [tuple(q) for q in pts]


def bezier(p0, p1, p2, n):
    pts = []
    for i in range(n + 1):
        t = i / n
        pts.append(tuple((1 - t) ** 2 * Vector(p0) + 2 * t * (1 - t) * Vector(p1) + t * t * Vector(p2)))
    return pts


def line(p0, p1, n):
    return [tuple(Vector(p0).lerp(Vector(p1), i / n)) for i in range(n + 1)]


def interp_y(center, z):
    pts = sorted(center, key=lambda p: p[1])
    for a, b in zip(pts, pts[1:]):
        if a[1] <= z <= b[1]:
            t = (z - a[1]) / max(1e-9, b[1] - a[1])
            return a[0] + (b[0] - a[0]) * t
    return pts[-1][0]


def rounded_box(name, size, radius, cuts, mat, deform=None, tile=0.4, grain='X'):
    """Caixa subdividida com cantos arredondados (estofados); `deform(p)` molda cada vertice."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=2.0)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cuts, use_grid_fill=True)
    h = Vector(size) / 2
    inner = Vector((h.x - radius, h.y - radius, h.z - radius))
    for v in bm.verts:
        p = Vector((v.co.x * h.x, v.co.y * h.y, v.co.z * h.z))
        c = Vector((max(-inner.x, min(inner.x, p.x)), max(-inner.y, min(inner.y, p.y)), max(-inner.z, min(inner.z, p.z))))
        d = p - c
        if d.length > 1e-9:
            p = c + d.normalized() * radius
        v.co = deform(p) if deform else p
    return finish_mesh(name, bm, mat, tile=tile, grain=grain, sharp_deg=80)


def cylinder(name, p0, p1, r, mat, segs=20, tile=0.4, r1=None):
    bm = bmesh.new()
    p0 = Vector(p0); p1 = Vector(p1); d = p1 - p0
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=(r if r1 is None else r1), depth=d.length)
    rot = d.normalized().to_track_quat('Z', 'Y').to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation((p0 + p1) / 2) @ rot, verts=bm.verts)
    ax = 'XYZ'[max(range(3), key=lambda i: abs(d[i]))]
    return finish_mesh(name, bm, mat, tile=tile, grain=ax, sharp_deg=50)


def bounds(coll, names=None):
    mins = Vector((9, 9, 9)); maxs = Vector((-9, -9, -9))
    for ob in coll.objects:
        if ob.type != 'MESH':
            continue
        if names and not any(ob.name.startswith(n) for n in names):
            continue
        for v in ob.data.vertices:
            co = ob.matrix_world @ v.co
            for i in range(3):
                mins[i] = min(mins[i], co[i]); maxs[i] = max(maxs[i], co[i])
    return mins, maxs


def setup(name, props):
    """Limpa a cena e cria a colecao + vazio raiz do produto (com as medidas da ficha como propriedades)."""
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.length_unit = 'MILLIMETERS'
    for ob in list(bpy.data.objects): bpy.data.objects.remove(ob, do_unlink=True)
    for c in list(bpy.data.collections): bpy.data.collections.remove(c)
    for m in list(bpy.data.meshes): bpy.data.meshes.remove(m)
    for m in list(bpy.data.materials): bpy.data.materials.remove(m)
    for im in list(bpy.data.images): bpy.data.images.remove(im)
    coll = bpy.data.collections.new(name); scene.collection.children.link(coll)
    root = bpy.data.objects.new(name, None); coll.objects.link(root)
    for k, v in props.items():
        root[k] = v
    CTX['coll'] = coll; CTX['root'] = root
    return coll, root


def soften(rgb, k):
    """Reduz o contraste/saturacao de uma textura em torno da cor media."""
    m = rgb.reshape(-1, 3).mean(axis=0)
    return m + (rgb - m) * k
