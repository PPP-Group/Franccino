"""
Foto sem fundo (carrossel da home) a partir de uma foto de estúdio em fundo branco.

Uso (fora do servidor, numa máquina de trabalho):
    python3 -m venv .rb && .rb/bin/pip install "rembg[cpu]" pillow numpy scipy
    .rb/bin/python design/recortes/recortar.py foto.webp recorte.webp isnet-general-use

A rede (rembg, modelo isnet, licença MIT) separa a peça; a borda é refinada contra o fundo branco conhecido
(alpha pela cor e "descontaminação" do branco), sem halo nem a sombra do estúdio. Envio: design/recortes/LEIA-ME.md.
"""
import sys, numpy as np
from PIL import Image
from rembg import remove, new_session
from scipy import ndimage
src, dst, model = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGB')
sess = new_session(model)
mask = np.array(remove(im, session=sess, only_mask=True), dtype=np.float32) / 255.0
rgb = np.array(im, dtype=np.float32) / 255.0
# Background is studio white: estimate it from the image border.
border = np.concatenate([rgb[:8].reshape(-1,3), rgb[-8:].reshape(-1,3), rgb[:, :8].reshape(-1,3), rgb[:, -8:].reshape(-1,3)])
W = np.median(border, axis=0)
# Hard core of the piece and a band around its edge where alpha is refined against the known white background.
core = mask > 0.5
inner = ndimage.binary_erosion(core, iterations=3)
outer = ndimage.binary_dilation(core, iterations=3)
band = outer & ~inner
# Colour of the piece near each band pixel: nearest inner pixel.
idx = ndimage.distance_transform_edt(~inner, return_distances=False, return_indices=True)
F = rgb[idx[0], idx[1]]
d = F - W
num = ((rgb - W) * d).sum(-1)
den = (d * d).sum(-1)
a_col = np.clip(num / np.maximum(den, 1e-4), 0, 1)
# Where piece colour is close to white (white chair), colour matting is unreliable: keep the network's alpha.
reliable = den > 0.02
alpha = mask.copy()
sel = band & reliable
alpha[sel] = np.minimum(a_col[sel], np.clip(mask[sel] * 1.6, 0, 1))
alpha[inner] = 1.0
alpha[~outer] = 0.0
# Decontaminate: remove the white that bled into the edge pixels (C = aF + (1-a)W).
a3 = np.maximum(alpha, 1e-3)[..., None]
Fc = np.clip((rgb - (1 - a3) * W) / a3, 0, 1)
out = np.dstack([np.where((alpha > 0)[..., None], Fc, rgb), alpha])
img = Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGBA')
bbox = img.getchannel('A').point(lambda v: 255 if v > 6 else 0).getbbox()
img = img.crop(bbox)
img.save(dst, 'WEBP', quality=90, method=6)
print(dst, img.size)
