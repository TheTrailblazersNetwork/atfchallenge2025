"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const patient_routes_1 = __importDefault(require("./routes/patient.routes"));
const passwordReset_routes_1 = __importDefault(require("./routes/passwordReset.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const opd_routes_1 = __importDefault(require("./routes/opd.routes"));
const queue_routes_1 = __importDefault(require("./routes/queue.routes"));
require("./jobs/batchScheduling.job");
dotenv_1.default.config();
const app = (0, express_1.default)(); // Add explicit type annotation
const PORT = parseInt(process.env.PORT || '5000', 10);
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ENV === "production"
        ? "https://your-production-domain.com"
        : "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/auth', passwordReset_routes_1.default);
app.use('/api/patients', patient_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/opd', opd_routes_1.default);
app.use('/api/queue', queue_routes_1.default);
// Health check route
app.get('/api/health', (req, res) => {
    res.json({ message: 'Backend is live 🚀' });
});
// Database connection
db_1.default.connect()
    .then(() => {
    console.log('✅ Connected to the database');
})
    .catch((err) => {
    console.error('❌ Database connection error:', err);
});
// Start the server
app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});
exports.default = app;
