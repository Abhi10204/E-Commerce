import React, { useState } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

const OrderReview = ({ orderId, productId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${BASE_URL}/api/reviews`,
        {
          productId,
          orderId,
          rating,
          reviewText,
          isAnonymous
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onReviewSubmit();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
      <h3 className="font-medium text-lg mb-3">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  size={20}
                  className={
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="reviewText" className="block text-gray-700 mb-1">
            Review (optional)
          </label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            rows="3"
            maxLength="200"
            placeholder="Share your thoughts about this product..."
          />
        </div>
        
        <div className="mb-3 flex items-center">
          <input
            type="checkbox"
            id="isAnonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isAnonymous" className="text-sm text-gray-700">
            Post anonymously
          </label>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className={`px-3 py-1.5 rounded text-sm ${
            rating === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default OrderReview;