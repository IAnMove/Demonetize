# Proposal: push-channel-avatar-mode-tests

## Why
Channel avatars on living enemies may be too noisy, but the final placement should be chosen visually rather than guessed. The project needs a fast way to compare the three likely options: vertical over enemies, flat under enemies, and hidden until death.

## What Changes
- Add the second generated channel-avatar atlas as an optimized web asset.
- Expand channel identity selection across both 10x10 atlases.
- Add a DEV-only channel-avatar mode selector: `Top`, `Floor`, and `Off`.
- Keep the deletion obituary effect independent from the living-enemy mode.

## Success Criteria
- New channels can be selected from either atlas.
- The DEV panel can switch living-enemy avatars between top, floor, and hidden modes without reload.
- Death obituary markers still show channel avatars even when living-enemy avatars are hidden.
- Smoke, TypeScript, build, and browser screenshots pass.
