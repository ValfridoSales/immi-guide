## Goal

Manually revert the project to match the state of commit `1fe342d2` ("Add manual PRO subscription", Nov 3, 2025 8:58 PM), since Lovable's History restore is blocked ("cannot restore this too far in history").

## Approach

Since I can't use the History restore button, I'll do this by diffing the current code against that target commit and rewriting the changed files back to their Nov 3 state.

### Steps

1. **Identify all files changed since the target commit**
   - Run `git diff --name-only 1fe342d2..HEAD` (read-only) to get the full list of files that have been modified, added, or deleted since Nov 3.
   - Share that list with you so you can confirm the scope before any edits.

2. **Read the Nov 3 version of each changed file**
   - For each file, use `git show 1fe342d2:<path>` to capture its exact contents at that commit.

3. **Restore those files**
   - Overwrite each modified file with its Nov 3 contents.
   - Re-create any files that were deleted after Nov 3.
   - Delete any files that were added after Nov 3 (only if they aren't needed independently — I'll confirm with you for anything ambiguous, e.g. new components, new pages, new edge functions).

4. **Handle backend changes carefully**
   - Database migrations and edge functions deploy immediately and cannot be "un-deployed" by reverting code. If any migrations or edge function changes exist since Nov 3, I'll list them separately and ask before touching them — reverting those usually requires a new compensating migration, not a file revert.

5. **Verify**
   - After the revert, check the preview renders correctly and the build passes.
   - Spot-check the Navigation and any other key surfaces against the Nov 3 preview you already have open.

## What I need from you

- Approve switching to build mode so I can run the diff and apply the file rewrites.
- Confirm whether you want me to **also** revert any backend changes (migrations / edge functions) made after Nov 3, or keep those as-is. Your note says changes are "mostly design related," so I'll default to **frontend-only revert** unless you say otherwise.

## Safety note

Before I overwrite anything, I'll show you the list of affected files so you can veto any you want to keep at the current version.
