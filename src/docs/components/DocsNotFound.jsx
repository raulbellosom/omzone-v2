import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function DocsNotFound() {
  return (
    <div className="text-center py-12">
      <FileQuestion className="w-16 h-16 text-stone-300 mx-auto mb-4" />
      <h2 className="text-xl font-medium text-stone-700 mb-2">Page not found</h2>
      <p className="text-stone-500 mb-6">
        The documentation page you're looking for doesn't exist.
      </p>
      <Link
        to="/help/docs"
        className="text-stone-600 hover:text-stone-900"
      >
        ← Back to documentation
      </Link>
    </div>
  );
}