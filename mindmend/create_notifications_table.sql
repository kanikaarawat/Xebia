-- Notifications table for in-app alerts
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL, -- e.g., 'appointment_rejected', 'reminder', 'password_change'
  title text NOT NULL,
  message text NOT NULL,
  meta jsonb, -- for extra data (appointment id, etc.)
  read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
); 