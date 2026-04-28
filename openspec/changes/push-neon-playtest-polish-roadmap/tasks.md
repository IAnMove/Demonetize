# Tasks: push-neon-playtest-polish-roadmap

## Phase 1: Debug Playtest Harness
- [x] 1.1 Add a dev-only panel or keyboard shortcuts for forcing specific boosts, including stacks
- [x] 1.2 Add debug presets for clean baseline, projectile-heavy, dash-heavy, drone/satellite, and boss-test builds
- [x] 1.3 Add wave jump controls for early, mid, late, elite-heavy, and boss encounters
- [x] 1.4 Add deterministic seed or preset capture support for repeatable QA screenshots
- [x] 1.5 Document debug controls in a dev-only surface, not in the player-facing HUD

## Phase 2: Combat Readability Pass
- [x] 2.1 Inventory every enemy attack, projectile, burst, dash, pickup, and boost effect currently visible in combat
- [x] 2.2 Define visual telegraph families for line shots, area blasts, sniper lanes, boss attacks, and elite attacks
- [x] 2.3 Replace remaining generic telegraphs with threat-specific warning shapes and timing
- [x] 2.4 Add a late-run visual budget pass for projectile-heavy builds
- [x] 2.5 Capture desktop and mobile screenshots for calm, mid-pressure, and chaotic combat states

## Phase 3: Boost Balance And Stack Audit
- [x] 3.1 Test each visual boost alone using the debug harness
- [x] 3.2 Test allowed stacks for Arc Splitter, Halo Drone, Starburst Rounds, Nova Dash, Afterimage Trail, Gravity Well, Rail Pierce, and Ricochet Core
- [x] 3.3 Tune damage, fire rate, cooldown, radius, lifetime, targeting, and stack scaling for weak or dominant boosts
- [x] 3.4 Tune audio and VFX intensity so boost identity remains clear without hiding enemy intent
- [x] 3.5 Add QA screenshots for representative boost builds before marking this phase complete

## Phase 4: Enemy Identity Pass
- [x] 4.1 Give each enemy archetype a clearer silhouette, accent color, and movement read
- [x] 4.2 Improve windup, firing, damage, and death feedback per archetype
- [x] 4.3 Make elite variants visually distinct from normal enemies before they attack
- [x] 4.4 Tune enemy VFX so priority targets are readable in crowded fights
- [x] 4.5 Verify enemy identity at desktop and mobile camera scale

## Phase 5: Run Director And Encounter Variety
- [x] 5.1 Define named encounter beats such as swarm, lane pressure, artillery zone, elite escort, pickup chase, and breather
- [x] 5.2 Add authored wave scripts or director weights that combine those beats into readable wave arcs
- [x] 5.3 Prevent back-to-back repetition of the same pressure pattern where possible
- [x] 5.4 Add short recovery windows after major spikes without removing danger
- [x] 5.5 Verify that early, mid, and late runs feel distinct in pacing and threat mix

## Phase 6: Overseer Spectacle Pass
- [x] 6.1 Give each Overseer phase a distinct visual state and attack cadence
- [x] 6.2 Apply the new telegraph language to boss attacks
- [x] 6.3 Improve break-window feedback with clear vulnerability, damage, and recovery cues
- [x] 6.4 Add finale feedback for collapse, victory, and run completion
- [x] 6.5 Verify boss readability with boost-heavy builds active

## Phase 7: Juice And Feel Pass
- [x] 7.1 Audit hitstop, camera shake, bloom, particles, and audio for all core actions
- [x] 7.2 Add or tune feedback for player hits, enemy kills, pickups, dash start/end, card casts, and boost procs
- [x] 7.3 Keep strong feedback short enough that it does not mask lethal telegraphs
- [x] 7.4 Add reduced-motion-compatible behavior for nonessential screen movement
- [x] 7.5 Capture side-by-side QA clips or screenshots for high-impact moments

## Phase 8: One-More-Run Meta
- [x] 8.1 Add post-run build recap with passive stacks, action cards used, strongest boost, and run style
- [x] 8.2 Add clear death or loss reason where the game can infer it
- [x] 8.3 Add near-record and personal-best chase callouts
- [x] 8.4 Add short run objectives that encourage trying different builds or reaching specific waves
- [x] 8.5 Verify post-run copy in EN and ES

## Phase 9: Final Validation
- [x] 9.1 Run `npm run build`
- [x] 9.2 Run `openspec validate push-neon-playtest-polish-roadmap --strict`
- [x] 9.3 Run desktop and mobile browser QA screenshots for title, draft, gameplay, boss, and post-run states
- [x] 9.4 Record remaining balance risks and follow-up tasks before closing the change
