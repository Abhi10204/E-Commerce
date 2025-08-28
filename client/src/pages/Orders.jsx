import React, { useEffect, useState } from 'react';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;
import { ShoppingBag, X, Check, Clock, Star as StarIcon } from 'lucide-react';
import OrderReview from './OrderReview';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTimer, setCancelTimer] = useState({});
  const [canceling, setCanceling] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${BASE_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const timers = orders.reduce((acc, order) => {
      if (order.status === 'Pending') {
        const timeElapsed = Math.floor(Date.now() - new Date(order.createdAt).getTime()) / 1000;
        const timeRemaining = Math.max(0, 10 - timeElapsed);
        acc[order._id] = Math.floor(timeRemaining);
      }
      return acc;
    }, {});
    setCancelTimer(timers);

    const countdown = setInterval(() => {
      setCancelTimer((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        Object.keys(updatedTimers).forEach((orderId) => {
          if (updatedTimers[orderId] > 0) {
            updatedTimers[orderId]--;
            if (updatedTimers[orderId] === 0) {
              updateOrderStatusToSuccessful(orderId);
            }
          }
        });
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [orders]);

  const updateOrderStatusToSuccessful = async (orderId) => {
    try {
      const token = getToken();
      await axios.post(
        `${BASE_URL}/api/orders/${orderId}/updateStatus`,
        { status: 'Successful' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: 'Successful' }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setCanceling(true);
      const token = getToken();
      await axios.post(
        `${BASE_URL}/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: 'Cancelled' }
            : order
        )
      );
      setSuccessMessage('Order cancelled successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error canceling order:', error);
      if (error.response && error.response.data.message === "Cancellation period expired") {
        setSuccessMessage('Cancellation period has expired. Order is already confirmed.');
        setTimeout(() => setSuccessMessage(''), 3000);
        updateOrderStatusToSuccessful(orderId);
      } else {
        setSuccessMessage('Something went wrong while cancelling the order.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } finally {
      setCanceling(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Successful': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} className="mr-1" />;
      case 'Successful': return <Check size={16} className="mr-1" />;
      case 'Cancelled': return <X size={16} className="mr-1" />;
      default: return <ShoppingBag size={16} className="mr-1" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getImageUrl = (item) => {
    if (item.productSnapshot?.imageUrl) {
      return item.productSnapshot.imageUrl;
    }
    if (item.productId?.imageUrl) {
      return item.productId.imageUrl;
    }
    return '/api/placeholder/80/80';
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Orders</h1>

      {successMessage && (
        <div className={`p-3 rounded-lg mb-4 text-center ${
          successMessage.includes('successfully') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {successMessage}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-gray-600 text-lg">No orders found</p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="mb-6 bg-white rounded-lg shadow-md border-t-4 border-indigo-500 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-lg md:text-xl font-semibold">
                  Order #{order._id.substring(0, 6)}
                </h2>
                {order.createdAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium mt-2 sm:mt-0 flex items-center ${getStatusBadgeClass(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>

            <div className="p-4">
              {order.products.map((item, index) => {
                const price = item.productSnapshot?.price || (item.productId?.price || 0);
                const title = item.productSnapshot?.title || (item.productId?.title || 'Product not found');
                const productId = item.productId?._id || item.productId;
                
                return (
                  <div
                    key={`${order._id}-${index}`}
                    className="flex flex-col sm:flex-row sm:justify-between mb-4 border-b pb-4 last:border-b-0"
                  >
                    <div className="flex gap-4 items-start sm:items-center">
                      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(item)}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/api/placeholder/80/80';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-semibold">{title}</h3>
                        <div className="flex gap-4 text-gray-600 text-sm md:text-base mt-1">
                          <span>${price.toFixed(2)}</span>
                          <span>×</span>
                          <span>{item.quantity}</span>
                          <span>=</span>
                          <span className="font-medium">${(price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {order.status === 'Pending' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={canceling || cancelTimer[order._id] <= 0}
                    className={`${
                      canceling || cancelTimer[order._id] <= 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white px-4 py-2 rounded-lg font-medium transition`}
                  >
                    {canceling ? 'Cancelling...' : 'Cancel Order'}
                  </button>

                  {cancelTimer[order._id] > 0 && (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                      <span className="text-red-500 font-medium">
                        {cancelTimer[order._id]}s remaining to cancel
                      </span>
                    </div>
                  )}

                  {cancelTimer[order._id] <= 0 && (
                    <span className="text-gray-500 italic">
                      Order automatically confirmed
                    </span>
                  )}
                </div>
              )}

              {order.status === 'Successful' && (
                <div className="mt-4">
                  {order.products.map((item, index) => {
                    const productId = item.productId?._id || item.productId;
                    return (
                      <div key={`review-${index}`} className="mb-4">
                        {!item.isReviewed && (
                          <OrderReview 
                            orderId={order._id}
                            productId={productId}
                            onReviewSubmit={() => {
                              // Update the order to mark this product as reviewed
                              const updatedOrders = orders.map(o => {
                                if (o._id === order._id) {
                                  return {
                                    ...o,
                                    products: o.products.map(p => {
                                      const pId = p.productId?._id || p.productId;
                                      if (pId === productId) {
                                        return { ...p, isReviewed: true };
                                      }
                                      return p;
                                    })
                                  };
                                }
                                return o;
                              });
                              setOrders(updatedOrders);
                              setSuccessMessage('Review submitted successfully!');
                              setTimeout(() => setSuccessMessage(''), 3000);
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;