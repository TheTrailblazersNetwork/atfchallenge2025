import { createSlice } from "@reduxjs/toolkit";

export const patientSlice = createSlice({
  name: "patient",
  initialState: {
    data: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
    },
    loading: true,
    isAuthenticated: false,
  },
  reducers: {
    setPatientData: (state, action) => {
      const user = action.payload;
      localStorage.setItem("user", JSON.stringify(user));
      state.data = user;
      state.loading = false;
      state.isAuthenticated = true;
    },
    getPatientData: (state) => {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          state.data = parsedUser;
          state.loading = false;
          state.isAuthenticated = true;
        } catch (error) {
          // Invalid JSON in localStorage, clear it
          localStorage.removeItem("user");
          state.data = {
            id: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            dateOfBirth: "",
          };
          state.loading = false; // Don't keep loading for new accounts
          state.isAuthenticated = false;
        }
      } else {
        state.data = {
          id: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
        };
        state.loading = false; // Don't keep loading for new accounts
        state.isAuthenticated = false;
        localStorage.removeItem("user");
      }
    },
    clearPatientData: (state) => {
      state.data = {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
      };
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      localStorage.removeItem("appointments");
    },
    logoutPatient: (state) => {
      state.data = {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
      };
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      localStorage.removeItem("appointments");
    },
  },
});

// Action creators are generated for each case reducer function
export const { setPatientData, getPatientData, clearPatientData, logoutPatient } = patientSlice.actions;

export default patientSlice.reducer;
