import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import DocsSidebar from './DocsSidebar';

export default function DocsMobileDrawer({ open, onClose, currentPage, lang = 'en' }) {
  const drawerRef = useRef(null);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Focus trap management
  useEffect(() => {
    if (open) {
      // Small delay to ensure drawer is rendered
      const closeButton = drawerRef.current?.querySelector('button');
      closeButton?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-30 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Documentation navigation"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside 
        ref={drawerRef}
        className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white overflow-y-auto"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <div className="p-4 flex justify-end">
          <button 
            onClick={onClose} 
            className="p-2 text-stone-600 hover:text-stone-900 touch-manipulation rounded-lg hover:bg-stone-100"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <DocsSidebar currentPage={currentPage} lang={lang} />
      </aside>
    </div>
  );
}