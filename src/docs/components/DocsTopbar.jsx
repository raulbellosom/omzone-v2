import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Globe, List } from "lucide-react";
import DocsSearch from "./DocsSearch";

export default function DocsTopbar({ onMenuClick, onTOCClick, lang = "en" }) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLangChange = (newLang) => {
    setLangMenuOpen(false);

    // Get current path parts
    const pathParts = location.pathname.split("/").filter(Boolean);
    const VALID_LANGS = ["en", "es"];

    // Check if we're on a docs page with lang prefix
    if (pathParts[0] === "help" && pathParts[1] === "docs") {
      if (pathParts.length >= 4) {
        // Has lang prefix: /help/docs/es/slug -> /help/docs/en/slug
        const slug = pathParts[3];
        navigate(`/help/docs/${newLang}/${slug}`);
      } else if (pathParts.length === 3) {
        // Could be /help/docs/slug (legacy) or /help/docs/lang (root docs page)
        // Check if the 3rd part is a language code
        if (VALID_LANGS.includes(pathParts[2])) {
          // It's the root docs page with language prefix: /help/docs/es -> /help/docs/en
          navigate(`/help/docs/${newLang}`);
        } else {
          // It's a slug without lang prefix: /help/docs/slug -> /help/docs/en/slug
          const slug = pathParts[2];
          navigate(`/help/docs/${newLang}/${slug}`);
        }
      } else {
        // Just /help/docs -> /help/docs/en
        navigate(`/help/docs/${newLang}`);
      }
    } else {
      // Default to /help/docs/lang
      navigate(`/help/docs/${newLang}`);
    }
  };

  return (
    <header
      className="h-14 sm:h-16 border-b border-stone-200 bg-white sticky top-0 z-20"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="h-full px-2 sm:px-4 flex items-center justify-between gap-1 sm:gap-4 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 touch-manipulation rounded-lg hover:bg-stone-100 shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Left: Branding - hidden on mobile, shown in sidebar */}
        <a
          href={`/help/docs/${lang}`}
          className="hidden md:block text-lg font-semibold text-stone-800 whitespace-nowrap shrink-0"
        >
          OMZONE Docs
        </a>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center min-w-0 max-w-xl mx-1 sm:mx-4">
          <DocsSearch lang={lang} />
        </div>

        {/* Right: Language Selector + Back to Admin */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 text-sm text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 touch-manipulation"
              aria-label="Select language"
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="uppercase text-xs sm:text-sm">{lang}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-stone-200 rounded-lg shadow-lg z-30">
                <button
                  onClick={() => handleLangChange("en")}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-stone-50 ${
                    lang === "en"
                      ? "text-stone-900 font-medium"
                      : "text-stone-600"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLangChange("es")}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-stone-50 ${
                    lang === "es"
                      ? "text-stone-900 font-medium"
                      : "text-stone-600"
                  }`}
                >
                  Español
                </button>
              </div>
            )}
          </div>

          {/* TOC Toggle - visible on mobile/tablet, hidden on large screens */}
          <button
            onClick={onTOCClick}
            className="lg:hidden p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 touch-manipulation rounded-lg hover:bg-stone-100 shrink-0"
            aria-label="Open table of contents"
          >
            <List className="w-5 h-5" />
          </button>

          {/* Back to Admin */}
          <a
            href="/admin"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Admin
          </a>
        </div>
      </div>
    </header>
  );
}
