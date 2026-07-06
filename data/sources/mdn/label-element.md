---
source: mdn
topic: forms
title: HTML label element
url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label
---

# HTML `label` Element

The HTML `label` element represents a caption for an item in a user interface. It is commonly used to label form controls such as inputs, selects, and textareas.

A label can be associated with a form control explicitly or implicitly. For explicit association, the `for` attribute on the `label` matches the `id` of the form control. For implicit association, the form control is nested inside the `label`.

Explicit association is generally recommended for compatibility with external tools and assistive technologies. It also gives more layout flexibility because the label and control can be sibling elements.

Associating a label with a control has two major benefits: the label is programmatically associated with the control for assistive technologies, and clicking or tapping the label focuses or activates the associated control.

Multiple labels can be associated with the same form control by using the same `for` value on more than one `label`.

Avoid placing interactive content such as links or buttons inside a label, except for the labeled form control itself. Extra interactive content inside a label can make it harder for users to activate the intended form input.

Avoid placing heading elements inside labels. If label text needs stronger visual presentation, use CSS on the label instead.

## Practical guidance

- Use `<label for="id">` with a matching control `id` for most fields.
- Ensure each `id` is unique in the document.
- Keep label text concise and descriptive.
- Do not wrap unrelated links or buttons inside labels.
- Do not add a label to button inputs or buttons that already have clear text/value labels.

## Example

```html
<label for="username">Username</label>
<input id="username" name="username" type="text" autocomplete="username">
```

Implicit association is also valid:

```html
<label>
  Subscribe to updates
  <input name="subscribe" type="checkbox">
</label>
```
