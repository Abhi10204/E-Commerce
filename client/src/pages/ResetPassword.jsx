import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    }),
    onSubmit: async (values) => {
      setMessage('');
      setError('');
      try {
        // ✅ Call the correct endpoint
        const res = await axios.post(`${BASE_URL}/api/users/forgot`, values);
        
        // ✅ Handle response with `msg` key
        setMessage(res.data.msg || 'Password reset instructions sent to your email.');
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.msg || 'Failed to send reset instructions.');
      }
    },
  });

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Reset Password</h2>

      {message && <p className="text-green-600 text-center mb-4">{message}</p>}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Enter your email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm">{formik.errors.email}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
