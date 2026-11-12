/** Área que cada logo ocupa na faixa de clientes (px²): logos largas ficam baixas, logos compactas ficam altas. */
// Revisão da Franccino (12/11/2026: "aumentar só um pouco"): cerca de 25% maiores que as de 09/11.
const LOGO_AREA = 11000;
const MAX_WIDTH = 250;
const MAX_HEIGHT = 80;

/**
 * Tamanho de uma logo na faixa de clientes com o mesmo peso visual das outras (retorno de 09/11/2026: "cada uma de um
 * tamanho"): a mesma área para todas, sem passar da largura nem da altura máximas. As logos chegam recortadas, sem
 * margem nem fundo.
 */
export function logoBox(width: number | null, height: number | null): { width: number; height: number } {
  const ratio = width && height ? width / height : 2.5;
  let h = Math.sqrt(LOGO_AREA / ratio);
  let w = h * ratio;
  if (w > MAX_WIDTH) {
    w = MAX_WIDTH;
    h = w / ratio;
  }
  if (h > MAX_HEIGHT) {
    h = MAX_HEIGHT;
    w = h * ratio;
  }
  return { width: Math.round(w), height: Math.round(h) };
}
