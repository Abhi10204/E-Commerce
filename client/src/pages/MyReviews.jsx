import React, { useState, useEffect } from 'react';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;
import { Star, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReviewModal from './ReviewModal';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${BASE_URL}/api/reviews/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleDelete = async (reviewId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${BASE_URL}/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(reviews.filter(review => review._id !== reviewId));
      setSuccessMessage('Review deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const token = localStorage.getItem('authToken');
      let response;
      
      if (selectedReview) {
        // Update existing review
        response = await axios.put(
          `${BASE_URL}/api/reviews/${selectedReview._id}`,
          reviewData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReviews(reviews.map(review => 
          review._id === selectedReview._id ? response.data.review : review
        ));
      } else {
        // Create new review
        response = await axios.post(
          `${BASE_URL}/api/reviews`,
          reviewData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReviews([response.data.review, ...reviews]);
      }
      
      setSuccessMessage(`Review ${selectedReview ? 'updated' : 'created'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      setSelectedReview(null);
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  if (loading) {
    return (
      
      <div role="status" className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Reviews</h1>
      
      {successMessage && (
        <div className="bg-green-500 text-white p-3 rounded-lg mb-4">
          {successMessage}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">You haven't written any reviews yet.</p>
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            View Your Orders
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {review.productId?.title || 'Product'}
                  </h3>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              {review.reviewText && (
                <p className="mt-2 text-gray-700">{review.reviewText}</p>
              )}
              
              {review.isAnonymous && (
                <p className="mt-1 text-xs text-gray-500">Posted anonymously</p>
              )}
            </div>
          ))}
        </div>
      )}

      <ReviewModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedReview(null);
        }}
        onSubmit={handleReviewSubmit}
        initialData={selectedReview}
      />
    </div>
  );
};

export default MyReviews;