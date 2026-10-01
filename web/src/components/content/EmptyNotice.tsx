/** Estado vazio neutro: nunca promete conteúdo nem inventa texto. */
export function EmptyNotice({ title = null, text }: { title?: string | null; text: string }) {
  return (
    <div className="empty" role="status">
      {title ? <h2>{title}</h2> : null}
      <p className="lead">{text}</p>
    </div>
  );
}
