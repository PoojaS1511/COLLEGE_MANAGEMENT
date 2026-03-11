import * as React from "react"
import { cn } from "../../utils/payrollUtils"

const Pagination = ({ currentPage, totalPages, onPageChange, showSizeChanger = false, pageSize, onPageSizeChange }) => {
  const pages = []
  const showEllipsis = totalPages > 7

  // Generate page numbers
  if (showEllipsis) {
    if (currentPage <= 4) {
      for (let i = 1; i <= Math.min(5, totalPages); i++) {
        pages.push(i)
      }
      if (totalPages > 5) {
        pages.push('...')
        pages.push(totalPages)
      }
    } else if (currentPage >= totalPages - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }
  } else {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  }

  const handlePageClick = (page) => {
    if (page !== '...' && onPageChange) {
      onPageChange(page)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          className={cn(
            "px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Previous
        </button>
        
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            disabled={page === '...'}
            className={cn(
              "px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:cursor-not-allowed",
              page === currentPage && "bg-blue-500 text-white hover:bg-blue-600"
            )}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className={cn(
            "px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Next
        </button>
      </div>

      {showSizeChanger && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Items per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}
    </div>
  )
}

export { Pagination }
export default Pagination
