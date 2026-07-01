# Streak — Life Tracker

Track your daily activities and build better streaks. Level up your life.

**Live app:** https://sambayford.github.io/streak/

## What it does

Streak is a lightweight activity and life tracker. Log positive and negative
activities each day, earn XP, and watch your daily score build into
longer-term stats — streaks, weekly/monthly trends, and level-ups as you
rack up XP.

- Track positive and negative activities separately, each with its own XP
  value (weight)
- Daily score view with an at-a-glance score arc
- Stats panel with charts across days/weeks/months
- Level-up celebrations as your total score grows
- Jump to any date to log or review past days
- Import/export your data
- Installable as a PWA (works offline, home-screen icon)

## Tech

Single-file PWA — all HTML, CSS, and JS live in `index.html`, with no
build step and no dependencies. `sw.js` is the service worker and
`manifest.json` is the PWA manifest.

## License

MIT — see [LICENSE](LICENSE).
