# Video Call Integration Setup Guide

This guide explains how to set up and use the video call functionality in your MindMend application.

## Overview

The video call system integrates with Daily.co to provide secure, high-quality video calls for therapy sessions. The system includes:

- **Video Call Component**: A React component that handles video calls
- **Room Management**: APIs to create and manage video rooms
- **Admin Dashboard**: Tools to monitor and manage video calls
- **Appointment Integration**: Automatic room creation for video appointments

## Prerequisites

1. **Daily.co Account**: Sign up at [daily.co](https://daily.co)
2. **API Key**: Get your Daily.co API key from the dashboard
3. **Environment Variables**: Configure the required environment variables

## Environment Variables

Add these to your `.env.local` file:

```bash
# Daily.co API Key
DAILY_API_KEY=your_daily_api_key_here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Features

### 1. Video Call Component (`src/components/ui/video-call.tsx`)

A comprehensive video call component with:
- **Real-time video/audio**: Powered by Daily.co
- **Controls**: Mute/unmute, video on/off, leave call
- **Call duration**: Timer showing call length
- **Participant count**: Shows number of people in call
- **Error handling**: Graceful error states
- **Responsive design**: Works on desktop and mobile

### 2. Video Call Page (`src/app/video/[appointmentId]/page.tsx`)

Enhanced video call page with:
- **Authentication**: Verifies user can join the call
- **Role detection**: Determines if user is patient or therapist
- **Time validation**: Only allows joining within allowed time window
- **Appointment validation**: Ensures appointment exists and is video call
- **Status updates**: Automatically marks appointments as completed

### 3. Room Management APIs

#### Get Room URL (`/api/video/room/[appointmentId]`)
- Validates appointment exists and is video call
- Checks if user can join (time window)
- Creates or retrieves Daily.co room
- Returns secure room URL

#### Room Management (`/api/video/rooms`)
- **GET**: List all video rooms
- **POST**: Create new room
- **DELETE**: Delete room

### 4. Admin Dashboard (`/admin/video-calls`)

Admin interface for managing video calls:
- **Room monitoring**: View all active/upcoming/expired rooms
- **Appointment linking**: See which appointments have video rooms
- **Room management**: Delete orphaned or expired rooms
- **Statistics**: Overview of room statuses

## Usage

### For Patients

1. **Book Video Session**: Select "Video Call" when booking appointment
2. **Join Call**: Click "Join Video Call" button in appointments list
3. **Video Interface**: Use controls to manage audio/video
4. **End Call**: Click red phone button to leave

### For Therapists

1. **View Appointments**: See upcoming video calls in dashboard
2. **Join Call**: Click "Join Video Call" button
3. **Conduct Session**: Use video interface for therapy
4. **Complete Session**: Call automatically marks as completed

### For Administrators

1. **Access Admin Panel**: Go to `/admin/video-calls`
2. **Monitor Rooms**: View all video call rooms and their status
3. **Manage Rooms**: Delete expired or orphaned rooms
4. **View Statistics**: See overview of video call usage

## Security Features

### Authentication
- Users must be logged in to join calls
- Role-based access (patient vs therapist)
- Appointment ownership verification

### Time Restrictions
- Only allow joining 15 minutes before appointment
- Allow joining up to 2 hours after appointment
- Prevents unauthorized access outside session time

### Room Security
- Unique room names based on appointment ID
- Automatic room expiration (24 hours)
- Secure room URLs with Daily.co

## Technical Implementation

### Daily.co Integration

The system uses Daily.co's JavaScript SDK for video calls:

```javascript
// Load Daily.co script
const script = document.createElement('script');
script.src = 'https://unpkg.com/@daily-co/daily-js';

// Create call frame
const call = window.DailyIframe.createFrame(container, {
  iframeStyle: { width: '100%', height: '100%' },
  showLeaveButton: false,
  showFullscreenButton: true,
});

// Join call
await call.join(roomUrl);
```

### Room Creation Flow

1. **Appointment Creation**: When video call appointment is created
2. **Room Creation**: API creates Daily.co room with appointment ID
3. **Room Storage**: Room URL stored in Daily.co (not in database)
4. **Access Control**: Users can only access rooms for their appointments

### Error Handling

- **Network errors**: Graceful fallback with error messages
- **Room creation failures**: Appointment creation continues without video
- **Access denied**: Clear error messages for unauthorized access
- **Time restrictions**: Informative messages about call availability

## Configuration Options

### Daily.co Room Properties

```javascript
{
  enable_prejoin_ui: true,    // Show pre-join screen
  enable_chat: true,          // Enable text chat
  enable_recording: 'cloud',  // Enable cloud recording
  exp: timestamp,             // Room expiration
}
```

### Time Windows

```javascript
// Allow joining 15 minutes before and 2 hours after
const canJoinNow = hoursDiff >= -2 && hoursDiff <= 0.25;
```

### Call Duration

- **Timer**: Shows call duration in MM:SS format
- **Auto-completion**: Therapists can mark calls as completed
- **Session tracking**: Track call length for billing/analytics

## Troubleshooting

### Common Issues

1. **"Video service not configured"**
   - Check `DAILY_API_KEY` environment variable
   - Verify Daily.co account is active

2. **"Appointment not found"**
   - Verify appointment ID is correct
   - Check appointment exists in database

3. **"Access denied"**
   - User not logged in
   - User not associated with appointment
   - Outside allowed time window

4. **"Failed to join video call"**
   - Check internet connection
   - Verify browser supports WebRTC
   - Check Daily.co service status

### Debug Steps

1. **Check Environment Variables**
   ```bash
   echo $DAILY_API_KEY
   ```

2. **Test Daily.co API**
   ```bash
   curl -H "Authorization: Bearer $DAILY_API_KEY" \
        https://api.daily.co/v1/rooms
   ```

3. **Check Browser Console**
   - Look for JavaScript errors
   - Verify Daily.co script loads
   - Check network requests

4. **Verify Appointment Data**
   ```sql
   SELECT * FROM appointments WHERE id = 'appointment_id';
   ```

## Future Enhancements

### Planned Features

1. **Recording Management**
   - Download call recordings
   - Secure storage of recordings
   - Patient consent management

2. **Advanced Controls**
   - Screen sharing
   - Virtual backgrounds
   - Call quality indicators

3. **Analytics**
   - Call duration tracking
   - Quality metrics
   - Usage statistics

4. **Integration**
   - Calendar integration
   - Email notifications
   - SMS reminders

### Customization

The video call system is designed to be easily customizable:

- **Styling**: Modify CSS classes in video-call.tsx
- **Features**: Add/remove Daily.co room properties
- **Time windows**: Adjust allowed join times
- **UI**: Customize controls and layout

## Support

For issues with video calls:

1. **Check Daily.co Status**: [status.daily.co](https://status.daily.co)
2. **Review Logs**: Check browser console and server logs
3. **Test Connection**: Verify internet and WebRTC support
4. **Contact Support**: Use the contact form in the app

## Security Notes

- Video calls are encrypted end-to-end
- Room URLs are secure and time-limited
- No video data is stored on your servers
- Daily.co handles all video processing
- Access is restricted by appointment ownership

## Performance

- **Bandwidth**: Video calls use adaptive bitrate
- **Quality**: Automatically adjusts based on connection
- **Mobile**: Optimized for mobile devices
- **Scalability**: Daily.co handles infrastructure scaling 