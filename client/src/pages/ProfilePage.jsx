import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import assets from "../assets/assets";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef();

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  // Show loading if auth is still loading or user is not available
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // You can add file validation here
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = { ...formData };
      
      // Add profile picture if selected
      if (fileInputRef.current.files[0]) {
        updateData.profilePic = fileInputRef.current.files[0];
      }

      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      
      // Clear file input
      fileInputRef.current.value = '';
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative">
      {/* Back Arrow */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 z-10 border border-white/20"
        title="Back to Home"
      >
        <img 
          src={assets.arrow_icon} 
          alt="Back" 
          className="w-6 h-6 rotate-180 filter brightness-0 invert"
        />
      </button>
      
      <div className="w-11/12 max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Form Section */}
          <div className="flex-1 p-8 lg:p-12">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
              <p className="text-gray-300">Update your personal information</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
          
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                  {success}
                </div>
              )}

              {/* Profile Picture Upload */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] group">
                <div className="relative">
                  <img 
                    src={user?.profilePic || assets.avatar_icon} 
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:ring-4 group-hover:ring-purple-400/50"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-400">
                    <span className="text-white text-xs">📷</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="avatar"
                    className="block text-sm font-medium text-white mb-2 transition-colors duration-300 group-hover:text-purple-200"
                  >
                    Profile Picture
                  </label>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    id="avatar" 
                    accept=".png, .jpg, .jpeg" 
                    hidden 
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-purple-300 hover:text-purple-200 text-sm transition-all duration-300 hover:scale-105"
                  >
                    Click to change
                  </button>
                </div>
              </div>

              {/* Full Name Field */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-white transition-colors duration-300 hover:text-purple-200">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <label htmlFor="bio" className="block text-sm font-medium text-white transition-colors duration-300 hover:text-purple-200">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Update Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Profile'
                )}
              </button>
            </form>
          </div>
          
          {/* Profile Preview Section */}
          <div className="lg:w-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-8 lg:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 hover:from-purple-500/30 hover:to-pink-500/30 group">
            <div className="mb-6">
              <img 
                src={user?.profilePic || assets.avatar_icon} 
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:ring-4 group-hover:ring-purple-400/50"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-purple-200">{user?.fullName || 'Your Name'}</h2>
            <p className="text-gray-200 leading-relaxed transition-colors duration-300 group-hover:text-white">{user?.bio || 'Add a bio to tell people about yourself'}</p>
            
            {/* Decorative Elements */}
            <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse transition-all duration-300 group-hover:scale-150"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse transition-all duration-300 group-hover:scale-150" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse transition-all duration-300 group-hover:scale-150" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
