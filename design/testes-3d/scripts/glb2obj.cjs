// Converte um .glb (glTF binario, metros, Y para cima) em .obj + .mtl + texturas PNG, em milimetros.
// Uso: node glb2obj.cjs entrada.glb pasta_saida nome_base
const fs = require('fs');
const path = require('path');

const [, , input, outDir, base] = process.argv;
const buf = fs.readFileSync(input);
if (buf.toString('utf8', 0, 4) !== 'glTF') throw new Error('nao e GLB');
let off = 12, json, bin;
while (off < buf.length) {
  const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
  const chunk = buf.subarray(off + 8, off + 8 + len);
  if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8'));
  else if (type === 0x004e4942) bin = chunk;
  off += 8 + len;
}
fs.mkdirSync(outDir, { recursive: true });
const MM = 1000;

const COMP = { 5120: [1, 'getInt8'], 5121: [1, 'getUint8'], 5122: [2, 'getInt16'], 5123: [2, 'getUint16'], 5125: [4, 'getUint32'], 5126: [4, 'getFloat32'] };
const NCOMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
function readAccessor(i) {
  const a = json.accessors[i], bv = json.bufferViews[a.bufferView];
  const [size, fn] = COMP[a.componentType], n = NCOMP[a.type];
  const stride = bv.byteStride || size * n;
  const dv = new DataView(bin.buffer, bin.byteOffset + (bv.byteOffset || 0) + (a.byteOffset || 0));
  const out = [];
  for (let k = 0; k < a.count; k++) {
    const row = [];
    for (let c = 0; c < n; c++) row.push(dv[fn](k * stride + c * size, true));
    out.push(row);
  }
  return out;
}

// matrizes 4x4 coluna-major (como o glTF)
const ident = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a, b) {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return r;
}
function trs(node) {
  if (node.matrix) return node.matrix.slice();
  const [tx, ty, tz] = node.translation || [0, 0, 0];
  const [x, y, z, w] = node.rotation || [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale || [1, 1, 1];
  const r = [
    1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0,
    2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0,
    2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0,
    0, 0, 0, 1,
  ];
  const s = [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
  const t = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
  return mul(t, mul(r, s));
}
const apply = (m, p, w) => [0, 1, 2].map((i) => m[i] * p[0] + m[4 + i] * p[1] + m[8 + i] * p[2] + (w ? m[12 + i] : 0));

// texturas
const imageFiles = {};
(json.images || []).forEach((img, i) => {
  const bv = json.bufferViews[img.bufferView];
  const ext = img.mimeType === 'image/jpeg' ? 'jpg' : 'png';
  const name = `${(img.name || `textura_${i}`).replace(/[^\w.-]+/g, '_')}.${ext}`;
  fs.writeFileSync(path.join(outDir, name), bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength));
  imageFiles[i] = name;
});
const texImage = (info) => (info && json.textures[info.index] ? imageFiles[json.textures[info.index].source] : null);

// .mtl
let mtl = `# Materiais de ${base}\n`;
(json.materials || []).forEach((m, i) => {
  const pbr = m.pbrMetallicRoughness || {};
  const c = pbr.baseColorFactor || [1, 1, 1, 1];
  mtl += `\nnewmtl ${m.name || `mat_${i}`}\nKa 0 0 0\nKd ${c[0].toFixed(4)} ${c[1].toFixed(4)} ${c[2].toFixed(4)}\nKs 0.05 0.05 0.05\nNs 20\nd 1\nillum 2\n`;
  const kd = texImage(pbr.baseColorTexture); if (kd) mtl += `map_Kd ${kd}\n`;
  const nm = texImage(m.normalTexture); if (nm) mtl += `norm ${nm}\nmap_bump ${nm}\n`;
});
fs.writeFileSync(path.join(outDir, `${base}.mtl`), mtl);

// .obj
const lines = [`# ${base} - convertido de glTF; unidade: milimetros; eixo Y para cima`, `mtllib ${base}.mtl`];
let vBase = 1, vtBase = 1, vnBase = 1;
const bb = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
function walk(ni, parent) {
  const node = json.nodes[ni];
  const m = mul(parent, trs(node));
  if (node.mesh !== undefined) {
    const mesh = json.meshes[node.mesh];
    lines.push(`o ${(node.name || mesh.name || `obj_${ni}`).replace(/\s+/g, '_')}`);
    for (const prim of mesh.primitives) {
      const P = readAccessor(prim.attributes.POSITION).map((p) => apply(m, p, true).map((v) => v * MM));
      const N = prim.attributes.NORMAL !== undefined ? readAccessor(prim.attributes.NORMAL).map((n) => apply(m, n, false)) : null;
      const T = prim.attributes.TEXCOORD_0 !== undefined ? readAccessor(prim.attributes.TEXCOORD_0) : null;
      const I = prim.indices !== undefined ? readAccessor(prim.indices).map((r) => r[0]) : P.map((_, k) => k);
      for (const p of P) {
        lines.push(`v ${p[0].toFixed(3)} ${p[1].toFixed(3)} ${p[2].toFixed(3)}`);
        for (let k = 0; k < 3; k++) { bb.min[k] = Math.min(bb.min[k], p[k]); bb.max[k] = Math.max(bb.max[k], p[k]); }
      }
      if (T) for (const t of T) lines.push(`vt ${t[0].toFixed(5)} ${(1 - t[1]).toFixed(5)}`);
      if (N) for (const n of N) { const l = Math.hypot(...n) || 1; lines.push(`vn ${(n[0] / l).toFixed(4)} ${(n[1] / l).toFixed(4)} ${(n[2] / l).toFixed(4)}`); }
      const mat = prim.material !== undefined ? json.materials[prim.material].name : null;
      if (mat) lines.push(`usemtl ${mat}`);
      for (let k = 0; k < I.length; k += 3) {
        const f = [I[k], I[k + 1], I[k + 2]].map((idx) => `${vBase + idx}/${T ? vtBase + idx : ''}/${N ? vnBase + idx : ''}`);
        lines.push(`f ${f.join(' ')}`);
      }
      vBase += P.length; if (T) vtBase += T.length; if (N) vnBase += N.length;
    }
  }
  for (const c of node.children || []) walk(c, m);
}
for (const ni of json.scenes[json.scene || 0].nodes) walk(ni, ident());
fs.writeFileSync(path.join(outDir, `${base}.obj`), lines.join('\n') + '\n');
const dim = [0, 1, 2].map((k) => (bb.max[k] - bb.min[k]).toFixed(1));
console.log(`${base}: largura(X) ${dim[0]} mm, altura(Y) ${dim[1]} mm, profundidade(Z) ${dim[2]} mm, ${vBase - 1} vertices, texturas: ${Object.values(imageFiles).join(', ')}`);
