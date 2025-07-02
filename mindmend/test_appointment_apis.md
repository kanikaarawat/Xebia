# Appointment API Testing Guide

## API Endpoints Created

### 1. Main Appointments API (`/api/appointments`)

#### GET - List Appointments
```bash
curl "http://localhost:3000/api/appointments?userId=YOUR_USER_ID&status=upcoming&limit=10"
```

#### POST - Create Appointment
```bash
curl -X POST "http://localhost:3000/api/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "USER_ID",
    "therapist_id": "THERAPIST_ID", 
    "scheduled_at": "2024-12-25T10:00:00Z",
    "duration": 60,
    "type": "Video Call",
    "notes": "Initial consultation"
  }'
```

#### PUT - Update Appointment
```bash
curl -X PUT "http://localhost:3000/api/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "APPOINTMENT_ID",
    "scheduled_at": "2024-12-26T14:00:00Z",
    "duration": 90,
    "type": "Video Call",
    "notes": "Rescheduled session"
  }'
```

#### DELETE - Cancel Appointment
```bash
curl -X DELETE "http://localhost:3000/api/appointments?id=APPOINTMENT_ID"
```

### 2. Reschedule API (`/api/appointments/reschedule`)

#### POST - Reschedule Appointment
```bash
curl -X POST "http://localhost:3000/api/appointments/reschedule" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "APPOINTMENT_ID",
    "new_scheduled_at": "2024-12-27T15:00:00Z",
    "new_duration": 60,
    "new_type": "Video Call",
    "notes": "Rescheduled due to conflict"
  }'
```

### 3. Cancel API (`/api/appointments/cancel`)

#### POST - Cancel Appointment
```bash
curl -X POST "http://localhost:3000/api/appointments/cancel" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "APPOINTMENT_ID",
    "reason": "Emergency came up"
  }'
```

#### GET - Get Cancellation Info
```bash
curl "http://localhost:3000/api/appointments/cancel?id=APPOINTMENT_ID"
```

## Features Implemented

### ✅ **Cancel Appointment**
- **24-hour advance notice required**
- **Soft delete** (status changed to "cancelled")
- **Cancellation reason tracking**
- **Automatic unavailability removal**
- **Validation checks**:
  - Cannot cancel completed appointments
  - Cannot cancel past appointments
  - Cannot cancel already cancelled appointments

### ✅ **Reschedule Appointment**
- **Conflict detection** with other appointments
- **Therapist availability validation**
- **Time slot availability checking**
- **Validation checks**:
  - Cannot reschedule completed/cancelled appointments
  - Cannot reschedule past appointments
  - New time must be within therapist's availability

### ✅ **API Features**
- **Comprehensive error handling**
- **Input validation**
- **Conflict resolution**
- **Status management**
- **Audit trail** (updated_at timestamps)

### ✅ **Frontend Integration**
- **Custom hook** (`useAppointments`) for easy integration
- **Action components** with proper UI feedback
- **Loading states** and error handling
- **Success notifications**
- **Confirmation dialogs**

## Database Schema Support

The APIs work with the existing appointments table structure:
```sql
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id),
  therapist_id uuid NOT NULL REFERENCES profiles(id),
  scheduled_at timestamp NOT NULL,
  duration integer DEFAULT 30,
  type text NOT NULL,
  notes text,
  status text DEFAULT 'upcoming',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

## Status Values Supported
- `upcoming` - Scheduled but not yet occurred
- `completed` - Session has been completed
- `cancelled` - Appointment was cancelled
- `no-show` - Patient didn't show up
- `rescheduled` - Appointment was rescheduled

## Testing Checklist

### Cancel Functionality
- [ ] Cancel appointment 24+ hours in advance
- [ ] Try to cancel appointment < 24 hours in advance (should fail)
- [ ] Try to cancel completed appointment (should fail)
- [ ] Try to cancel past appointment (should fail)
- [ ] Cancel with reason (should be saved in notes)

### Reschedule Functionality
- [ ] Reschedule to available time slot
- [ ] Try to reschedule to conflicting time (should fail)
- [ ] Try to reschedule outside therapist availability (should fail)
- [ ] Try to reschedule completed appointment (should fail)

### API Error Handling
- [ ] Test with invalid appointment ID
- [ ] Test with missing required fields
- [ ] Test with invalid date formats
- [ ] Test with non-existent therapist

### Frontend Integration
- [ ] Cancel button appears for upcoming appointments
- [ ] Reschedule button appears for upcoming appointments
- [ ] Success messages display correctly
- [ ] Error messages display correctly
- [ ] Loading states work properly 