// API Configuration
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api' 
  : 'https://ai-tripvisor-1.onrender.com/api';

// Utility function for making authenticated API calls
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.dispatchEvent(new CustomEvent('tokenExpired'));
      throw new Error('Authentication token expired');
    }
    
    return response;
  } catch (error) {
    if (error.message === 'Authentication token expired') {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

export default API_BASE_URL; 