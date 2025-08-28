import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ChangeProfile from './pages/ChangeProfile';
import DashboardLayout from './layouts/DashboardLayout';
import Analytics from './pages/Analytics';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Demand from './pages/Demand';
import AddProduct from './pages/AddProduct';
import ResetPassword from './pages/ResetPassword';
import SetNewPassword from './pages/SetNewPassword';
import MyReviews from './pages/MyReviews'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<SetNewPassword />} />

        {/* Protected Routes with Sidebar */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/products" element={<Products />} />
          <Route path="/dashboard/cart" element={<Cart />} />
          <Route path="/dashboard/orders" element={<Orders />} />
          <Route path="/dashboard/addproduct" element={<AddProduct />} />
          <Route path="/dashboard/add-product/:id" element={<AddProduct />} />
          <Route path="/dashboard/demand" element={<Demand />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangeProfile />} />
          <Route path="/my-reviews" element={<MyReviews />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
