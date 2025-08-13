"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const opd_controller_1 = require("../controllers/opd.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// OPD Authentication routes
router.post('/signup', opd_controller_1.opdSignup);
router.post('/login', opd_controller_1.opdLogin);
router.post('/logout', authMiddleware_1.authenticateToken, opd_controller_1.opdLogout);
// OPD Patient management routes (protected)
router.get('/patients', authMiddleware_1.authenticateToken, opd_controller_1.getOPDPatients);
router.get('/patients/:id', authMiddleware_1.authenticateToken, opd_controller_1.getOPDPatientById);
exports.default = router;
