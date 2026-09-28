/** Link do WhatsApp (wa.me) com texto opcional; `null` quando não há número. */
export function whatsappUrl(phone: string | null | undefined, text?: string): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (!digits) {
    return null;
  }
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}

/** `tel:` em formato internacional; números brasileiros sem DDI ganham +55. */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.trim().startsWith('+')) {
    return `tel:+${digits}`;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `tel:+55${digits}`;
  }
  return `tel:${digits}`;
}
