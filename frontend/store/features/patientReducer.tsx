import { createSlice } from "@reduxjs/toolkit";

export const patientSlice = createSlice({
  name: "patient",
  initialState: {
    data: {
      _id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
    },
    loading: true,
  },
  reducers: {
    setPatientData: (state, action) => {
      const user = action.payload;
      localStorage.setItem("user", JSON.stringify(user));
      state.data = user;
      state.loading = false;
    },
    getPatientData: (state) => {
      const user = localStorage.getItem("user");
      if (user) {
        state.data = JSON.parse(user);
        state.loading = false;
      } else{
        localStorage.clear();
      };
    },
    clearPatientData: (state) => {
      state.data = {
        _id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { setPatientData, getPatientData, clearPatientData } = patientSlice.actions;

export default patientSlice.reducer;
