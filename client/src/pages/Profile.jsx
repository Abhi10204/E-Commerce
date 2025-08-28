import React, { useState } from 'react'; 
import { useSelector, useDispatch } from 'react-redux'; 
import axiosInstance from '../utils/axiosInstance';
import { updateUser } from '../redux/authSlice';  
import { Pencil, Mail, User, Camera } from 'lucide-react';
const BASE_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [newName, setNewName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const handleNameChange = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await axiosInstance.put(
        `/users/${user.id}`,
        { name: newName }
      );
      dispatch(updateUser({ name: response.data.user.name }));
      setMessage(response.data.message || 'Name updated successfully!');
    } catch (error) {
      console.error('Error updating name:', error);
      setError(error.response?.data?.message || 'Failed to update name.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfilePicChange = async (e) => {
    const formData = new FormData();
    formData.append('profilePicture', e.target.files[0]);
    formData.append('userId', user.id);
    
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await axiosInstance.post(
        '/users/uploadProfilePicture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      dispatch(updateUser({ profilePicture: response.data.profilePicture }));
      setMessage('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError(error.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setLoading(false);
    }
  };
  
  const profilePic = user?.profilePicture
    ? `${BASE_URL}/${user.profilePicture}`
    : 'default-avatar.jpg';

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2"><User className="w-5 h-5" /> Your Profile</h2>
        <p className="text-purple-100 text-sm">Manage your personal information</p>
      </div>
      
      <div className="p-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <img
              src={profilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 shadow-md"
            />
          </div>
          
          <label 
            htmlFor="profile-pic-upload" 
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer flex items-center gap-2"
          >
            <Camera className="w-4 h-4" /> Change Profile Picture
            <input
              id="profile-pic-upload"
              type="file"
              onChange={handleProfilePicChange}
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>
        
        {/* Name Update Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <div className="flex items-center gap-2">
              <input
                id="name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700">
              <Mail className="w-4 h-4 text-gray-500" />
              {user?.email || 'Email not available'}
            </div>
          </div>
          
          <button
            onClick={handleNameChange}
            className={`w-full py-2 px-4 rounded-lg transition-colors cursor-pointer duration-200 flex items-center justify-center gap-2 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            } text-white font-medium`}
            disabled={loading}
          >
            {loading ? 'Updating...' : <><Pencil className="w-4 h-4" /> Update Name</>}
          </button>
        </div>
        
        {/* Status Messages */}
        {message && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg text-green-800">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
