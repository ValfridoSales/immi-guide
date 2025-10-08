-- Delete incorrect duplicate records from October 2025
-- These are corrupted records with invitations=1 and crs_min=3 that were created during failed sync attempts
DELETE FROM express_entry_draws
WHERE date >= '2025-10-08'
  AND invitations = 1
  AND crs_min = 3;