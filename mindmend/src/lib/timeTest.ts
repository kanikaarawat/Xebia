// Simple time conversion test
export function debugTimeConversion() {
  console.log('🧪 Debugging time conversion...');
  
  // Test the specific timestamp that should be 09:00
  const testTimestamp = '2025-07-01T09:00:00.000Z'; // This should be 9 AM UTC
  
  const date = new Date(testTimestamp);
  
  console.log('Original timestamp:', testTimestamp);
  console.log('Date object:', date);
  console.log('ISO string:', date.toISOString());
  console.log('Local string:', date.toLocaleString());
  
  // Test different timezone conversions
  const localTime = date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit'
  });
  
  const utcTime = date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC'
  });
  
  console.log('Local time (no timezone):', localTime);
  console.log('UTC time:', utcTime);
  
  // Test with your timezone offset
  const timezoneOffset = date.getTimezoneOffset();
  console.log('Timezone offset (minutes):', timezoneOffset);
  console.log('Timezone offset (hours):', timezoneOffset / 60);
  
  // Calculate what the time should be in your local timezone
  const localDate = new Date(date.getTime() - (timezoneOffset * 60000));
  console.log('Calculated local time:', localDate.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit'
  }));
  
  return {
    original: testTimestamp,
    local: localTime,
    utc: utcTime,
    offset: timezoneOffset,
    calculated: localDate.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit'
    })
  };
} 