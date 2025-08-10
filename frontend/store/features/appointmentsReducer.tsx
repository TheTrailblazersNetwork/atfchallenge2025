import { createSlice } from "@reduxjs/toolkit";
import { AppointmentCardType } from "@/types/Appointment";

export const appointmentsSlice = createSlice({
  name: "appointments",
  initialState: {
    data: [] as AppointmentCardType[],
    loading: true,
    lastUpdated: null as string | null,
  },
  reducers: {
    setAppointmentsData: (state, action) => {
      const appointments = action.payload;
      localStorage.setItem("appointments", JSON.stringify(appointments));
      state.data = appointments;
      state.loading = false;
      state.lastUpdated = new Date().toISOString();
    },
    getAppointmentsData: (state) => {
      const appointments = localStorage.getItem("appointments");
      if (appointments) {
        state.data = JSON.parse(appointments);
        state.loading = false;
      }
    },
    addAppointment: (state, action) => {
      const newAppointment = action.payload;
      state.data.unshift(newAppointment);
      localStorage.setItem("appointments", JSON.stringify(state.data));
      state.lastUpdated = new Date().toISOString();
    },
    updateAppointment: (state, action) => {
      const updatedAppointment = action.payload;
      const index = state.data.findIndex(apt => apt.id === updatedAppointment.id);
      if (index !== -1) {
        state.data[index] = updatedAppointment;
        localStorage.setItem("appointments", JSON.stringify(state.data));
        state.lastUpdated = new Date().toISOString();
      }
    },
    removeAppointment: (state, action) => {
      const appointmentId = action.payload;
      state.data = state.data.filter(apt => apt.id !== appointmentId);
      localStorage.setItem("appointments", JSON.stringify(state.data));
      state.lastUpdated = new Date().toISOString();
    },
    clearAppointmentsData: (state) => {
      state.data = [];
      state.loading = true;
      state.lastUpdated = null;
      localStorage.removeItem("appointments");
    },
    setAppointmentsLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { 
  setAppointmentsData, 
  getAppointmentsData, 
  addAppointment,
  updateAppointment,
  removeAppointment,
  clearAppointmentsData,
  setAppointmentsLoading
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
