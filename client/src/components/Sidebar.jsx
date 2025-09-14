import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'
import assets from '../assets/assets'

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiService.getAllUsers();
        setUsers(response.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const response = await apiService.searchUsers(searchQuery);
          setUsers(response.users);
        } catch (error) {
          console.error('Error searching users:', error);
        }
      } else if (searchQuery.trim().length === 0) {
        // Reset to all users when search is cleared
        try {
          const response = await apiService.getAllUsers();
          setUsers(response.users);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    };

    const timeoutId = setTimeout(searchUsers, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl h-full p-5 rounded-r-xl overflow-y-scroll text-white border-r border-white/10 ${selectedUser ? "max-md:hidden" : ''}`}>
      <div className='pb-5'>
        <div className='flex justify-between items-center'>
          <img src={assets.logo} alt='logo' className='max-w-40 transition-transform duration-300 hover:scale-105'/>
          <div className='relative py-2 group'>
            <img src={assets.menu_icon} alt='Menu' className='max-h-5 cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-90'/>
            <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-gray-100 hidden group-hover:block transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'>
              <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm hover:text-purple-300 transition-colors duration-200 py-1 px-2 rounded hover:bg-white/5'>Edit Profile</p>
              <hr className='my-2 border-t border-white/20'/>
              <p onClick={handleLogout} className='cursor-pointer text-sm hover:text-red-300 transition-colors duration-200 py-1 px-2 rounded hover:bg-white/5'>Logout</p>
            </div>
          </div>
        </div>
        <div className='bg-white/5 backdrop-blur-sm rounded-full flex items-center gap-2 py-3 px-4 mt-5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 focus-within:bg-white/10 focus-within:border-purple-400'>
          <img src={assets.search_icon} alt='Search' className='w-3 transition-transform duration-300 group-hover:scale-110'/>
          <input 
            type='text' 
            className='bg-transparent border-none outline-none text-white text-xs placeholder-gray-400 flex-1 transition-all duration-300 focus:placeholder-purple-300' 
            placeholder='Search User...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className='flex flex-col space-y-1'>
        {loading ? (
          <div className="text-center text-gray-400 py-4">
            <div className="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="mt-2">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No users found</div>
        ) : (
          users.map((userItem, index) => (
            <div 
              onClick={() => {setSelectedUser(userItem)}}
              key={userItem._id} 
              className={`relative flex items-center gap-3 p-3 pl-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg group ${
                selectedUser?._id === userItem._id ? 'bg-purple-500/20 border border-purple-400/50' : 'hover:border-white/20'
              }`}
            >
              <div className="relative">
                <img 
                  src={userItem?.profilePic || assets.avatar_icon} 
                  alt='' 
                  className='w-[35px] aspect-[1/1] rounded-full transition-all duration-300 group-hover:scale-110 border-2 border-white/20 group-hover:border-purple-400/50'
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
                  userItem.isOnline ? 'bg-green-400 group-hover:bg-green-300' : 'bg-gray-400'
                }`}></div>
              </div>
              <div className='flex flex-col leading-5 flex-1 min-w-0'>
                <p className="font-medium transition-colors duration-200 group-hover:text-purple-200 truncate">{userItem.fullName}</p>
                <span className={`text-xs transition-colors duration-200 ${
                  userItem.isOnline ? 'text-green-400 group-hover:text-green-300' : 'text-gray-400 group-hover:text-gray-300'
                }`}>
                  {userItem.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              {userItem.unreadCount > 0 && (
                <div className='absolute top-2 right-2 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg'>
                  {userItem.unreadCount}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Sidebar