---
source: wcag
topic: keyboard
wcag_sc: 2.4.7
title: Focus Visible
url: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
---

# Focus Visible

WCAG 2.2 Success Criterion 2.4.7 requires that keyboard-operable user interface components have a mode of operation where the keyboard focus indicator is visible.

The purpose is to help users know which element currently has keyboard focus. Without a visible focus indicator, sighted keyboard users may not know where keyboard actions will apply and may be unable to operate the page.

The focus indicator can take different visual forms, such as an outline, border, background change, or other visible styling. It must remain visible while focus is on the component and must not disappear after a short timeout.

Authors can rely on the browser's default focus indicator when it remains visible, or provide an author-defined indicator. CSS `:focus-visible` can be used to show focus styles for keyboard interaction while avoiding unnecessary focus rings for some pointer interactions.

## Practical guidance

- Do not remove outlines unless replacing them with an equally visible focus style.
- Ensure links, buttons, inputs, and custom controls show visible keyboard focus.
- Test with the keyboard using Tab, Shift+Tab, Enter, and Space.
- Use `:focus-visible` for keyboard-specific focus styling.
- Consider two-color indicators when focus may appear on varied backgrounds.

## Example

```css
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```
