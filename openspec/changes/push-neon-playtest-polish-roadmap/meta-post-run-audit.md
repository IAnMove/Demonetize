# One-More-Run Meta Audit

## Changes

- Post-run panels now show build archetype, build commitment, legendary count, strongest installed boost, and action-card usage or held-card count.
- Defeat panels include an inferred cause when the final frame exposes enough context, including artillery, sentry lanes, arena edge, purge lanes, boss pulse, boss beam, elite burst, contact, and overrun fallback.
- Existing record chips, chase line, and next-target banner cover near-record and personal-best chase callouts without adding account progression.
- Title, defeat, and victory overlays reuse the same next-goal selection so the player gets one concrete target after each run.

## QA Evidence

- `.codex-qa/post-run-meta-gameover-desktop-clean.png`
- `.codex-qa/post-run-meta-gameover-mobile-es.png`
- `.codex-qa/post-run-meta-gameover-mobile-es-bottom.png`
- `.codex-qa/final-title-desktop.png`
- `.codex-qa/final-title-mobile-es.png`

## Copy Check

- EN desktop post-run confirms cause, strongest boost, cards, chase line, and next target.
- ES mobile post-run confirms translated cause, build recap, cards, and next target inside the scrollable final panel.
