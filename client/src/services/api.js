const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-railway-backend-url.railway.app/api' 
  : 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove token
  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Get headers with auth token
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    } else {
      console.warn('No token available for API request');
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication API methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.removeToken();
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });

    console.log('Updating profile with token:', this.token ? 'Token present' : 'No token');

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Profile update failed:', data);
      throw new Error(data.message || 'Profile update failed');
    }

    return data;
  }

  // Users API methods
  async getAllUsers() {
    return this.request('/users/all');
  }

  async searchUsers(query) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`);
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async setUserOnline() {
    return this.request('/users/online', {
      method: 'PUT',
    });
  }

  async setUserOffline() {
    return this.request('/users/offline', {
      method: 'PUT',
    });
  }

  // Messages API methods
  async getMessages(userId, page = 1, limit = 50) {
    return this.request(`/messages/${userId}?page=${page}&limit=${limit}`);
  }

  async sendMessage(messageData) {
    const formData = new FormData();
    
    Object.keys(messageData).forEach(key => {
      if (messageData[key] !== null && messageData[key] !== undefined) {
        formData.append(key, messageData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send message');
    }

    return data;
  }

  async markMessageAsSeen(messageId) {
    return this.request(`/messages/${messageId}/seen`, {
      method: 'PUT',
    });
  }

  async getUnreadCount() {
    return this.request('/messages/unread/count');
  }

  async getUnreadCountWithUser(userId) {
    return this.request(`/messages/unread/${userId}`);
  }

  async deleteMessage(messageId) {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
