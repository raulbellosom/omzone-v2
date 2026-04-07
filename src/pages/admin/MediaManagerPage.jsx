import { useState, useCallback, useRef } from "react";
import { useBucketFiles } from "@/hooks/useBucketFiles";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { ROLES } from "@/constants/roles";
import env from "@/config/env";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import BucketSelector from "@/components/admin/media/BucketSelector";
import MediaGrid from "@/components/admin/media/MediaGrid";
import FileDetailModal from "@/components/admin/media/FileDetailModal";
import { Search, Upload, FolderOpen, X } from "lucide-react";

export default function MediaManagerPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin =
    user?.labels?.includes(ROLES.ADMIN) || user?.labels?.includes(ROLES.ROOT);

  const [bucketId, setBucketId] = useState(env.bucketExperienceMedia);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { files, loading, error, hasMore, loadMore, refresh } = useBucketFiles(
    bucketId,
    { search },
  );

  const {
    upload,
    deleteFile,
    uploading,
    progress,
    error: uploadError,
    clearError,
    bucketLabel,
    validate,
  } = useFileUpload(bucketId);

  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const canUpload = bucketId !== env.bucketUserAvatars;

  const handleBucketChange = (newBucketId) => {
    setBucketId(newBucketId);
    setSearch("");
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFile(null);
  };

  const handleDelete = async (fileId) => {
    await deleteFile(fileId);
    refresh();
  };

  const processFiles = useCallback(
    async (fileList) => {
      if (!fileList?.length) return;
      clearError();
      for (const file of Array.from(fileList)) {
        const validationError = validate(file);
        if (validationError) {
          continue;
        }
        try {
          await upload(file);
        } catch {
          // error is set in hook state
        }
      }
      refresh();
    },
    [upload, validate, clearError, refresh],
  );

  const handleFileInputChange = (e) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">
            {t("admin.mediaManager.title")}
          </h1>
          <p className="text-sm text-charcoal-muted mt-1">
            {t("admin.mediaManager.subtitle")}
          </p>
        </div>
        {canUpload && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-1.5"
          >
            <Upload className="h-4 w-4" />
            {uploading
              ? `${t("admin.mediaManager.uploading")} ${progress}%`
              : t("admin.mediaManager.upload")}
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={
            bucketId === env.bucketDocuments
              ? ".pdf,.jpg,.jpeg,.png"
              : "image/*"
          }
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <BucketSelector value={bucketId} onChange={handleBucketChange} t={t} />
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("admin.media.searchPlaceholder")}
            className="pl-9 h-10"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="flex items-center gap-1 text-xs text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {t("admin.common.clear")}
          </button>
        )}
      </div>

      {/* Bucket constraint info */}
      <p className="text-xs text-charcoal-muted">{bucketLabel}</p>

      {/* Upload errors */}
      {uploadError && (
        <Card className="p-3 border-red-200 bg-red-50 flex items-center justify-between">
          <p className="text-sm text-red-700">{uploadError}</p>
          <button onClick={clearError} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </Card>
      )}

      {/* Drag-and-drop zone */}
      {canUpload && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`rounded-xl border-2 border-dashed transition-colors p-6 text-center ${
            dragOver
              ? "border-sage bg-sage/5"
              : "border-sand-dark/50 bg-transparent"
          }`}
        >
          <Upload className="h-8 w-8 text-charcoal-muted mx-auto mb-2" />
          <p className="text-sm text-charcoal-muted">
            {t("admin.mediaManager.dropzone")}
          </p>
          {uploading && (
            <div className="mt-3 w-48 mx-auto h-2 bg-warm-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-sage transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && files.length === 0 && (
        <Card className="p-10 text-center">
          <FolderOpen className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {search
              ? t("admin.media.noResults")
              : t("admin.media.noBucketFiles")}
          </h2>
        </Card>
      )}

      {/* Grid */}
      <MediaGrid
        files={files}
        loading={loading}
        bucketId={bucketId}
        onFileClick={handleFileClick}
      />

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? t("admin.common.loading") : t("admin.media.loadMore")}
          </Button>
        </div>
      )}

      {/* File detail modal */}
      <FileDetailModal
        file={selectedFile}
        open={modalOpen}
        onClose={handleCloseModal}
        bucketId={bucketId}
        canDelete={isAdmin}
        onDelete={handleDelete}
        t={t}
      />
    </div>
  );
}
