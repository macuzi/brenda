# Brenda

An accessibility CLI that checks WCAG color contrast for normal text and suggests the closest passing foreground color when a pair fails.

## SLC scope

Brenda currently supports:

- Interactive foreground/background hex input
- WCAG 2.x contrast ratio calculation
- AA normal-text pass/fail (4.5:1)
- Closest AA and AAA foreground suggestions when contrast fails

Out of scope for this release:

- Large text thresholds
- UI component audits
- `brenda ask` (planned future milestone)

<<<<<<< Updated upstream
=======
## Prerequisites

- [Bun](https://bun.sh)

## Run

```sh
bun install
bun run dev                                      # interactive: brenda compare
bun run src/cli/index.ts compare #777777 #ffffff # args mode
```

After verifying locally, install the global command:

```sh
bun link
brenda compare                                   # or ~/.bun/bin/brenda compare
```

If `brenda` is not found, add `~/.bun/bin` to your PATH.

## Test

```sh
bun test
```

>>>>>>> Stashed changes
## Supported input

- 3- or 6-digit hex colors
- With or without `#` (e.g. `fff`, `#ffffff`, `777777`)

## Example

**Passing pair** — `#000000` on `#ffffff`:

```text
#000000 on #ffffff: 21.00:1 — passes WCAG AA normal text (4.5:1)
```

**Failing pair** — `#777777` on `#ffffff`:

```text
#777777 on #ffffff: 4.48:1 — fails WCAG AA normal text (needs 4.5:1)
Closest AA text color: #767676 (4.54:1) — shifts your foreground as little as possible while passing
Closest AAA text color: #595959 (7.00:1)
```
