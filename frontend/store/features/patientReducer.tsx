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
        state.data = JSON.parse(user);
        state.loading = false;
        state.isAuthenticated = true;
      } else{
        // localStorage.clear(); do nothing
      };
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
    },
  },
});

// Action creators are generated for each case reducer function
export const { setPatientData, getPatientData, clearPatientData, logoutPatient } = patientSlice.actions;

export default patientSlice.reducer;
