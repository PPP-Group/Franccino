/**
 * Renders a schema.org payload (see `@/lib/seo/jsonld`) as a JSON-LD
 * `<script>` tag. Escapes every `<` in the serialized payload so a value
 * containing `</script>` can never close the tag early.
 */

type JsonLdProps = {
  data: object;
};

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
