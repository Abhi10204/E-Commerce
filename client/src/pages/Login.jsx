import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../redux/authSlice';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email format')
        .matches(/@.*\.com$/, 'Email must contain @ and .com')
        .required('Required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Must contain at least one number')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, values);


        dispatch(login({ user: res.data.user, token: res.data.token }));

        localStorage.setItem('authToken', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        setSuccessMessage('Login successful! Redirecting...');
        setErrorMessage('');

        setTimeout(() => {
          navigate('/dashboard/analytics');
        }, 1500);
      } catch (err) {
        setErrorMessage(err.response?.data?.error || 'An error occurred during login.');
        setSuccessMessage('');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Login to your account</h2>

          {errorMessage && (
            <div className="bg-red-500 text-white p-2 rounded-md text-center">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-500 text-white p-2 rounded-md text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>

            {/* Password Input with Eye Toggle */}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
              )}
            </div>

            <div className="text-right">
              <Link to="/reset-password" className="text-sm text-purple-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side UI */}
      <div className="hidden relative lg:flex w-1/2 items-center justify-center bg-gray-200">
        <div className="w-60 h-60 bg-gradient-to-tr from-purple-600 to-pink-400 rounded-full animate-bounce"></div>
        <div className="w-full h-1/2 bg-white/10 absolute bottom-0 backdrop-blur-lg"></div>
      </div>
    </div>
  );
};

export default Login;
