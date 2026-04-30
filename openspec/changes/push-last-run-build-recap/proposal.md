# Proposal: push-last-run-build-recap

## Why
The run-end panels can explain the build that just happened, but the title screen only had historical score, wave, rank, and result data. That means the player loses the previous build story after returning to the title.

## What Changes
- Persist selected upgrade IDs and used action cards in the last-run record.
- Sanitize persisted upgrade IDs when records load from local storage.
- Reconstruct the last-run build recap on the title screen.
- Keep older records compatible by treating missing metadata as empty.

## Success Criteria
- After a completed run, returning to title can show the previous build line.
- Existing historical records without build metadata still load.
- Smoke coverage protects persisted build metadata.

