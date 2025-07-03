-- Edge Function Schedules for appointment-reminders
-- Save this file and run in Supabase SQL Editor to (re)create all schedules

-- 1. 1-day Reminder (Midnight)
select
  cron.schedule(
    'invoke-appointment-reminders-daily',
    '0 0 * * *', -- every day at midnight
    $$
    select
      net.http_post(
          url:= 'https://faafjjyjbmyuccocjimq.supabase.co/functions/v1/appointment-reminders',
          headers:=jsonb_build_object(
            'Content-type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYWZqanlqYm15dWNjb2NqaW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjM0MDcsImV4cCI6MjA2NjgzOTQwN30.MPyP9cVBrXp8ZasV-N6kTApaGo8ScZG4IEF7LLL0phU'
          ),
          body:=jsonb_build_object('time', now())
      ) as request_id;
    $$
  );

-- 2. 1-hour Reminder
select
  cron.schedule(
    'invoke-appointment-reminders-hourly',
    '0 * * * *', -- every hour
    $$
    select
      net.http_post(
          url:= 'https://faafjjyjbmyuccocjimq.supabase.co/functions/v1/appointment-reminders',
          headers:=jsonb_build_object(
            'Content-type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYWZqanlqYm15dWNjb2NqaW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjM0MDcsImV4cCI6MjA2NjgzOTQwN30.MPyP9cVBrXp8ZasV-N6kTApaGo8ScZG4IEF7LLL0phU'
          ),
          body:=jsonb_build_object('time', now())
      ) as request_id;
    $$
  );

-- 3. 10-min Reminder
select
  cron.schedule(
    'invoke-appointment-reminders-10min',
    '*/10 * * * *', -- every 10 minutes
    $$
    select
      net.http_post(
          url:= 'https://faafjjyjbmyuccocjimq.supabase.co/functions/v1/appointment-reminders',
          headers:=jsonb_build_object(
            'Content-type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYWZqanlqYm15dWNjb2NqaW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjM0MDcsImV4cCI6MjA2NjgzOTQwN30.MPyP9cVBrXp8ZasV-N6kTApaGo8ScZG4IEF7LLL0phU'
          ),
          body:=jsonb_build_object('time', now())
      ) as request_id;
    $$
  );

-- 4. End-of-Day Summary (11:59 PM)
select
  cron.schedule(
    'invoke-appointment-reminders-eod',
    '59 23 * * *', -- every day at 11:59 PM
    $$
    select
      net.http_post(
          url:= 'https://faafjjyjbmyuccocjimq.supabase.co/functions/v1/appointment-reminders',
          headers:=jsonb_build_object(
            'Content-type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYWZqanlqYm15dWNjb2NqaW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjM0MDcsImV4cCI6MjA2NjgzOTQwN30.MPyP9cVBrXp8ZasV-N6kTApaGo8ScZG4IEF7LLL0phU'
          ),
          body:=jsonb_build_object('time', now())
      ) as request_id;
    $$
  ); 