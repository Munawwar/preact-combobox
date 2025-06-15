Priorities
- Make dark theme pass APCA contrast checker
- Docs

Bugs:
- Typing a value that is already there doesn't auto add the value. Also it doesn't de-duplicate
- Also while typing existing selection doesn't get unhighlighted
- Check FIXMEs in code too

Nice to have
- When field is disabled, there is no way to see what values were selected. Though native select also works this way
- Option level disabling
- Improve performance (some work has already been done, but not measured enough)
- Mobile tray option - for better UX

Questions
- Add "remove all" button again? Optional?
  - Future proof: How will this work with native customizable selects that is being shipped by browsers?
  - Virtualization? Will cause more a11y issues?
- Package this as a web component?