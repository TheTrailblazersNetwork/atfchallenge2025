import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";
import system_api from "@/app/data/api";

// Async thunk for fetching all patients
export const fetchAllPatients = createAsyncThunk(
  "patients/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(system_api.opd.patients.getAll);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch patients");
    }
  }
);

// Async thunk for searching patients
export const searchPatients = createAsyncThunk(
  "patients/search",
  async (searchQuery, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${system_api.opd.patients.search}?q=${encodeURIComponent(searchQuery)}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to search patients");
    }
  }
);

// Async thunk for fetching patient by ID
export const fetchPatientById = createAsyncThunk(
  "patients/fetchById",
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${system_api.opd.patients.getById}${patientId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch patient");
    }
  }
);

export const patientsSlice = createSlice({
  name: "patients",
  initialState: {
    allPatients: [],
    filteredPatients: [],
    selectedPatient: null,
    loading: false,
    error: null,
    filters: {
      search: "",
      status: "all", // all, active, inactive
      ageRange: "all", // all, 0-18, 19-35, 36-50, 51+
      gender: "all", // all, male, female, other
      dateRange: "all", // all, today, week, month, year
    },
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 0,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filtering
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        status: "all",
        ageRange: "all",
        gender: "all",
        dateRange: "all",
      };
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1; // Reset to first page
    },
    applyFilters: (state) => {
      let filtered = [...state.allPatients];
      
      // Apply search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(patient => 
          patient.first_name?.toLowerCase().includes(searchLower) ||
          patient.last_name?.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.phone_number?.includes(state.filters.search)
        );
      }
      
      // Apply status filter
      if (state.filters.status !== "all") {
        filtered = filtered.filter(patient => 
          patient.status === state.filters.status
        );
      }
      
      // Apply gender filter
      if (state.filters.gender !== "all") {
        filtered = filtered.filter(patient => 
          patient.gender?.toLowerCase() === state.filters.gender
        );
      }
      
      // Apply age range filter
      if (state.filters.ageRange !== "all") {
        filtered = filtered.filter(patient => {
          if (!patient.date_of_birth) return false;
          
          const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
          
          switch (state.filters.ageRange) {
            case "0-18":
              return age >= 0 && age <= 18;
            case "19-35":
              return age >= 19 && age <= 35;
            case "36-50":
              return age >= 36 && age <= 50;
            case "51+":
              return age >= 51;
            default:
              return true;
          }
        });
      }
      
      // Apply date range filter (registration date)
      if (state.filters.dateRange !== "all") {
        const now = new Date();
        filtered = filtered.filter(patient => {
          if (!patient.created_at) return false;
          
          const patientDate = new Date(patient.created_at);
          
          switch (state.filters.dateRange) {
            case "today":
              return patientDate.toDateString() === now.toDateString();
            case "week":
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return patientDate >= weekAgo;
            case "month":
              const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
              return patientDate >= monthAgo;
            case "year":
              const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
              return patientDate >= yearAgo;
            default:
              return true;
          }
        });
      }
      
      state.filteredPatients = filtered;
      state.pagination.totalItems = filtered.length;
      state.pagination.totalPages = Math.ceil(filtered.length / state.pagination.itemsPerPage);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all patients
      .addCase(fetchAllPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPatients.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we get the patients array from the response
        const patients = action.payload.patients || action.payload || [];
        state.allPatients = Array.isArray(patients) ? patients : [];
        state.filteredPatients = Array.isArray(patients) ? patients : [];
        state.pagination.totalItems = Array.isArray(patients) ? patients.length : 0;
        state.pagination.totalPages = Math.ceil((Array.isArray(patients) ? patients.length : 0) / state.pagination.itemsPerPage);
      })
      .addCase(fetchAllPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search patients
      .addCase(searchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we get the patients array from the response
        const patients = action.payload.patients || action.payload || [];
        state.filteredPatients = Array.isArray(patients) ? patients : [];
        state.pagination.totalItems = Array.isArray(patients) ? patients.length : 0;
        state.pagination.totalPages = Math.ceil((Array.isArray(patients) ? patients.length : 0) / state.pagination.itemsPerPage);
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch patient by ID
      .addCase(fetchPatientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentPage,
  setItemsPerPage,
  applyFilters,
  clearError,
} = patientsSlice.actions;

export default patientsSlice.reducer;
