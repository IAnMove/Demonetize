# Proposal: push-channel-deletion-obituary

## Why
Channel kills currently play good breakup effects, but the new channel-avatar identity disappears too quickly. The takedown needs a clearer symbolic beat: the channel logo should stand over the deletion point like a brief obituary before fading away.

## What Changes
- Carry the killed channel avatar index through the enemy-killed event.
- Spawn a vertical channel-logo obituary marker at the death position.
- Add a red in-world label with the channel name and `INAUTHENTIC CONTENT`.
- Make the HUD kill notice red and match the verdict wording.
- Keep the effect pooled and short so combat readability remains intact.

## Success Criteria
- Every non-boss channel kill can show its avatar above the ground, then fade.
- The red verdict text is spelled `INAUTHENTIC CONTENT`.
- The effect is visible in debug enemy-FX preview and normal kills.
- Smoke, TypeScript, production build, and browser capture pass.
