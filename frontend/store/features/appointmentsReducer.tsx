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
      const timestamp = new Date().toISOString();
      localStorage.setItem("appointments", JSON.stringify(appointments));
      localStorage.setItem("appointments_last_updated", new Date().getTime().toString());
      state.data = appointments;
      state.loading = false;
      state.lastUpdated = timestamp;
    },
    getAppointmentsData: (state) => {
      const appointments = localStorage.getItem("appointments");
      if (appointments) {
        try {
          const parsedAppointments = JSON.parse(appointments);
          state.data = parsedAppointments;
          state.loading = false;
        } catch (error) {
          // Invalid JSON in localStorage, clear it
          localStorage.removeItem("appointments");
          state.data = [];
          state.loading = false; // Don't keep loading for new accounts
          state.lastUpdated = null;
        }
      } else {
        state.data = [];
        state.loading = false; // Don't keep loading for new accounts
        state.lastUpdated = null;
        localStorage.removeItem("appointments");
      }
    },
    addAppointment: (state, action) => {
      const newAppointment = action.payload;
      state.data.unshift(newAppointment);
      const timestamp = new Date().toISOString();
      localStorage.setItem("appointments", JSON.stringify(state.data));
      localStorage.setItem("appointments_last_updated", new Date().getTime().toString());
      state.lastUpdated = timestamp;
    },
    updateAppointment: (state, action) => {
      const updatedAppointment = action.payload;
      const index = state.data.findIndex(apt => apt.id === updatedAppointment.id);
      if (index !== -1) {
        state.data[index] = updatedAppointment;
        const timestamp = new Date().toISOString();
        localStorage.setItem("appointments", JSON.stringify(state.data));
        localStorage.setItem("appointments_last_updated", new Date().getTime().toString());
        state.lastUpdated = timestamp;
      }
    },
    removeAppointment: (state, action) => {
      const appointmentId = action.payload;
      state.data = state.data.filter(apt => apt.id !== appointmentId);
      const timestamp = new Date().toISOString();
      localStorage.setItem("appointments", JSON.stringify(state.data));
      localStorage.setItem("appointments_last_updated", new Date().getTime().toString());
      state.lastUpdated = timestamp;
    },
    clearAppointmentsData: (state) => {
      state.data = [];
      state.loading = false; // Set to false instead of true for better UX
      state.lastUpdated = null;
      localStorage.removeItem("appointments");
      localStorage.removeItem("appointments_last_updated");
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
