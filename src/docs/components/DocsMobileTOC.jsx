import { useEffect, useRef, useState } from 'react';
import { X, List } from 'lucide-react';
import DocsTableOfContents from './DocsTableOfContents';

export default function DocsMobileTOC({ open, onClose }) {
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

  return (
    <div 
      className={`fixed inset-0 z-30 md:hidden transition-opacity duration-300 ease-in-out ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Table of contents"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside 
        ref={drawerRef}
        className={`fixed right-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white overflow-y-auto transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <div className="p-4 flex justify-between items-center border-b border-stone-200 min-w-0">
          <h3 className="font-semibold text-stone-800 truncate">On this page</h3>
          <button 
            onClick={onClose} 
            className="p-2 text-stone-600 hover:text-stone-900 touch-manipulation rounded-lg hover:bg-stone-100 shrink-0"
            aria-label="Close table of contents"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 min-w-0">
          <DocsTableOfContents />
        </div>
      </aside>
    </div>
  );
}

// TOC Toggle Button for Topbar
export function DocsTOCToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-stone-600 hover:text-stone-900 touch-manipulation rounded-lg hover:bg-stone-100 shrink-0"
      aria-label="Open table of contents"
    >
      <List className="w-5 h-5" />
    </button>
  );
}
