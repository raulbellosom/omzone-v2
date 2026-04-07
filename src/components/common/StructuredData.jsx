import { Helmet } from "react-helmet-async";

/**
 * Render JSON‑LD structured data in the document <head>.
 *
 * @param {object} props
 * @param {object} props.data - A JSON‑LD object (must include @context & @type).
 */
export default function StructuredData({ data }) {
  if (!data) return null;

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
