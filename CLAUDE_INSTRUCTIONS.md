# Instructions for Claude — Streak app

If you're starting a fresh conversation and Sam has only given you this
repo's URL and a GitHub token, read this file first before making any
changes.

## What this project is

Streak is a single-file PWA habit/life tracker. Everything — HTML, CSS,
JS — lives in one file: `index.html`. There is no build step. `sw.js` is
the service worker, `manifest.json` is the PWA manifest, and the icon
files are the app icons. Live at https://sambayford.github.io/streak/.

## Repo workflow

1. Clone with the provided token:
   `git clone https://x-access-token:<TOKEN>@github.com/sambayford/streak.git`
2. Make edits directly to `index.html` (or other files as needed).
3. Commit and push straight to `main`. This isn't a critical app and
   changes are easy to revert, so **don't create a PR by default** —
   only open one if Sam explicitly asks for a PR/review first.
4. Every commit that changes app behavior must also update the "What's
   new" changelog inside `index.html` (see below). This is a standing
   instruction — do it automatically, don't wait to be asked.

## Changelog ("What's new") convention

Inside `index.html`, search for `cl-entry` / `cl-version`. Entries look
like:

```html
<div class="cl-entry">
  <div class="cl-version">v78 — Current</div>
  <ul class="cl-list">
    <li>Short, specific description of what changed</li>
    <li>Optional second bullet with more detail or the bug it fixes</li>
  </ul>
</div>
```

Rules:
- Entries are listed newest-first.
- Only the newest entry gets the "— Current" suffix. When adding a new
  entry, strip "— Current" from the previous top entry.
- Increment the version number by 1 (check the current top entry first —
  don't assume based on this file, it may be stale).
- Bullets should be terse and factual, matching the tone of existing
  entries — no marketing language.
- Bump the version even for small fixes (this project has a habit of
  versioning every build, no matter how small).

## Sam's working style — apply these without being asked

- Prefers targeted, incremental edits over large rewrites or
  restructuring. Don't refactor unrelated code while making a change.
- Gives terse, direct feedback — match that energy, don't over-explain
  unless asked.
- Cares about visual consistency (spacing, colors, font choices should
  match existing patterns already in the file) and precise wording in
  the UI.
- Dislikes redundant UI elements — if a change could be done by
  reusing/extending an existing element instead of adding a new one,
  prefer that.
- Builds and tests happen by opening the file / PR preview — there's no
  automated test suite, so double check logic carefully before
  committing.

## Practical notes

- The token Sam provides is short-lived and scoped to this repo only.
  Don't assume it persists across conversations — always ask for a
  fresh one if it's missing or a git operation returns 401/403.
- Never print the token in output/logs beyond what's needed to
  authenticate the git remote.
- Default branch is `main`.
- If Sam just says "continue the work on the app" with no other detail,
  it's reasonable to check recent commits in this repo for context
  before asking what's next.
- Default to committing straight to `main`. Only branch + PR when Sam
  explicitly says so.
