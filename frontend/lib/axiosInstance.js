import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
    withCredentials: true, // Include credentials (cookies) in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in the headers
axiosInstance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        // Check for regular patient auth token
        const token = localStorage.getItem('authToken');
        
        // Check for OPD auth token
        const opdAuth = localStorage.getItem('opdAuth');
        let opdToken = null;
        if (opdAuth) {
            try {
                const opdAuthData = JSON.parse(opdAuth);
                opdToken = opdAuthData.token;
            } catch (error) {
                console.error('Error parsing OPD auth data:', error);
            }
        }
        
        // Use OPD token if available, otherwise use regular token
        const authToken = opdToken || token;
        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;