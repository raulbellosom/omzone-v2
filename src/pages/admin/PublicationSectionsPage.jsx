import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import StatusBadge from "@/components/admin/experiences/StatusBadge";
import SectionManager from "@/components/admin/publications/SectionManager";
import PublicationPreview from "@/components/admin/publications/PublicationPreview";
import { usePublication } from "@/hooks/usePublications";
import { usePublicationSections } from "@/hooks/usePublicationSections";
import { ROUTES } from "@/constants/routes";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-48 rounded bg-warm-gray" />
      <div className="h-4 w-32 rounded bg-warm-gray" />
      <div className="space-y-2 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-warm-gray" />
        ))}
      </div>
    </div>
  );
}

export default function PublicationSectionsPage() {
  const { id } = useParams();
  const { data: publication, loading, error } = usePublication(id);
  const { data: sections } = usePublicationSections(id);
  const [showPreview, setShowPreview] = useState(false);
  const { t } = useLanguage();

  if (loading) return <LoadingSkeleton />;

  if (error || !publication) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-sm text-red-700">
          {error ?? t("admin.publications.notFound")}
        </p>
      </Card>
    );
  }

  const editUrl = ROUTES.ADMIN_PUBLICATION_EDIT.replace(":id", id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <Link
            to={ROUTES.ADMIN_PUBLICATIONS}
            className="flex items-center gap-1 text-sm text-charcoal-subtle hover:text-charcoal mb-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("admin.publications.backToPublications")}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-semibold text-charcoal">
              {publication.title}
            </h1>
            <StatusBadge status={publication.status} />
          </div>
          <p className="text-sm text-charcoal-subtle">
            /{publication.slug} · {sections.length}{" "}
            {sections.length === 1
              ? t("admin.publications.sectionSuffix")
              : t("admin.publications.sectionsSuffix")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4" />
            {showPreview
              ? t("admin.publications.hidePreview")
              : t("admin.publications.showPreview")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={editUrl}>
              <Pencil className="h-4 w-4" />
              {t("admin.publications.editData")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <PublicationPreview publication={publication} sections={sections} />
      )}

      {/* Section Manager */}
      <SectionManager publicationId={id} />
    </div>
  );
}
