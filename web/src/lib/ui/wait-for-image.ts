/** Tempo máximo que um movimento espera a foto de destino carregar, em ms. */
export const IMAGE_WAIT_MS = 600;

/**
 * Espera a foto ficar pronta para ser desenhada (carregada e decodificada), até `IMAGE_WAIT_MS`. Usada pelos movimentos
 * em que uma foto cresce até outra: sem a espera, a foto de destino entra vazia e aparece de uma vez no fim.
 */
export function waitForImage(
  image: HTMLImageElement | null | undefined,
  wait = IMAGE_WAIT_MS,
): Promise<unknown> {
  if (!image || (image.complete && image.naturalWidth > 0)) {
    return image ? image.decode().catch(() => undefined) : Promise.resolve();
  }
  return Promise.race([
    new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    }),
    new Promise((resolve) => window.setTimeout(resolve, wait)),
  ]);
}
