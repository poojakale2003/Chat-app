import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import socketService from "../services/socket";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";

function ChatContainer({ selectedUser, setSelectedUser }) {
  const scrollEnd = useRef();
  const fileInputRef = useRef();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      
      // Set up polling as fallback if socket doesn't work
      const pollInterval = setInterval(() => {
        fetchMessages();
      }, 10000); // Poll every 10 seconds (reduced frequency)
      
      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [selectedUser]);

  // Scroll to bottom when messages change, but only if user is near bottom
  useEffect(() => {
    const chatContainer = document.querySelector('.overflow-scroll');
    if (chatContainer) {
      const isNearBottom = chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight - 100;
      
      // Only auto-scroll if user is near the bottom (within 100px)
      if (isNearBottom || messages.length <= 10) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    }
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (selectedUser && user) {
      console.log('🔧 Setting up socket listeners for conversation between:', user._id, 'and', selectedUser._id);
      
      // Listen for new messages
      const handleReceiveMessage = (message) => {
        console.log('📨 Received message:', message);
        console.log('📨 Message senderId:', message.senderId, 'receiverId:', message.receiverId);
        console.log('📨 Current user:', user._id, 'selected user:', selectedUser._id);
        
        // Check if this message is for the current conversation
        const isForCurrentConversation = (
          (message.senderId === selectedUser._id && message.receiverId === user._id) ||
          (message.senderId === user._id && message.receiverId === selectedUser._id)
        );
        
        if (isForCurrentConversation) {
          console.log('✅ Adding message to current conversation');
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg._id === message._id);
            if (!exists) {
              console.log('✅ Message added to state');
              return [...prev, message];
            } else {
              console.log('⚠️ Message already exists, skipping');
            }
            return prev;
          });
        } else {
          console.log('❌ Message not for current conversation, ignoring');
        }
      };

      // Listen for message sent confirmation
      const handleMessageSent = (message) => {
        console.log('✅ Message sent confirmation:', message);
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg._id === message._id);
          if (!exists) {
            console.log('✅ Sent message added to state');
            return [...prev, message];
          }
          return prev;
        });
      };

      // Listen for typing indicators
      const handleUserTyping = (data) => {
        console.log('⌨️ Received typing indicator:', data);
        if (data.senderId === selectedUser._id) {
          setTypingUser(data.senderId);
          setIsTyping(data.isTyping);
          
          if (data.isTyping) {
            setTimeout(() => {
              setIsTyping(false);
              setTypingUser(null);
            }, 3000);
          }
        }
      };

      // Listen for errors
      const handleError = (error) => {
        console.error('❌ Socket error:', error);
      };

      // Add listeners
      socketService.onReceiveMessage(handleReceiveMessage);
      socketService.onMessageSent(handleMessageSent);
      socketService.onUserTyping(handleUserTyping);
      socketService.onError(handleError);

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up socket listeners');
        socketService.removeAllListeners();
      };
    }
  }, [selectedUser, user]);

  const fetchMessages = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const response = await apiService.getMessages(selectedUser._id);
      setMessages(response.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
  };

  // Helper function to get file icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return '📄';
    
    const type = fileType.toLowerCase();
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return '📦';
    if (type.includes('text')) return '📄';
    return '📄';
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      receiverId: selectedUser._id,
      text: newMessage.trim()
    };

    console.log('📤 Sending message:', messageData);
    console.log('📤 Socket connected:', socketService.getConnectionStatus());

    try {
      // Try Socket.io first
      if (socketService.getConnectionStatus()) {
        console.log('📤 Sending via Socket.io');
        socketService.sendMessage(messageData);
      } else {
        console.log('📤 Socket not connected, sending via HTTP API');
        await apiService.sendMessage(messageData);
      }
      
      setNewMessage("");
      console.log('📤 Message sent');
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedUser) {
      socketService.sendTyping(selectedUser._id, true);
      
      // Stop typing indicator after 2 seconds
      setTimeout(() => {
        socketService.sendTyping(selectedUser._id, false);
      }, 2000);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;

    console.log('📁 Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please select a file smaller than 10MB.');
      e.target.value = '';
      return;
    }

    try {
      // Upload file via HTTP API
      const messageData = {
        receiverId: selectedUser._id,
        file: file
      };

      console.log('📁 Sending file data:', messageData);
      console.log('📁 File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const response = await apiService.sendMessage(messageData);
      console.log('📁 File uploaded successfully:', response);
      
      // Clear the file input
      e.target.value = '';
      
      // Refresh messages to show the new file
      fetchMessages();
      
    } catch (error) {
      console.error('❌ Error sending file:', error);
      console.error('❌ Error details:', error.message);
      alert(`Failed to send file: ${error.message}`);
    }
  };

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* --------header---------- */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-white/10">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="profile"
          className="w-8 rounded-full transition-all duration-300 hover:scale-110 hover:ring-2 hover:ring-purple-400/50"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
            selectedUser.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          }`}></span>
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="arrow"
          className="md:hidden max-w-7 cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-90 filter brightness-0 invert"
        />
        <img
          src={assets.help_icon}
          alt="help"
          className="max-md:hidden max-w-5 cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-12 filter brightness-0 invert"
        />
      </div>

      {/* --------chat section---------- */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-scroll p-3 pb-6">
        {messages.map((msg, index) => {
          // Handle both object and string senderId
          const senderId = msg.senderId && typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
          const isSender = String(senderId) === String(user._id);
          
          console.log('Debug - senderId:', senderId, 'user._id:', user._id, 'isSender:', isSender);
          
          return (
            <div key={msg._id || index} className={`mb-2 flex ${isSender ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[80%] ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className="text-center text-xs flex-shrink-0">
                  <img
                    src={
                      isSender 
                        ? user.profilePic || assets.avatar_icon
                        : selectedUser.profilePic || assets.avatar_icon
                    }
                    alt=""
                    className="w-7 rounded-full transition-all duration-300 hover:scale-110 hover:ring-2 hover:ring-purple-400/50"
                  />
                  <p className="text-gray-500 transition-colors duration-200 hover:text-gray-300">
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
                
                {/* Message */}
                <div className="flex-shrink-0">
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt="image"
                      className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    />
                  ) : msg.file ? (
                    <div className={`p-3 max-w-[250px] rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-purple-400/50 ${
                      isSender ? "rounded-br-none" : "rounded-bl-none"
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center transition-all duration-300 hover:bg-white/30 hover:scale-110">
                          {getFileIcon(msg.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{msg.fileName}</p>
                          <p className="text-xs opacity-70">{formatFileSize(msg.fileSize)}</p>
                        </div>
                      </div>
                      <a 
                        href={msg.file} 
                        download={msg.fileName}
                        className="block mt-2 text-xs bg-white/20 rounded px-2 py-1 text-center hover:bg-white/30 transition-all duration-300 hover:scale-105"
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <p
                      className={`p-2 md:text-sm font-light rounded-lg break-all bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        isSender ? "rounded-br-none" : "rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {isTyping && typingUser === selectedUser._id && (
          <div className="flex items-end gap-2 justify-start">
            <div className="text-center text-xs">
              <img
                src={selectedUser.profilePic || assets.avatar_icon}
                alt=""
                className="w-7 rounded-full"
              />
            </div>
            <div className="p-2 bg-violet-500/30 text-white rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={scrollEnd}></div>
      </div>

      {/*------------- bottom area------------*/}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-gradient-to-t from-slate-900/50 to-transparent backdrop-blur-sm">
        <div className="flex-1 flex items-center bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 focus-within:bg-white/10 focus-within:border-purple-400">
          <input 
            type="text" 
            placeholder="Send a message" 
            className="flex-1 text-sm p-2 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent transition-all duration-300 focus:placeholder-purple-300"
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
          />
          <input 
            ref={fileInputRef}
            type="file" 
            id="file" 
            accept="*/*" 
            hidden
            onChange={handleFileUpload}
          />
          <label htmlFor="file" className="cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-12">
            <img src={assets.gallery_icon} alt="file upload" className="w-5 mr-2 filter brightness-0 invert"/>
          </label>
        </div>
        <button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <img 
            src={assets.send_button} 
            alt="send button" 
            className="w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:rotate-12 cursor-pointer"
          />
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="logo" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
}

export default ChatContainer;
