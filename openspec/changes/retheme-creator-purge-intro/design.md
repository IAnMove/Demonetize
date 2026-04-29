# Design: retheme-creator-purge-intro

## Narrative Frame
Working title: `AUTHENTICITY PURGE`.

The game takes place inside a parody video platform during a 2026 automated moderation collapse.
The purge was created to remove mass-produced fake content, cloned channels, recycled scripts, and bot engagement.
It succeeds too well, then turns indiscriminate: authentic creators, small communities, archives, and human mistakes are all marked for deletion.

The player is one remaining creator-signal fighting through the purge to preserve real human channels.

## Brand Safety
Use parody names and system terms rather than a direct real platform:
- Platform: `Youtbe`, `The Tube`, `ViewGrid`, or `The Feed`
- Boss: `The Algorithm`, `Authenticity Engine`, or `Purge Core`
- Crisis: `The Authenticity Purge`

Avoid statements that read as factual claims about a real company.
Use the real-world anxiety as inspiration, not as literal exposition.

## Lore Mapping
- `OVERSEER` -> `THE ALGORITHM` or `AUTHENTICITY ENGINE`
- Drones -> recycled-content bots
- Chargers -> strike hunters
- Ranged threats -> claim scanners or Content-ID lances
- Relays -> bot amplification nodes
- Artillery -> mass-report sweeps
- Arena purge lanes -> deletion sweeps
- Orbs -> community signal, watchtime, trust fragments
- Rescue pickups -> creators under appeal
- Upgrades -> authenticity proofs, community backing, human review, collab shields
- Action cards -> emergency appeals, repair statements, signal floods
- Victory -> restoration wave / human review breakthrough
- Defeat -> termination notice / appeal denied

## Intro Cinematic
Add a pre-title `intro` state:
- boot -> intro -> title
- intro can be skipped by click, Enter, Space, or Escape
- first visit in a fresh session shows intro; restart does not
- reduced-motion mode uses fade/slide instead of aggressive perspective scroll

The intro should be one paragraph stored in a dedicated narrative config or i18n entry.
The visual direction is cinematic text emerging from darkness, not a direct clone of any specific film crawl.

## Draft Intro Copy
Year 2026. The Feed broke under the weight of manufactured voices: stolen scripts, cloned channels, faces without faces, machines begging machines for attention. So the Algorithm awakened to separate the real from the fake, and the purge began. But the blade learned only deletion. Now the spaces where people create, fail, learn, and become known are vanishing one by one. A few human signals still burn inside the blackout. Yours is one of them.

## Implementation Strategy
Start with copy and state flow before visual effects.
The existing game loop should remain untouched until the theme pass proves cohesive.

1. Add narrative constants and localization keys.
2. Add the intro state and skip behavior.
3. Retheme the title, HUD, wave labels, upgrade cards, boss labels, game-over, and victory screens.
4. Add intro styling and reduced-motion variant.
5. Playtest readability and emotional tone.

## Quality Bar
- The intro must be short enough to read once and skip forever after.
- The title screen must make the new fantasy visible immediately.
- Every renamed concept must still communicate gameplay function.
- The world should feel angry, urgent, and human, but not preachy.
- Spanish and English copy should be supported if the current locale system remains bilingual.
