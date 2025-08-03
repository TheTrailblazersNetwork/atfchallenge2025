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
    loading: true
  },
  reducers: {
    setPatientData: (state, action) => {
      state.data = action.payload;
      state.loading = false;
    },
    // reset patient data to initial state
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
export const { setPatientData, clearPatientData } = patientSlice.actions;

export default patientSlice.reducer;
