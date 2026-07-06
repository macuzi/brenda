---
source: wai
topic: forms
title: Labeling Controls
url: https://www.w3.org/WAI/tutorials/forms/labels/
---

# Labeling Controls

WAI's forms tutorial explains that labels need to describe the purpose of a form control and should be properly associated with that control.

A label and form control can be associated explicitly or implicitly. Explicit association is preferred when possible: the `for` attribute on the `label` must exactly match the `id` of the form control.

Properly associated labels help assistive technologies present the correct label for a field. They also increase the clickable/tappable target area, because clicking the label can move focus to or activate the associated control.

Visible labels are recommended for most form fields. If a label must be visually hidden because the purpose is already clear from context, it should still remain available to assistive technologies. Do not use `display: none` or `visibility: hidden` for labels that screen readers need.

The tutorial notes that `aria-label` and `aria-labelledby` can identify controls for assistive technologies, but they do not present the label to visual users. Use them when the control's purpose is clear from surrounding visual context.

The `title` attribute is less reliable as a label replacement and is generally not recommended because assistive technology support varies and the information is not consistently available to all users.

## Practical guidance

- Prefer explicit labels with `label for` and matching input `id`.
- Keep labels close to their controls visually.
- Place labels to the right of checkboxes/radio buttons and above or to the left of most other fields.
- Use visually hidden labels only when a visible label would be redundant and context is already clear.
- Do not rely on placeholder text as the only label.

## Example

```html
<label for="email">Email address</label>
<input id="email" name="email" type="email" autocomplete="email">
```
