import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  pageSizeOptions = null,
  onPageSizeChange = null,
  compact = false,
  itemName = 'entries'
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems === 0) return null;

  const startItem = (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (safeCurrentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (safeCurrentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400 select-none ${compact ? 'mt-2' : 'mt-3.5'}`}>
      
      {/* Left side: Results Count & Optional Page Size Selector */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span>
          Showing <strong className="font-semibold text-zinc-900 dark:text-white">{startItem}</strong>
          {totalItems > 1 && (
            <>
              –<strong className="font-semibold text-zinc-900 dark:text-white">{endItem}</strong>
            </>
          )}{' '}
          of <strong className="font-semibold text-zinc-900 dark:text-white">{totalItems}</strong> {itemName}
        </span>

        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="hidden sm:inline">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-900 dark:text-white font-medium focus:outline-none cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Page Navigation Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
          
          {/* Jump to first page (desktop) */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage === 1}
            title="First Page"
            className="hidden sm:flex items-center justify-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous page */}
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            title="Previous Page"
            className="flex items-center gap-1 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer font-medium text-xs sm:text-[11px] active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="sm:inline">Prev</span>
          </button>

          {/* Numbered Pills (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-1 mx-0.5">
            {pages.map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-zinc-400">
                    …
                  </span>
                );
              }
              const isCurrent = p === safeCurrentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`min-w-8 h-8 px-2 rounded-xl text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                    isCurrent
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Mobile Current Page Indicator */}
          <div className="sm:hidden px-3 py-1 font-semibold text-zinc-900 dark:text-white text-xs">
            {safeCurrentPage} / {totalPages}
          </div>

          {/* Next page */}
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            title="Next Page"
            className="flex items-center gap-1 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer font-medium text-xs sm:text-[11px] active:scale-95"
          >
            <span className="sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>

          {/* Jump to last page (desktop) */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={safeCurrentPage === totalPages}
            title="Last Page"
            className="hidden sm:flex items-center justify-center p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>

        </div>
      )}

    </div>
  );
}
