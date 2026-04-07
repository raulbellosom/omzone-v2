import { useNavigate } from "react-router-dom";
import { ChevronRight, Layers } from "lucide-react";
import StatusBadge from "@/components/admin/experiences/StatusBadge";
import { Card } from "@/components/common/Card";
import { ROUTES } from "@/constants/routes";

const CATEGORY_LABELS = {
  landing: "Landing",
  blog: "Blog",
  highlight: "Highlight",
  institutional: "Institucional",
  faq: "FAQ",
};

export default function PublicationCard({ publication }) {
  const navigate = useNavigate();
  const editUrl = ROUTES.ADMIN_PUBLICATION_EDIT.replace(
    ":id",
    publication.$id,
  );
  const sectionsUrl = ROUTES.ADMIN_PUBLICATION_SECTIONS.replace(
    ":id",
    publication.$id,
  );

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-charcoal truncate">
            {publication.title}
          </p>
          <p className="text-xs text-charcoal-subtle truncate">
            /{publication.slug}
          </p>
        </div>
        <StatusBadge status={publication.status} />
      </div>
      <div className="flex items-center justify-between text-xs text-charcoal-subtle">
        <span>{CATEGORY_LABELS[publication.category] ?? publication.category}</span>
        {publication.publishedAt && (
          <span>
            {new Date(publication.publishedAt).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => navigate(editUrl)}
          className="flex items-center gap-1 text-xs text-sage font-medium hover:underline"
        >
          Editar
          <ChevronRight className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => navigate(sectionsUrl)}
          className="flex items-center gap-1 text-xs text-sage font-medium hover:underline"
        >
          <Layers className="w-3 h-3" />
          Secciones
        </button>
      </div>
    </Card>
  );
}
