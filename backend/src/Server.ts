import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db'; 
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import passwordResetRoutes from './routes/passwordReset.routes'; 
import appointementRoutes from './routes/appointment.routes';
import './jobs/batchScheduling.job'; 

dotenv.config();

const app: Express = express(); // Add explicit type annotation
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(
  cors({
    origin:
      process.env.CORS_ENV === "production"
        ? "https://your-production-domain.com"
        : "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes); 
app.use('/api/patients', patientRoutes); 
app.use('/api/appointments', appointementRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is live 🚀' });
});

// Database connection
pool.connect()
  .then(() => {
    console.log('✅ Connected to the database');
  })
  .catch((err: Error) => {
    console.error('❌ Database connection error:', err);
  });
    
// Start the server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

export default app;