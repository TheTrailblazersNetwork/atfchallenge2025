const server = {
    remote: "https://atfchallenge2025-backend.vercel.app",
    local: "http://localhost:5000",
}
const host = process.env.NODE_ENV === "production" ? server.remote : server.local;

const system_api = {
    patient: {
        login: `${host}/api/auth/login`,
        signup: `${host}/api/auth/signup`,
        register: `${host}/api/auth/register`,
        getData: `${host}/api/patient/`,
        forgotPassword: `${host}/api/auth/forgot-password`,
        // /:id added to the end of the below URLs
        validateForgotPassword: `${host}/api/auth/reset-password/`,
        resetPassword: `${host}/api/auth/reset-password/`,
        // Resend OTP
        resendOTP: `${host}/api/auth/verify/resend/`,
        // Verification APIs
        mailVerify: `${host}/api/auth/verify/email/`,
        smsVerify: `${host}/api/auth/verify/sms/`,
        // Verification status
        getVerificationStatus: `${host}/api/auth/verify/status/`,
        // Get all patients for OPD
        getAllPatients: `${host}/api/patient/all`,
    },
    appointments: {
        create: `${host}/api/appointments`,
        getAll: `${host}/api/appointments`,
        getById: `${host}/api/appointments/`,  // append appointment ID
        update: `${host}/api/appointments/`,   // append appointment ID
        cancel: `${host}/api/appointments/`,   // append appointment ID
        testBatch: `${host}/api/appointments/test-run-batch`,
    },
    opd: {
        login: `${host}/api/opd/login`,
        signup: `${host}/api/opd/signup`,
        logout: `${host}/api/opd/logout`,
        patients: {
            getAll: `${host}/api/opd/patients`,
            getById: `${host}/api/opd/patients/`,  // append patient ID
            search: `${host}/api/opd/patients`,    // use ?q=query parameter
        },
        queue: {
            getAll: `${host}/api/queue`,
            update: `${host}/api/queue/`,     // append queue ID
            complete: `${host}/api/queue/`,   // append queue ID + '/complete'
        },
    },
};
export default system_api;