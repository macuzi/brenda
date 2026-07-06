---
source: wcag
topic: contrast
wcag_sc: 1.4.3
title: Contrast (Minimum)
url: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
---

# Contrast (Minimum)

WCAG 2.2 Success Criterion 1.4.3 requires enough contrast between text and its background so text can be read by people with moderately low vision and users in varied viewing conditions.

For normal text, the minimum contrast ratio is 4.5:1. For large-scale text, the minimum contrast ratio is 3:1. Large-scale text generally means at least 18 point regular text or 14 point bold text.

The criterion applies to text and images of text. It does not apply to incidental text, inactive interface components, purely decorative text, invisible text, logotypes, or text that is part of a picture containing significant other visual content.

Contrast is calculated from the relative luminance of the foreground and background colors. Authors should check the actual rendered colors, including states such as hover, focus, disabled, and selected where text remains meaningful.

## Practical guidance

- Use at least 4.5:1 contrast for normal body text.
- Use at least 3:1 contrast for large text.
- Do not use color combinations that become unreadable in real UI states.
- Avoid relying on images of text; real text is more adaptable.
- Check text over gradients, images, and translucent backgrounds against the actual displayed background.

## Example

For normal text:

```text
#000000 on #ffffff = 21:1, passes
#777777 on #ffffff = about 4.48:1, fails 4.5:1 normal text
```
