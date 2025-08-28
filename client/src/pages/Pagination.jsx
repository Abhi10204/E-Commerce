import React from "react";

const Pagination = ({ currentPage, totalPages, handlePageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8 space-x-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
      >
        Prev
      </button>

      {currentPage > 2 && (
        <>
          <button
            onClick={() => handlePageChange(1)}
            className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            1
          </button>
          {currentPage > 3 && <span className="px-2">...</span>}
        </>
      )}

      {[currentPage - 1, currentPage, currentPage + 1]
        .filter((page) => page > 0 && page <= totalPages)
        .map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded ${currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {page}
          </button>
        ))}

      {currentPage < totalPages - 1 && (
        <>
          {currentPage < totalPages - 2 && <span className="px-2">...</span>}
          <button
            onClick={() => handlePageChange(totalPages)}
            className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;