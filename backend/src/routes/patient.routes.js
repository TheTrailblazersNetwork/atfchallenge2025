"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const patient_service_1 = require("../services/patient.service");
const appointment_service_1 = require("../services/appointment.service");
const router = express_1.default.Router();
// Protected route - requires authentication
router.get('/profile', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (typeof patientId !== 'string') {
        return res.status(400).json({ message: 'Invalid patient ID' });
    }
    const patientData = yield (0, patient_service_1.getPatientProfile)(patientId);
    if (!patientData) {
        return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json({
        message: 'Patient profile accessed successfully',
        patient: {
            id: patientData.id,
            email: patientData.email,
            first_name: patientData.first_name,
            last_name: patientData.last_name,
            phone_number: patientData.phone_number,
            preferred_contact: patientData.preferred_contact,
            gender: patientData.gender,
            dob: patientData.dob,
        }
    });
    // Route to get patient profile and appointments
    router.get('/master/:id', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const [patientProfile, appointments] = yield Promise.all([
                (0, patient_service_1.getPatientProfile)(id),
                (0, appointment_service_1.getPatientAppointments)(id),
            ]);
            if (!patientProfile) {
                return res.status(404).json({ message: 'Patient profile not found' });
            }
            res.json({
                message: 'Patient profile and appointments retrieved successfully',
                patient: patientProfile,
                appointments: appointments
            });
        }
        catch (error) {
            console.error('Error fetching master patient data:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
}));
exports.default = router;
