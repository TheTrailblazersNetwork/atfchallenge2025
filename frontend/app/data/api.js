const server = {
    remote: "https://ourbackend.com",
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
    },
};
export default system_api;