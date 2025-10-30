-- Unschedule the old sync job that doesn't send alerts
SELECT cron.unschedule('sync-express-entry-draws');

-- Schedule the new v2 function to run every 6 hours (includes email alerts)
SELECT cron.schedule(
  'sync-express-entry-draws-v2',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://ulwatxrssexhbxuhapbb.supabase.co/functions/v1/sync-express-entry-v2',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsd2F0eHJzc2V4aGJ4dWhhcGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NjY2MzcsImV4cCI6MjA3MzA0MjYzN30.Vd6UM-XZs3lRC-kt2lPKhdI7WARyN-tPdev06h2uJRY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);