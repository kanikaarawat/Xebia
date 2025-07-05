-- Create a test video call appointment
-- Replace 'your_user_id' with your actual user ID from the profiles table

INSERT INTO appointments (
    id,
    patient_id,
    therapist_id,
    scheduled_at,
    duration,
    type,
    notes,
    status,
    created_at,
    updated_at
) VALUES (
    'test-video-appointment-123',
    'your_user_id', -- Replace with your actual user ID
    'your_therapist_id', -- Replace with an actual therapist ID
    NOW() + INTERVAL '1 hour', -- Scheduled 1 hour from now
    60, -- 60 minutes
    'Video Call',
    'Test video call appointment for testing video functionality',
    'upcoming',
    NOW(),
    NOW()
);

-- To find your user ID, run this query:
-- SELECT id, first_name, last_name, email FROM profiles WHERE email = 'your_email@example.com';

-- To find a therapist ID, run this query:
-- SELECT id FROM therapists LIMIT 1; 