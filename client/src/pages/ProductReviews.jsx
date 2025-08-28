import React, { useState, useEffect } from 'react';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;
import { Star } from 'lucide-react';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${BASE_URL}/api/reviews/product/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setReviews(res.data.reviews);
        setAverageRating(res.data.averageRating || 0);
        setReviewCount(res.data.reviewCount || 0);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center mb-4">
        <div className="flex items-center mr-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={18}
              className={
                i < Math.round(averageRating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }
            />
          ))}
          <span className="ml-1 text-gray-700 font-medium">
            {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {review.isAnonymous ? 'Anonymous' : review.userId?.name || 'User'}
                  </h4>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {review.reviewText && (
                <p className="mt-2 text-gray-700 text-sm">{review.reviewText}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;