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
