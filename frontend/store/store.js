import { configureStore } from '@reduxjs/toolkit'
import PatientReducer from './features/patientReducer'
import AppointmentsReducer from './features/appointmentsReducer'
import PatientsReducer from './features/patientsSlice'

export default configureStore({
    reducer: {
        patient: PatientReducer,
        appointments: AppointmentsReducer,
        patients: PatientsReducer
    }
})