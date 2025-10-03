import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  loading = false
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Number of page numbers to show
    const halfRange = Math.floor(showPages / 2);

    let start = Math.max(1, currentPage - halfRange);
    const end = Math.min(totalPages, start + showPages - 1);

    // Adjust start if we're near the end
    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white/70 backdrop-blur-sm border-t border-primary-200/50 px-6 py-4 flex items-center justify-between rounded-b-2xl">
      {/* Items info */}
      <div className="text-sm text-primary-600 font-medium">
        Showing <span className="font-semibold text-primary-900">{startItem}</span> to{' '}
        <span className="font-semibold text-primary-900">{endItem}</span> of{' '}
        <span className="font-semibold text-primary-900">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          className="p-2 rounded-xl text-primary-500 hover:text-sky-600 hover:bg-sky-50/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:bg-transparent"
          title="First page"
        >
          <ChevronsLeft className="h-5 w-5" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="p-2 rounded-xl text-primary-500 hover:text-sky-600 hover:bg-sky-50/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:bg-transparent"
          title="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              disabled={loading}
              className={`min-w-[2.5rem] h-10 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                pageNumber === currentPage
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25'
                  : 'text-primary-600 hover:text-sky-600 hover:bg-sky-50/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="p-2 rounded-xl text-primary-500 hover:text-sky-600 hover:bg-sky-50/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:bg-transparent"
          title="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        
        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          className="p-2 rounded-xl text-primary-500 hover:text-sky-600 hover:bg-sky-50/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:bg-transparent"
          title="Last page"
        >
          <ChevronsRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
