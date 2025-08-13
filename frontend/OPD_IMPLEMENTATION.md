# OPD (Outpatient Department) Implementation

## Overview
This implementation provides a complete OPD system with authentication, patient management, and queue dashboard functionality.

## Routes Structure

### Public Routes
- `/opd` - Main OPD page (redirects to dashboard if authenticated, otherwise to login)
- `/opd/login` - OPD staff login page
- `/opd/signup` - OPD staff registration page
- `/opd/forgot-password` - Password reset for OPD staff

### Protected Routes (Requires OPD Authentication)
- `/opd/dashboard` - Queue Dashboard (placeholder for future queue management)
- `/opd/patients` - Patient Records with full CRUD operations and filtering

## Features Implemented

### 1. Authentication System
- **Login**: Email/password authentication for OPD staff
- **Signup**: Registration for new OPD staff members
- **Forgot Password**: Password reset functionality
- **Auth Guard**: Protects dashboard routes from unauthorized access
- **Logout**: Clears authentication and redirects to login

### 2. Patient Records Management (`/opd/patients`)
- **Redux Integration**: Full state management with patients slice
- **API Integration**: Connected to backend patient endpoints
- **Advanced Filtering**:
  - Search by name, email, or phone
  - Filter by status (active, inactive, pending)
  - Filter by gender (male, female, other)
  - Filter by age range (0-18, 19-35, 36-50, 51+)
  - Filter by registration date (today, week, month, year)
- **Pagination**: Configurable items per page (10, 25, 50, 100)
- **Real-time Stats**: Total patients, filtered results, new today, active patients
- **Responsive Design**: Mobile-friendly table and filters

### 3. Queue Dashboard (`/opd/dashboard`)
- **Placeholder Implementation**: Ready for future queue management features
- **Statistics Cards**: Placeholder metrics for queue monitoring
- **Future-Ready**: Structure in place for real-time queue updates

### 4. Sidebar Navigation
- **Clean Interface**: Only essential navigation items
- **Queue Dashboard**: Homepage for OPD operations
- **Patient Records**: Direct access to patient management
- **Removed Items**: Notifications, Medical Notes, Settings (as requested)

## Redux Store Structure

### Patients Slice (`/store/features/patientsSlice.js`)
```javascript
State: {
  allPatients: [],        // All patients from API
  filteredPatients: [],   // Filtered results
  selectedPatient: null,  // Currently selected patient
  loading: boolean,       // Loading state
  error: string|null,     // Error messages
  filters: {              // Filter options
    search: "",
    status: "all",
    ageRange: "all", 
    gender: "all",
    dateRange: "all"
  },
  pagination: {           // Pagination state
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  }
}

Actions:
- fetchAllPatients()     // Async thunk to get all patients
- searchPatients()       // Async thunk to search patients
- fetchPatientById()     // Async thunk to get patient details
- setFilters()           // Update filter criteria
- clearFilters()         // Reset all filters
- setCurrentPage()       // Update current page
- setItemsPerPage()      // Update items per page
- applyFilters()         // Apply current filters to data
```

## API Endpoints Added (`/app/data/api.js`)

### OPD Specific Endpoints
```javascript
opd: {
  login: `${host}/api/auth/opd/login`,
  signup: `${host}/api/auth/opd/signup`,
  patients: {
    getAll: `${host}/api/patient/all`,
    getById: `${host}/api/patient/`,     // append patient ID
    search: `${host}/api/patient/search`,
  },
  queue: {
    getAll: `${host}/api/queue`,
    update: `${host}/api/queue/`,        // append queue ID
  },
}
```

### Enhanced Patient Endpoints
```javascript
patient: {
  // ... existing endpoints ...
  getAllPatients: `${host}/api/patient/all`,  // For OPD use
}
```

## Components Created

### Pages
- `app/opd/page.tsx` - Main OPD redirect page
- `app/opd/login/page.tsx` - OPD login form
- `app/opd/signup/page.tsx` - OPD registration form  
- `app/opd/forgot-password/page.tsx` - Password reset form
- `app/opd/dashboard/page.tsx` - Queue dashboard (placeholder)
- `app/opd/patients/page.tsx` - Full patient management interface

### Layouts
- `app/opd/dashboard/layout.tsx` - Dashboard layout with sidebar and auth
- `app/opd/patients/layout.tsx` - Patients layout with sidebar and auth

### Components
- `components/OPDAuthGuard.tsx` - Authentication guard for protected routes
- `components/ui/table.tsx` - Table component for patient data display
- `components/ui/opdsidebar.tsx` - Updated OPD sidebar (cleaned up navigation)

## Key Features of Patient Records

### Filtering System
1. **Text Search**: Search across name, email, and phone fields
2. **Status Filter**: Active, Inactive, Pending patients
3. **Demographics**: Filter by gender and age ranges
4. **Date Filters**: Registration date filtering
5. **Real-time**: Filters apply immediately without API calls

### Data Display
1. **Responsive Table**: Shows patient information clearly
2. **Status Badges**: Visual status indicators
3. **Age Calculation**: Automatic age calculation from DOB
4. **Date Formatting**: Consistent date display
5. **Pagination**: Easy navigation through large datasets

### Performance Features
1. **Client-side Filtering**: Fast filtering without server requests
2. **Memoized Calculations**: Optimized re-renders
3. **Configurable Pagination**: Adjustable page sizes
4. **Loading States**: Clear feedback during API calls

## Usage Instructions

### For Development
1. Navigate to `/opd/login` to access the OPD system
2. Use the signup form to create OPD staff accounts
3. Once logged in, access:
   - Queue Dashboard: `/opd/dashboard` (placeholder)
   - Patient Records: `/opd/patients` (fully functional)

### For Patient Records
1. The system loads all patients on page load
2. Use the search bar for quick patient lookup
3. Apply multiple filters simultaneously
4. Adjust pagination as needed
5. All filtering happens client-side for fast response

## Future Enhancements Ready
1. **Queue Management**: Dashboard structure ready for real-time queue features
2. **Real-time Updates**: WebSocket integration points identified
3. **Advanced Patient Operations**: CRUD operations structure in place
4. **Reporting**: Stats framework ready for expansion

## Backend Requirements
The frontend expects these backend endpoints to be available:
- `GET /api/patient/all` - Returns all patients
- `GET /api/patient/search?q=query` - Search patients  
- `GET /api/patient/:id` - Get patient by ID
- `POST /api/auth/opd/login` - OPD staff login
- `POST /api/auth/opd/signup` - OPD staff registration

Note: Authentication endpoints are placeholders and need backend implementation.
