# OptionsListbox

A standalone accessible listbox component with keyboard navigation, extracted from PreactCombobox. Use this to build custom UXes (e.g., a menu dropdown with a search field) while reusing the same listbox behavior.

```jsx
import { OptionsListbox, useAsyncOptions, getMatchScore } from "preact-combobox";
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Component ID for ARIA attributes |
| `searchText` | `string` | Current search/input text |
| `filteredOptions` | `OptionMatch[]` | Pre-filtered options to display (use `getMatchScore()` to produce these) |
| `isLoading` | `boolean` | Whether options are currently loading |
| `arrayValues` | `string[]` | Currently selected values |
| `invalidValues` | `string[]` | Invalid selected values |
| `multiple` | `boolean` | Whether multi-select is enabled |
| `allowFreeText` | `boolean` | Allow adding custom options |
| `onOptionSelect` | `(value: string, opts?: {toggleSelected?: boolean}) => void` | Handle option selection |
| `onActiveDescendantChange` | `(value: string) => void` | Optional. Callback when active descendant changes (for `aria-activedescendant`) |
| `onClose` | `() => void` | Optional. Called on selection in single-select mode |
| `optionRenderer` | `OptionTransformFunction` | Function to render options (use `defaultOptionRenderer` as a starting point) |
| `warningIcon` | `VNode` | Warning icon element |
| `tickIcon` | `VNode` | Tick icon element |
| `optionIconRenderer` | `(option: Option, isInput?: boolean) => VNode \| null` | Option icon renderer |
| `showValue` | `boolean` | Show value alongside label |
| `language` | `string` | BCP 47 language code |
| `loadingRenderer` | `(text: string) => VNode \| string` | Custom loading indicator |
| `translations` | `Translations` | Localization strings |
| `theme` | `string` | Theme (`"light"`, `"dark"`, `"system"`) |
| `maxPresentedOptions` | `number` | Maximum number of options to show |
| `isOpen` | `boolean` | Whether the list is visible |
| `shouldUseTray` | `boolean` | Whether used in tray (mobile) mode |
| `setDropdownRef` | `(ref: HTMLUListElement \| null) => void` | Optional. Callback to set dropdown ref for positioning |

## Ref Methods

Access via `useRef` and `ref` prop:

| Method | Returns | Description |
|--------|---------|-------------|
| `navigateUp()` | `void` | Move to previous option |
| `navigateDown()` | `void` | Move to next option |
| `navigateToFirst()` | `void` | Move to first option |
| `navigateToLast()` | `void` | Move to last option |
| `navigatePageUp()` | `void` | Move up by one visible page |
| `navigatePageDown()` | `void` | Move down by one visible page |
| `selectActive()` | `boolean` | Select the active option, returns `true` if selection was made |
| `getActiveDescendant()` | `string` | Get the active descendant value |
| `setActiveDescendant(value)` | `void` | Set the active descendant |
| `clearActiveDescendant()` | `void` | Clear the active descendant |

## Helper Exports

| Export | Description |
|--------|-------------|
| `useAsyncOptions(params)` | Hook for async option fetching, caching, and filtering. Returns `{ filteredOptions, resolvedOptionsLookup, isLoading }` |
| `getMatchScore(query, options, language?, filterAndSort?)` | Score and filter options against a search query. Returns `OptionMatch[]` |
| `sortValuesToTop(options, values)` | Sort selected values to the top of the options list |
| `matchSlicesToNodes(matchSlices, text)` | Convert match slices to highlighted VNodes (wraps matches in `<u>` tags) |
