# Remaining Balance Risks And Follow-Ups

## Current Risks

- Late boss-test deaths can be attributed to nearby contact or overrun when several hazards hit in the same frame. The current cause inference is useful but not a deterministic combat log.
- Action-card recap tracks cards used during the current app session. Historical last-run records still store only score, wave, time, rank, and result.
- Reduced-motion support now covers camera shake, arena pulses, and CSS transitions, but it has only been checked in Chromium automation.
- The production bundle still triggers Vite's large chunk warning because the whole Three.js game ships as one client bundle.
- Boss phase two remains intentionally punishing with boost-heavy presets; further tuning should use real play sessions, not only forced debug spawns.

## Follow-Up Tasks

- Add a structured `lastDamageSource` field in simulation state if death cause needs exact attribution.
- Persist build recap metadata into run records if the title screen should show the full previous-build breakdown.
- Add one manual browser pass in Firefox or WebKit for reduced-motion and mobile final-panel scrolling.
- Consider code splitting only after jam MVP lock, since current load and build behavior are acceptable for static hosting.
