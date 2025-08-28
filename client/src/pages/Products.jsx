import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, ShoppingCart } from "lucide-react";
const BASE_URL = import.meta.env.VITE_API_URL;
import ProductFilters from './ProductFilters';
import Pagination from './Pagination';
import { useCart } from './CartManager';
import ProductReviews from './ProductReviews';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [detailModal, setDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    searchQuery: "",
    sortOption: "",
    minPrice: "",
    maxPrice: "",
    selectedCategory: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const { cart, addToCart, cartItemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      
      const params = {
        query: filters.searchQuery,
        category: filters.selectedCategory,
        sort: filters.sortOption,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        page: currentPage,
        limit: 6
      };

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const res = await axios.get(`${BASE_URL}/api/products`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (productId, e) => {
    e.stopPropagation();
    setSelectedProductId(productId);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${BASE_URL}/api/products/${selectedProductId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(products.filter((product) => product._id !== selectedProductId));
      setSuccessMessage("Product deleted successfully!");
      setShowModal(false);
      setSelectedProductId(null);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setDetailModal(true);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Products Manager</h1>
        
        <div className="flex flex-wrap gap-2 md:gap-4">
          <button
            onClick={() => navigate("/dashboard/addproduct")}
            className="bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-green-700 text-sm md:text-base"
          >
            Add Product
          </button>
          <button
            onClick={() => navigate("/dashboard/cart")}
            className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm md:text-base"
          >
            <ShoppingCart size={16} />
            Cart ({cartItemCount})
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-500 text-white p-3 md:p-4 rounded-lg mb-4 text-center text-sm md:text-base">
          {successMessage}
        </div>
      )}

      <ProductFilters 
        filters={filters} 
        setFilters={setFilters} 
        setCurrentPage={setCurrentPage} 
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64" role="status">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No products found. Try adjusting your search filters.</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">All Products</h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white shadow-md md:shadow-xl rounded-lg md:rounded-2xl p-3 md:p-4 flex flex-col cursor-pointer hover:shadow-lg md:hover:shadow-2xl transition relative"
                onClick={() => openDetailModal(product)}
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-36 md:h-48 object-cover rounded-lg mb-3"
                  />
                )}
                <h2 className="text-lg md:text-xl font-semibold">{product.title}</h2>
                <p className="text-gray-600 mb-2">${product.price}</p>
                {product.category && (
                  <span className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mb-2">
                    {product.category}
                  </span>
                )}
                <p className="text-xs md:text-sm text-gray-500 mb-4">
                  {product.description && product.description.length > 80
                    ? product.description.substring(0, 80) + "..."
                    : product.description}
                </p>
                <div
                  className="mt-auto flex justify-between space-x-1 md:space-x-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/add-product/${product._id}`);
                    }}
                    className="flex items-center gap-1 bg-yellow-400 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-yellow-500"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => confirmDelete(product._id, e)}
                    className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-red-600"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product._id, setSuccessMessage);
                    }}
                    className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-blue-600"
                  >
                    <ShoppingCart size={14} />
                    <span>Add</span>
                  </button>
                </div>
                
                {product.orderCount > 0 && (
                  <div className="mt-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full inline-flex items-center">
                    <span>{product.orderCount} orders</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            handlePageChange={setCurrentPage} 
          />
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-lg md:text-xl font-bold mb-4">Are you sure?</h2>
            <p className="mb-6 text-gray-700 text-sm md:text-base">Do you really want to delete this product?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-300 rounded text-sm md:text-base hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded text-sm md:text-base hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {detailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white p-4 md:p-6 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDetailModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-xl md:text-2xl font-bold mb-2">{selectedProduct.title}</h2>
            {selectedProduct.imageUrl && (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="w-full h-48 md:h-64 object-cover rounded mb-4"
              />
            )}
            <p className="text-gray-700 mb-2 text-sm md:text-base">Price: ${selectedProduct.price}</p>
            {selectedProduct.category && (
              <p className="text-gray-700 mb-2 text-sm md:text-base">
                Category: <span className="font-medium">{selectedProduct.category}</span>
              </p>
            )}
            <p className="text-gray-600 mb-4 text-sm md:text-base">{selectedProduct.description}</p>

            {/* Product Reviews Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Customer Reviews</h3>
              <ProductReviews productId={selectedProduct._id} />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(selectedProduct._id, setSuccessMessage);
                  setDetailModal(false);
                }}
                className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() => setDetailModal(false)}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-300 rounded text-sm md:text-base hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;