---
source: wcag
topic: forms
wcag_sc: 3.3.2
title: Labels or Instructions
url: https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html
---

# Labels or Instructions

WCAG 2.2 Success Criterion 3.3.2 requires labels or instructions when content accepts user input. The goal is that users know what information to enter and how to complete the task without confusion.

Labels and instructions should identify form controls and explain expected input when needed. For controls such as radio buttons, checkboxes, comboboxes, and similar choices, each option needs an appropriate label so users know what they are selecting.

Instructions are especially important when input has rules, formats, or constraints that are not obvious. Examples include date formats, username rules, required field indicators, or segmented fields such as telephone numbers.

This criterion is about labels or instructions being presented to users. Correct programmatic association is covered separately by WCAG 1.3.1 Info and Relationships and 4.1.2 Name, Role, Value.

Important nuance: an accessible name that is only exposed to assistive technology, such as `aria-label`, can help with 4.1.2 but may still fail 3.3.2 if no visible label or instruction is presented to all users.

## Practical guidance

- Provide visible labels for form fields whenever possible.
- Add instructions when the expected format or rule is not obvious.
- Do not rely on visual punctuation alone to identify multi-part inputs.
- Group related fields with `fieldset` and `legend` when a shared label applies.
- Avoid clutter, but provide enough information for users to complete the task.

## Example

Use separate explicit labels for separate name fields:

```html
<label for="given-name">Given name</label>
<input id="given-name" name="given-name" autocomplete="given-name">

<label for="family-name">Family name</label>
<input id="family-name" name="family-name" autocomplete="family-name">
```
