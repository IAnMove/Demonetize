# Remaining Balance Risks And Follow-Ups

## Current Risks

- Reduced-motion support now covers camera shake, arena pulses, and CSS transitions, but it has only been checked in Chromium automation.
- The production bundle still triggers Vite's large chunk warning because the whole Three.js game ships as one client bundle.
- Boss phase two remains intentionally punishing with boost-heavy presets; further tuning should use real play sessions, not only forced debug spawns.

## Follow-Up Tasks

- Completed in `push-exact-death-attribution`: add a structured `lastDamageSource` field in simulation state if death cause needs exact attribution.
- Completed in `push-last-run-build-recap`: persist build recap metadata into run records if the title screen should show the full previous-build breakdown.
- Add one manual browser pass in Firefox or WebKit for reduced-motion and mobile final-panel scrolling.
- Consider code splitting only after jam MVP lock, since current load and build behavior are acceptable for static hosting.
