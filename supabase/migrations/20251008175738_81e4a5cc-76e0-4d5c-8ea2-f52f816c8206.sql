-- Enable pg_cron extension for scheduling tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the sync-express-entry function to run every 6 hours
-- Runs at 00:00, 06:00, 12:00, and 18:00 daily
SELECT cron.schedule(
  'sync-express-entry-draws',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://ulwatxrssexhbxuhapbb.supabase.co/functions/v1/sync-express-entry',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsd2F0eHJzc2V4aGJ4dWhhcGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NjY2MzcsImV4cCI6MjA3MzA0MjYzN30.Vd6UM-XZs3lRC-kt2lPKhdI7WARyN-tPdev06h2uJRY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);