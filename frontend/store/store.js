import { configureStore } from '@reduxjs/toolkit'
import PatientReducer from './features/patientReducer'

export default configureStore({
    reducer: {
        patient: PatientReducer
    }
})