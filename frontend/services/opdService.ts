import axiosInstance from "@/lib/axiosInstance";
import system_api from "@/app/data/api";

export const opdPatientService = {
  // Get all patients
  getAllPatients: async () => {
    try {
      const response = await axiosInstance.get(system_api.opd.patients.getAll);
      return response.data.patients || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch patients");
    }
  },

  // Search patients
  searchPatients: async (query: string) => {
    try {
      const response = await axiosInstance.get(
        `${system_api.opd.patients.search}?q=${encodeURIComponent(query)}`
      );
      return response.data.patients || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to search patients");
    }
  },

  // Get patient by ID
  getPatientById: async (id: string) => {
    try {
      const response = await axiosInstance.get(
        `${system_api.opd.patients.getById}${id}`
      );
      return response.data.patient || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch patient");
    }
  },

  // Get patients with filters (client-side filtering for now)
  getPatientsWithFilters: async (filters: any) => {
    try {
      // For now, get all patients and filter client-side
      // In the future, this could be enhanced to send filters to backend
      const response = await axiosInstance.get(system_api.opd.patients.getAll);
      return response.data.patients || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch filtered patients");
    }
  },
};

export const opdAuthService = {
  // OPD Login
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await axiosInstance.post(system_api.opd.login, credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  },

  // OPD Signup
  signup: async (userData: { full_name: string; email: string; phone_number: string; password: string }) => {
    try {
      const response = await axiosInstance.post(system_api.opd.signup, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Signup failed");
    }
  },

  // OPD Logout
  logout: async () => {
    try {
      const response = await axiosInstance.post(system_api.opd.logout);
      localStorage.removeItem("opdAuth");
      return response.data;
    } catch (error: any) {
      // Even if API call fails, clear local storage
      localStorage.removeItem("opdAuth");
      throw new Error(error.response?.data?.error || "Logout failed");
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    try {
      const opdAuth = localStorage.getItem("opdAuth");
      if (opdAuth) {
        const authData = JSON.parse(opdAuth);
        return authData.authenticated && authData.type === "opd" && authData.token;
      }
      return false;
    } catch {
      return false;
    }
  },

  // Get current user data
  getCurrentUser: () => {
    try {
      const opdAuth = localStorage.getItem("opdAuth");
      if (opdAuth) {
        return JSON.parse(opdAuth);
      }
      return null;
    } catch {
      return null;
    }
  },

  // Store auth data
  storeAuthData: (authData: any) => {
    const opdAuthData = {
      ...authData,
      authenticated: true,
      type: "opd",
      timestamp: new Date().getTime()
    };
    localStorage.setItem("opdAuth", JSON.stringify(opdAuthData));
  },
};
