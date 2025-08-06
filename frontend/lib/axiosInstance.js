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
    if (typeof document !== 'undefined') {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (token) {
            const tokenValue = token.split('=')[1]; // Extract the token value
            config.headers['Cookie'] = `token=${tokenValue}`; // Set the Cookie header
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;