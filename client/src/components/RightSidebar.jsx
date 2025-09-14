import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'
import assets from '../assets/assets'

function RightSidebar({ selectedUser }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mediaMessages, setMediaMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch media messages when selectedUser changes
  useEffect(() => {
    const fetchMediaMessages = async () => {
      if (!selectedUser || !user) return;
      
      setLoading(true);
      try {
        const response = await apiService.getMessages(selectedUser._id, 1, 100);
        // Filter messages that have images
        const mediaOnly = response.messages.filter(msg => msg.image);
        setMediaMessages(mediaOnly);
      } catch (error) {
        console.error('Error fetching media messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaMessages();
  }, [selectedUser, user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return selectedUser && (
    <div className={`bg-white/5 backdrop-blur-xl text-white w-full relative overflow-y-scroll border-l border-white/10 ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto px-4'>
        <div className="relative group">
          <img 
            src={selectedUser?.profilePic || assets.avatar_icon} 
            alt='profile' 
            className='w-20 aspect-[1/1] rounded-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:ring-4 group-hover:ring-purple-400/50 shadow-lg'
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2 transition-all duration-300 hover:text-purple-200'>
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
            selectedUser.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          }`}></span>
          {selectedUser.fullName}
        </h1>
        <p className='px-10 mx-auto text-center transition-colors duration-300 hover:text-gray-200'>{selectedUser.bio}</p>
      </div>

      <hr className='border-white/20 my-4 mx-4'/>

      <div className='px-5 text-xs'>
        <p className="font-medium text-white mb-3 transition-colors duration-300 hover:text-purple-200">Media ({mediaMessages.length})</p>
        {loading ? (
          <div className="text-center text-gray-400 py-4">
            <div className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
            <p>Loading media...</p>
          </div>
        ) : mediaMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No media shared</div>
        ) : (
          <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-3'>
            {mediaMessages.map((msg, index) => (
              <div 
                key={msg._id || index} 
                onClick={() => window.open(msg.image)} 
                className='cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-purple-400/50 group'
              >
                <div className="relative">
                  <img 
                    src={msg.image} 
                    alt={`Media ${index + 1}`} 
                    className='w-full h-20 object-cover transition-all duration-300 group-hover:brightness-110'
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">View</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button 
        onClick={handleLogout}
        className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none text-sm font-medium py-3 px-8 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95'
      >
        Logout
      </button>
    </div>
  )
}

export default RightSidebar