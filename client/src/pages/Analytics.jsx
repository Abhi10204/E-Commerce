import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const [purchaseData, setPurchaseData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch product purchases data
       const purchasesResponse = await axios.get(`${BASE_URL}/api/analytics/product-purchases`, {
  headers: { Authorization: `Bearer ${token}` }
});

        // Fetch order data
        const ordersResponse = await axios.get(`${BASE_URL}/api/analytics/user-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPurchaseData(purchasesResponse.data);
        setOrderData(ordersResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-screen-xl mx-auto">
      <h1 className="text-2xl md:text-4xl font-bold text-center mb-8">📊 Analytics Dashboard</h1>

      {/* First Graph: Product Purchases */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md">
        <h2 className="text-lg md:text-2xl font-semibold mb-4">Products Purchased by Users</h2>
        <div className="h-[250px] md:h-[400px]">
          {purchaseData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="username" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} products`, 'Count']}
                  labelFormatter={(label) => `User: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="productCount" 
                  name="Products Purchased"
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              No product purchase data available
            </div>
          )}
        </div>
      </div>

      {/* Second Graph: Orders per User */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md">
        <h2 className="text-lg md:text-2xl font-semibold mb-4">Total Orders per User</h2>
        <div className="h-[250px] md:h-[400px]">
          {orderData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="username" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} orders`, 'Count']}
                  labelFormatter={(label) => `User: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="orderCount" 
                  name="Orders Placed"
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              No order data available
            </div>
          )}
        </div>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-purple-600">
            {purchaseData.reduce((acc, curr) => acc + (curr.username ? 1 : 0), 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-green-500">
            {purchaseData.reduce((acc, curr) => acc + (curr.productCount || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-500">
            {orderData.reduce((acc, curr) => acc + (curr.orderCount || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;