# Design: push-neon-rescue-drops

## Runtime Shape
- Rescue targets are lightweight timed pickups, not followers.
- Session state tracks active rescue drops and run totals for saved and lost.
- Render and HUD only visualize the pickup state and pickup outcome.

## Behavior
- Some kills build rescue-drop charge until a pod is released.
- A rescue pod lasts only a few seconds.
- Walking into it secures it; waiting too long loses it.

## UX
- Rescue pods look distinct from healing orbs.
- HUD notifies when a rescue is secured or lost.
- Final panels show saved and lost counts.
