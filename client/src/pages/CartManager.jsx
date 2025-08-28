import { useState, useEffect } from 'react';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      
      // Get user information from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const authToken = localStorage.getItem('authToken');

      if (!user || !authToken) {
        // If no user or token, use anonymous localStorage cart instead
        const savedCart = localStorage.getItem('anonymousCart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
        return;
      }

      const userId = user._id || user.id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const { data } = await axios.get(
        `${BASE_URL}/api/cart/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      if (data.cart && data.cart.items && data.cart.items.length > 0) {
        // Transform API cart format to match the component's format
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
        // Check if we have a user-specific cart in localStorage as fallback
        const userCartKey = `userCart_${userId}`;
        const savedUserCart = localStorage.getItem(userCartKey);
        if (savedUserCart) {
          setCart(JSON.parse(savedUserCart));
        } else {
          setCart([]);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
      
      // Fallback to localStorage cart
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && (user._id || user.id)) {
          const userId = user._id || user.id;
          const userCartKey = `userCart_${userId}`;
          const savedUserCart = localStorage.getItem(userCartKey);
          if (savedUserCart) {
            setCart(JSON.parse(savedUserCart));
          }
        } else {
          const savedCart = localStorage.getItem('anonymousCart');
          if (savedCart) {
            setCart(JSON.parse(savedCart));
          }
        }
      } catch (localStorageErr) {
        console.error('Error loading cart from localStorage:', localStorageErr);
        setCart([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save cart to localStorage as backup
  useEffect(() => {
    if (!isLoading && cart.length >= 0) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && (user._id || user.id)) {
          // Save to user-specific cart
          const userId = user._id || user.id;
          const userCartKey = `userCart_${userId}`;
          localStorage.setItem(userCartKey, JSON.stringify(cart));
        } else {
          // Save to anonymous cart if no user
          localStorage.setItem('anonymousCart', JSON.stringify(cart));
        }
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isLoading]);

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, setSuccessMessage) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const authToken = localStorage.getItem('authToken');

      if (!user || !authToken) {
        throw new Error('Please log in to add items to cart');
      }

      const userId = user._id || user.id;
      
      setIsLoading(true);
      
      // First check if product already exists in local cart
      const existingItemIndex = cart.findIndex(item => item._id === productId);
      
      // Default quantity is 1 for new items, or current quantity + 1 for existing items
      const quantity = existingItemIndex >= 0 ? cart[existingItemIndex].quantity + 1 : 1;
      
      // Call API to update cart
      await axios.post(
        `${BASE_URL}/api/cart/add`,
        {
          userId,
          productId,
          quantity
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      // Update local cart state
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity = quantity;
        setCart(updatedCart);
      } else {
        // Get product details and add new item
        const { data } = await axios.get(
          `${BASE_URL}/api/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        
        const newItem = {
          _id: data._id,
          title: data.name || data.title,
          price: data.price,
          imageUrl: data.imageUrl,
          description: data.description,
          quantity: 1
        };
        
        setCart([...cart, newItem]);
      }
      
      if (setSuccessMessage) {
        setSuccessMessage('Product added to cart!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (setSuccessMessage) {
        setSuccessMessage(err.response?.data?.error || 'Failed to add to cart');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  const cartTotal = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0).toFixed(2);

  return {
    cart,
    isLoading,
    error,
    addToCart,
    fetchCart,
    cartItemCount,
    cartTotal
  };
};