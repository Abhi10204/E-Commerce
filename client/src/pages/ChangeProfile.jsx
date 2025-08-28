import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
const BASE_URL = import.meta.env.VITE_API_URL;

const ChangePassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      setError('');
      setSuccess('');
      try {
        const token = localStorage.getItem('authToken');
        await axios.put(
          `${BASE_URL}/api/users/change-password`,
          {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setSuccess('Password changed successfully! You will be logged out.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 1500);
      } catch (err) {
        setError(err.response?.data?.msg || 'Password change failed.');
        console.error('Change password error:', err);
      }
    },
  });

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Change Password</h2>

      {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* Current Password */}
        <div className="relative">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type={showPassword.current ? 'text' : 'password'}
            name="currentPassword"
            id="currentPassword"
            value={formik.values.currentPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
            onClick={() => toggleVisibility('current')}
          >
            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
          {formik.touched.currentPassword && formik.errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div className="relative">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type={showPassword.new ? 'text' : 'password'}
            name="newPassword"
            id="newPassword"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
            onClick={() => toggleVisibility('new')}
          >
            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
          {formik.touched.newPassword && formik.errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type={showPassword.confirm ? 'text' : 'password'}
            name="confirmPassword"
            id="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
            onClick={() => toggleVisibility('confirm')}
          >
            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white cursor-pointer font-semibold py-2 rounded-md transition duration-200"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
