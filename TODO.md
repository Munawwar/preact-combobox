Priority
- Improve performance
- Test screen reader support
- Test preservation props of allowedOptions
- Test option transformers
- Support more keyboard keys as per https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/listbox_role - e.g. Home, End

Nice to have
- Option level disabling
- Specialized mobile design - full width, bottom aligned popup

Questions
- Add "remove all" button again? Optional?
- Virtualization of options? Or way to limit options to X amount and show a "type to load more" message? (Going with limited options for now)
  - Future proof: How will this work with native customizable selects that is being shipped by browsers?
  - Also optional feature? Virtualization will cause more a11y issues?
- Package this as a web component?