import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
const BASE_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const profilePic = user?.profilePicture ? `${BASE_URL}/${user.profilePicture}` : "Profile";

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath === '/') {
      if (isAuthenticated) {
        navigate('/dashboard/analytics');
      } else {
        navigate('/login');
      }
    }

    if (
      currentPath.startsWith('/dashboard') ||
      currentPath === '/profile' ||
      currentPath === '/change-password' ||
      currentPath === '/my-reviews'
    ) {
      if (!isAuthenticated) {
        navigate('/login');
      }
    }

    if ((currentPath === '/login' || currentPath === '/signup') && isAuthenticated) {
      navigate('/dashboard/analytics');
    }
  }, [location.pathname, isAuthenticated, navigate]);

  const hideNavbarRoutes = ['/login', '/signup'];
  if (hideNavbarRoutes.includes(location.pathname) && !isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
      <h2 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard/analytics')}>
        MyApp
      </h2>
      <div className="flex space-x-6 items-center">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard/analytics" className="hover:text-gray-300">Dashboard</Link>
            <div className="relative" ref={dropdownRef}>
              <div
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-purple-500 overflow-hidden flex items-center justify-center"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-reviews"
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => setShowDropdown(false)}
                  >
                    My Reviews
                  </Link>
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => setShowDropdown(false)}
                  >
                    Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-300">Login</Link>
            <Link to="/signup" className="hover:text-gray-300">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;