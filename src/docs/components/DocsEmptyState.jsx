import { FileQuestion } from 'lucide-react';

export default function DocsEmptyState() {
  return (
    <div className="text-center py-12">
      <FileQuestion className="w-12 h-12 text-stone-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-stone-600 mb-2">Page not found</h3>
      <p className="text-stone-500">This documentation page doesn't exist yet.</p>
    </div>
  );
}