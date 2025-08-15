# Queue Management System Implementation

## Overview
This implementation adds a complete queue management system to the NeuroTriage application. The system automatically creates queues from AI-approved appointments and provides a functional OPD dashboard for queue management.

## Backend Implementation

### 1. Queue Service (`src/services/queue.service.ts`)
- **createQueueFromApprovedAppointments()**: Creates queue entries after AI processing
- **getCurrentQueue()**: Gets today's queue with patient information
- **updateQueueEntryStatus()**: Updates patient status in queue
- **getQueueStats()**: Returns queue statistics
- **getNextPatientInQueue()**: Gets the next waiting patient
- **getCurrentPatientBeingServed()**: Gets current patient being served

### 2. Queue Controller (`src/controllers/queue.controller.ts`)
- **getCurrentQueueController**: API endpoint to get current queue
- **updateQueueEntryController**: Update queue entry status
- **getQueueStatsController**: Get queue statistics
- **callNextPatientController**: Move next patient to "in progress"
- **getCurrentPatientController**: Get current patient being served

### 3. Queue Routes (`src/routes/queue.routes.ts`)
- `GET /api/queue` - Get current queue
- `GET /api/queue/stats` - Get queue statistics  
- `GET /api/queue/next` - Get next patient
- `GET /api/queue/current` - Get current patient being served
- `POST /api/queue/call-next` - Call next patient
- `PUT /api/queue/:id` - Update queue entry status

### 4. Authentication Middleware Updates
- Added `authenticateOPDOperator` middleware for OPD-specific routes
- Updated JWT payload type to include `isOPDOperator` flag
- Modified OPD login service to include OPD operator flag in tokens

### 5. Integration with AI Processing
- Queue creation integrated into `aiScheduling.service.ts`
- Queue created after appointment updates but before notifications
- Maintains AI-determined priority order in queue positions

## Frontend Implementation

### 1. Queue Service (`services/queueService.ts`)
- Complete TypeScript service for queue API interactions
- Handles all CRUD operations for queue management
- Proper error handling and type safety

### 2. Updated OPD Dashboard (`app/opd/dashboard/page.tsx`)
- Real-time queue display with 30-second auto-refresh
- Current, next, and upcoming patient sections
- Queue statistics overview
- Patient management actions (complete, mark unavailable)
- Responsive design with loading and error states

### 3. Features
- **Real-time Updates**: Auto-refreshes every 30 seconds
- **Patient Cards**: Display comprehensive patient information
- **Queue Actions**: Call next patient, complete current, mark unavailable
- **Statistics Dashboard**: Overview of queue metrics
- **Error Handling**: Proper error states and retry functionality

## Database Integration

The system uses the existing `opd_queue` table with these fields:
- `id`: Primary key
- `appointment_id`: Reference to appointments table
- `patient_id`: Reference to patients table  
- `queue_position`: Position in queue (determined by AI order)
- `status`: 'approved', 'in_progress', 'completed', 'unavailable'
- `completed_time`: Timestamp when completed
- `created_at`, `updated_at`: Audit fields

## Workflow Integration

1. **AI Processing**: Appointments submitted to TriageAPI
2. **Database Updates**: Appointments table updated with AI results
3. **Queue Creation**: Queue entries created in AI-determined order
4. **Notifications**: Patient notifications sent after queue creation
5. **OPD Management**: Queue managed through OPD dashboard

## API Endpoints

### Queue Management
- `GET /api/queue` - Get current queue (OPD auth required)
- `GET /api/queue/stats` - Get queue statistics (OPD auth required)
- `GET /api/queue/next` - Get next patient (OPD auth required)
- `GET /api/queue/current` - Get current patient (OPD auth required)
- `POST /api/queue/call-next` - Call next patient (OPD auth required)
- `PUT /api/queue/:id` - Update queue status (OPD auth required)

### Authentication
All queue endpoints require OPD operator authentication via JWT token with `isOPDOperator: true`.

## Security Features
- OPD operator authentication required for all queue operations
- Proper input validation on all endpoints
- SQL injection protection through parameterized queries
- Type-safe TypeScript implementation

## Error Handling
- Comprehensive error handling throughout the system
- User-friendly error messages in frontend
- Proper HTTP status codes
- Retry mechanisms for failed operations

## Testing
- Backend TypeScript compilation verified
- All services properly typed and integrated
- Queue creation integrated into existing batch processing workflow

## Future Enhancements
- Real-time WebSocket updates for instant queue changes
- Queue position rearrangement capabilities
- Historical queue analytics
- Patient notification integration with queue status
- Mobile-responsive queue display board

## Files Modified/Created

### Backend
- `src/services/queue.service.ts` (NEW)
- `src/controllers/queue.controller.ts` (NEW)
- `src/routes/queue.routes.ts` (NEW)
- `src/middleware/authMiddleware.ts` (MODIFIED)
- `src/services/aiScheduling.service.ts` (MODIFIED)
- `src/services/opd.service.ts` (MODIFIED)
- `src/types/express/index.d.ts` (MODIFIED)
- `src/Server.ts` (MODIFIED)

### Frontend
- `services/queueService.ts` (NEW)
- `app/opd/dashboard/page.tsx` (COMPLETELY REWRITTEN)

The implementation is complete and ready for testing. The queue system will automatically create queues when the AI batch processing runs, and OPD operators can manage the queue through the dashboard interface.
