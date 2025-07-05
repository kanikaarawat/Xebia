-- Add payment-related fields to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount INTEGER,
ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10) DEFAULT 'INR';

-- Add index for payment queries
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_payment_id ON appointments(payment_id);

-- Update existing appointments to have pending payment status
UPDATE appointments 
SET payment_status = 'pending' 
WHERE payment_status IS NULL; 