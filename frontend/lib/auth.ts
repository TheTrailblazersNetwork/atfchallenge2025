
export function isAuthenticated() {
  // Check if running in browser
  if (typeof window === 'undefined') return false;
  
  // Check for auth token and user data
  const token = localStorage.getItem("authToken");
  const user = localStorage.getItem("user");
  
  // User is authenticated if both token and user data exist
  return !!(token && user);
}

export function logout() {
  // Remove auth data from localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.clear(); // Clear any other auth-related data
}