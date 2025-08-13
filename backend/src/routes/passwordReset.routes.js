"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passwordReset_controller_1 = require("../controllers/passwordReset.controller");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// Flexible password reset - accepts email or phone
router.post('/forgot-password', (0, validation_1.validate)(validation_1.forgotPasswordValidation), passwordReset_controller_1.forgotPassword);
// Validate reset token
router.get('/reset-password/:token', [
    (0, express_validator_1.param)('token').notEmpty().withMessage('Token is required')
], passwordReset_controller_1.validateToken);
// Reset password with token
router.post('/reset-password/:token', [
    (0, express_validator_1.param)('token').notEmpty().withMessage('Token is required')
], (0, validation_1.validate)(validation_1.resetPasswordValidation), passwordReset_controller_1.resetUserPassword);
exports.default = router;
