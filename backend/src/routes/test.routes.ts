import express, { Router } from 'express';

const router: Router = express.Router();

// Test endpoint to create some sample queue data for testing
router.post('/test/create-sample-queue', async (req, res) => {
  try {
    // This is a test endpoint - would create some sample approved appointments
    // and then create queue entries for testing
    
    res.status(200).json({
      success: true,
      message: 'Sample queue creation functionality - implement as needed for testing'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create sample queue'
    });
  }
});

export default router;
