import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/common/Card";
import env from "@/config/env";
import { Server, Database, HardDrive, Info } from "lucide-react";

const BUCKETS = [
  { label: "Experience Media", id: env.bucketExperienceMedia },
  { label: "Publication Media", id: env.bucketPublicationMedia },
  { label: "Addon Images", id: env.bucketAddonImages },
  { label: "Package Images", id: env.bucketPackageImages },
  { label: "User Avatars", id: env.bucketUserAvatars },
  { label: "Documents", id: env.bucketDocuments },
  { label: "Public Resources", id: env.bucketPublicResources },
];

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-sand-dark/30 last:border-0">
      <span className="text-sm text-charcoal-muted shrink-0">{label}</span>
      <span
        className={`text-sm font-medium text-charcoal text-right break-all min-w-0 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function SystemInfoPanel() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* General */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-charcoal mb-4 flex items-center gap-2">
          <Info className="h-4 w-4 text-charcoal-muted" />
          {t("admin.settings.general")}
        </h3>
        <div className="space-y-0">
          <InfoRow label={t("admin.settings.appVersion")} value="0.1.0" />
          <InfoRow
            label={t("admin.settings.siteName")}
            value={env.siteName}
          />
          <InfoRow
            label={t("admin.settings.siteUrl")}
            value={env.siteUrl}
            mono
          />
        </div>
      </Card>

      {/* Appwrite */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-charcoal mb-4 flex items-center gap-2">
          <Server className="h-4 w-4 text-charcoal-muted" />
          {t("admin.settings.appwrite")}
        </h3>
        <div className="space-y-0">
          <InfoRow
            label={t("admin.settings.endpoint")}
            value={env.appwriteEndpoint}
            mono
          />
          <InfoRow
            label={t("admin.settings.projectId")}
            value={env.appwriteProjectId}
            mono
          />
          <InfoRow
            label={t("admin.settings.databaseId")}
            value={env.appwriteDatabaseId}
            mono
          />
        </div>
      </Card>

      {/* Buckets */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-charcoal mb-4 flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-charcoal-muted" />
          {t("admin.settings.storageBuckets")}
        </h3>
        <div className="space-y-0">
          {BUCKETS.map((b) => (
            <InfoRow key={b.id} label={b.label} value={b.id} mono />
          ))}
        </div>
      </Card>
    </div>
  );
}
