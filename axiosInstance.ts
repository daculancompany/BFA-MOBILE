// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// Create a base Axios instance
const apiClient = axios.create({
  baseURL: 'https://18d9-110-54-207-71.ngrok-free.app/api/', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// Request Interceptor: Add authorization token (if applicable)
apiClient.interceptors.request.use(
  async (config) => {
    // Retrieve token from local storage or other secure place
    const token = await AsyncStorage.getItem('token'); // Use await to get the token

    // If a token is available, add it to the request headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => response, // Simply return the response if successful
  (error) => {
    // Handle specific status codes, e.g., unauthorized or server errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Redirect to login page or handle token expiration logic
          console.error('Unauthorized access. Redirecting to login.');
          break;
        case 500:
          console.error('Internal server error');
          break;
        case 422:
          console.error('Validation error', error.response.data.errors);
          break;
        default:
          console.error('An error occurred', error.response.data);
      }
    }

    return Promise.reject(error);
  }
);

// Fetch personnel data
export const fetchPersonnel = async () => {
  try {
    const response = await apiClient.get('/personnel'); // Adjust endpoint as needed
    return response.data; // Return the personnel data directly
  } catch (error) {
    throw error; // Rethrow the error to handle it in the calling component
  }
};

export default apiClient;
