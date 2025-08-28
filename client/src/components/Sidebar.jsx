import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const links = [
    { name: 'Analytics Dashboard', path: '/dashboard/analytics' },
    { name: 'Product', path: '/dashboard/products' },
    { name: 'Cart', path: '/dashboard/cart' },
    { name: 'Order', path: '/dashboard/orders' },
    
  ];
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  // Classes for mobile sidebar - removed overflow properties to disable scrolling
  const sidebarClasses = isOpen
  ? "fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white shadow-lg transform translate-x-0 transition-transform duration-300 ease-in-out overflow-hidden"
  : "fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white shadow-lg transform -translate-x-full transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 overflow-hidden";
  
  return (
    <>
      {/* Mobile hamburger menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar - with no scrolling */}
      <div className={sidebarClasses}>
        <div className="p-6 h-full">
          <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
          <nav className="space-y-4">
            {links.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  location.pathname === link.path ? 'bg-gray-700' : ''
                }`}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;