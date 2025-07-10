Priorities
- Docs
- Mobile tray option - for better UX
  - mobile tray height idea = clamp(200px, calc(100dvh - 50px), 480px)
    200px minimum to be usable
    480px (between 3-4 inch) max to be within the thumb's comfort zone
    and preferred calc(100dvh - 50px), that 50px padding to click outside and close the tray even with onscreen keyboard is open

Nice to have
- When field is disabled, there is no way to see what values were selected. Though native select also works this way
- Top level / prioritized options
- Disabled Options
- Group labels?
- Improve performance (some work has already been done, but not measured enough)

Questions
- Add "remove all" button again? Optional?
  - Future proof: How will this work with native customizable selects that is being shipped by browsers?
  - Virtualization? Will cause more a11y issues?
- Package this as a web component? (cant do this properly, render functions cannot be supported)