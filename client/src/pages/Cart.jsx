import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const BASE_URL = import.meta.env.VITE_API_URL;

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCart, setFetchingCart] = useState(true);
  const navigate = useNavigate();

  // Fetch cart from API or localStorage
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setFetchingCart(true);
        const user = JSON.parse(localStorage.getItem('user'));
        const authToken = localStorage.getItem('authToken');

        // Use localStorage cart if no user or token
        if (!user || !authToken) {
          const savedCart = localStorage.getItem('anonymousCart');
          if (savedCart) setCart(JSON.parse(savedCart));
          setFetchingCart(false);
          return;
        }

        const userId = user._id || user.id;
        
        const { data } = await axios.get(
          `${BASE_URL}/api/cart/${userId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        if (data.cart?.items?.length > 0) {
          // Transform API cart format
          const cartItems = data.cart.items.map(item => ({
            _id: item.productId._id,
            title: item.productId.name || item.productId.title,
            price: item.productId.price,
            imageUrl: item.productId.imageUrl,
            description: item.productId.description,
            quantity: item.quantity
          }));
          setCart(cartItems);
        } else {
          // Try fallback to localStorage
          const userCartKey = `userCart_${userId}`;
          const savedUserCart = localStorage.getItem(userCartKey);
          if (savedUserCart) setCart(JSON.parse(savedUserCart));
          else setCart([]);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        // Fallback to localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          const userId = user._id || user.id;
          const savedUserCart = localStorage.getItem(`userCart_${userId}`);
          if (savedUserCart) setCart(JSON.parse(savedUserCart));
        }
      } finally {
        setFetchingCart(false);
      }
    };

    fetchCart();
  }, []);

  // Save cart to localStorage as backup
  useEffect(() => {
    if (!fetchingCart && cart.length >= 0) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          // Save to user-specific cart
          const userId = user._id || user.id;
          localStorage.setItem(`userCart_${userId}`, JSON.stringify(cart));
        } else {
          // Save to anonymous cart if no user
          localStorage.setItem('anonymousCart', JSON.stringify(cart));
        }
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, fetchingCart]);

  // Update cart item in backend
  const updateCartItem = async (productId, quantity) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const authToken = localStorage.getItem('authToken');

    if (!user || !authToken) return;

    try {
      const userId = user._id || user.id;
      
      if (quantity > 0) {
        await axios.post(
          `${BASE_URL}/api/cart/add`,
          { userId, productId, quantity },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } else {
        await axios.delete(
          `${BASE_URL}/api/cart/remove`,
          {
            data: { userId, productId },
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const updateQuantity = (productId, amount) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item._id === productId) {
          const newQuantity = Math.max(0, item.quantity + amount);
          if (newQuantity > 0) updateCartItem(productId, newQuantity);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
      
      // Remove from selected if quantity is zero
      const removedItems = prevCart
        .filter(item => item._id === productId && item.quantity + amount <= 0)
        .map(item => item._id);
      
      if (removedItems.length) {
        setSelected(prev => prev.filter(id => !removedItems.includes(id)));
        removedItems.forEach(id => updateCartItem(id, 0));
      }
      
      return updatedCart;
    });
  };

  const removeItem = (productId) => {
    updateCartItem(productId, 0);
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
    setSelected(prevSelected => prevSelected.filter(id => id !== productId));
  };

  const toggleSelect = (productId) => {
    setSelected(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getTotalPrice = (items) => {
    return items
      .reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0)
      .toFixed(2);
  };

  // Place order
  const placeOrder = async (orderItems) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const authToken = localStorage.getItem('authToken');

    if (!user || !authToken) {
      alert('Please log in to place an order.');
      navigate('/login');
      return;
    }

    if (!orderItems.length) {
      alert('No products selected for order.');
      return;
    }

    const productsToOrder = orderItems.map(item => ({
      productId: item._id,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
    }));

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/api/orders/placingOrder`,
        {
          userId: user._id || user.id,
          products: productsToOrder,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      alert('Order placed successfully!');
      
      // Remove ordered items from cart
      const orderedIds = orderItems.map(item => item._id);
      setCart(prevCart => prevCart.filter(item => !orderedIds.includes(item._id)));
      setSelected(prev => prev.filter(id => !orderedIds.includes(id)));
      
      // Also remove them from backend cart
      orderedIds.forEach(id => updateCartItem(id, 0));
      
      navigate('/dashboard/orders');
    } catch (error) {
      console.error('Order error:', error.response?.data || error.message);
      alert(error?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Your Cart</h1>

      {fetchingCart ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading cart...</p>
        </div>
      ) : cart.length === 0 ? (
        <div className="text-center py-8 md:py-10">
          <p className="text-gray-600 text-base md:text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/dashboard/products')}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-start sm:items-center p-3 md:p-4 bg-white shadow rounded-lg gap-3 md:gap-4"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="checkbox"
                    className="h-4 w-4 md:h-5 md:w-5"
                    checked={selected.includes(item._id)}
                    onChange={() => toggleSelect(item._id)}
                  />
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/80'}
                    alt={item.title}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                  />
                </div>

                <div className="flex-1 mt-2 sm:mt-0">
                  <h2 className="text-base md:text-lg font-semibold">
                    {item.title || 'Untitled Product'}
                  </h2>
                  <p className="text-gray-600">${(item.price || 0).toFixed(2)}</p>
                  {item.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>

                <div className="flex justify-between items-center w-full sm:w-auto mt-3 sm:mt-0">
                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      onClick={() => updateQuantity(item._id, -1)}
                      className="bg-gray-200 w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-6 md:w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, 1)}
                      className="bg-gray-200 w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-red-500 hover:text-red-700 p-1 md:p-2 ml-2 sm:ml-4"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} className="md:size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 md:mt-8 p-3 md:p-4 bg-white shadow rounded-lg flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-lg md:text-xl font-semibold">
                Selected ({selected.length} items): ${getTotalPrice(cart.filter(item => selected.includes(item._id)))}
              </div>
              <button
                onClick={() => placeOrder(cart.filter(item => selected.includes(item._id)))}
                disabled={loading || selected.length === 0}
                className={`w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ${
                  loading || selected.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Processing...' : 'Place Selected Order'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t pt-3">
              <div className="text-lg md:text-xl font-semibold">
                Full Cart ({cart.length} items): ${getTotalPrice(cart)}
              </div>
              <button
                onClick={() => placeOrder(cart)}
                disabled={loading || cart.length === 0}
                className={`w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition ${
                  loading || cart.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Processing...' : 'Place Full Cart Order'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;