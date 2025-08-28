import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff } from 'lucide-react';
// const BASE_URL = import.meta.env.VITE_API_URL;

const Signup = () => {
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePicture: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().min(3, 'At least 3 characters').required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string()
        .min(8, 'Min 8 characters')
        .matches(/[A-Z]/, 'One uppercase')
        .matches(/[0-9]/, 'One number')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        const data = new FormData();
        data.append('name', values.name);
        data.append('email', values.email);
        data.append('password', values.password);
        data.append('profilePicture', values.profilePicture);

        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setMessage('Signup successful! Redirecting to login...');
        setError('');

        const decodedToken = jwtDecode(res.data.token);
        console.log('Decoded Token:', decodedToken);

        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (err) {
        const errMsg = err.response?.data?.error || 'Something went wrong';
        if (errMsg.toLowerCase().includes('email')) {
          setError('Email already exists');
        } else {
          setError(errMsg);
        }
        setMessage('');
      }
    },
  });

  const handleFileChange = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('profilePicture', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-black ml-20 text-gray-900">Create an account</h2>

          {message && (
            <div className="bg-green-100 text-green-700 p-2 rounded text-center">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-purple-500">
                <img
                  src={preview || 'https://www.svgrepo.com/show/382106/avatar-boy.svg'}
                  alt="Profile Preview"
                  className="object-cover w-full h-full"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                name="profilePicture"
                onChange={handleFileChange}
                className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-4
                  file:rounded-full file:border-0 file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>

            {/* Name */}
            <input
              name="name"
              placeholder="Name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm">{formik.errors.name}</p>
            )}

            {/* Email */}
            <input
              name="email"
              placeholder="Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm">{formik.errors.email}</p>
            )}

            {/* Password */}
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md"
            >
              Sign up
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="text-purple-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>

      {/* Right side UI */}
      <div className="hidden relative lg:flex w-1/2 items-center justify-center bg-gray-200">
        <div className="w-60 h-60 bg-gradient-to-tr from-purple-600 to-pink-400 rounded-full animate-bounce"></div>
        <div className='w-full h-1/2 bg-white/10 absolute bottom-0 backdrop-blur-lg'></div>
      </div>
    </div>
  );
};

export default Signup;
