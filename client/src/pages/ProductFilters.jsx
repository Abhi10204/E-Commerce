import React from "react";

const categories = [
  "Electronics",
  "Clothing",
  "Footwear",
  "Books",
  "Beauty"
];

const ProductFilters = ({ filters, setFilters, setCurrentPage }) => {
  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      sortOption: "",
      minPrice: "",
      maxPrice: "",
      selectedCategory: ""
    });
    setCurrentPage(1);
  };

  const hasFilters = () => {
    return (
      filters.searchQuery || 
      filters.sortOption || 
      filters.minPrice || 
      filters.maxPrice || 
      filters.selectedCategory
    );
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Search by title..."
        value={filters.searchQuery}
        onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
        className="border p-2 rounded flex-grow max-w-md"
      />
      <select
        value={filters.selectedCategory}
        onChange={(e) => setFilters({...filters, selectedCategory: e.target.value})}
        className="border p-2 rounded"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select 
        value={filters.sortOption}
        onChange={(e) => setFilters({...filters, sortOption: e.target.value})} 
        className="border p-2 rounded"
      >
        <option value="">Sort</option>
        <option value="priceAsc">Price Low to High</option>
        <option value="priceDesc">Price High to Low</option>
        <option value="alphaAsc">A-Z</option>
        <option value="alphaDesc">Z-A</option>
      </select>
      <input
        type="number"
        placeholder="Min Price"
        value={filters.minPrice}
        onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
        className="border p-2 rounded w-24"
      />
      <input
        type="number"
        placeholder="Max Price"
        value={filters.maxPrice}
        onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
        className="border p-2 rounded w-24"
      />
      {hasFilters() && (
        <button
          onClick={resetFilters}
          className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default ProductFilters;