import AdminSelect from "@/components/common/AdminSelect";
import env from "@/config/env";

const BUCKETS = [
  { value: env.bucketExperienceMedia, labelKey: "admin.mediaManager.bucketExperiences" },
  { value: env.bucketPublicationMedia, labelKey: "admin.mediaManager.bucketPublications" },
  { value: env.bucketAddonImages, labelKey: "admin.mediaManager.bucketAddons" },
  { value: env.bucketPackageImages, labelKey: "admin.mediaManager.bucketPackages" },
  { value: env.bucketUserAvatars, labelKey: "admin.mediaManager.bucketAvatars" },
  { value: env.bucketDocuments, labelKey: "admin.mediaManager.bucketDocuments" },
  { value: env.bucketPublicResources, labelKey: "admin.mediaManager.bucketPublicResources" },
];

export { BUCKETS };

export default function BucketSelector({ value, onChange, t }) {
  const options = BUCKETS.map((b) => ({
    value: b.value,
    label: t(b.labelKey),
  }));

  return (
    <AdminSelect
      value={value}
      onChange={onChange}
      options={options}
      fullWidth={false}
    />
  );
}
