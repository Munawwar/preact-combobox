export function defaultOptionRenderer(params: {
    option: OptionMatch;
    language: string;
    isSelected: boolean;
    isInvalid: boolean;
    isActive: boolean;
    showValue: boolean;
    warningIcon?: import("preact").VNode<any> | undefined;
    tickIcon?: import("preact").VNode<any> | undefined;
    optionIconRenderer?: ((option: Option, isInput?: boolean) => VNode | null) | undefined;
}): VNode;
export default PreactCombobox;
export type Option = {
    /**
     * - The display text for the option
     */
    label: string;
    /**
     * - The value of the option
     */
    value: string;
    /**
     * - Optional icon element or URL to display before the label
     */
    icon?: string | import("preact").VNode<any> | undefined;
    /**
     * - Whether the option is disabled and cannot be selected
     */
    disabled?: boolean | undefined;
    /**
     * - Whether to show a divider line below this option (only when search is empty)
     */
    divider?: boolean | undefined;
};
export type OptionMatch = {
    /**
     * - The display text for the option
     */
    label: string;
    /**
     * - The value of the option
     */
    value: string;
    /**
     * - Optional icon element or URL to display before the label
     */
    icon?: string | import("preact").VNode<any> | undefined;
    /**
     * - Whether the option is disabled and cannot be selected
     */
    disabled?: boolean | undefined;
    /**
     * - Whether to show a divider line below this option (only when search is empty)
     */
    divider?: boolean | undefined;
    /**
     * - The match score
     */
    score: number;
    /**
     * - The match type
     */
    matched: "value" | "label" | "none";
    /**
     * - The match slices
     */
    matchSlices: Array<[number, number]>;
};
/**
 * Cache for language-specific word segmenters
 */
export type LanguageCache = {
    /**
     * - The base matcher for the language
     */
    baseMatcher: Intl.Collator;
    /**
     * - The case matcher for the language
     */
    caseMatcher: Intl.Collator;
    /**
     * - The word segmenter for the language
     */
    wordSegmenter: Intl.Segmenter;
};
export type VNode = import("preact").VNode;
export type OptionTransformFunction = (params: {
    option: OptionMatch;
    language: string;
    isSelected: boolean;
    isInvalid: boolean;
    isActive: boolean;
    showValue: boolean;
    warningIcon?: import("preact").VNode<any> | undefined;
    tickIcon?: import("preact").VNode<any> | undefined;
    optionIconRenderer?: ((option: Option, isInput?: boolean) => VNode | null) | undefined;
}) => VNode;
export type Translations = {
    /**
     * - Placeholder text for search input
     */
    searchPlaceholder: string;
    /**
     * - Text shown when no options match the search
     */
    noOptionsFound: string;
    /**
     * - Text shown when options are loading
     */
    loadingOptions: string;
    /**
     * - Announcement when options are loading (screen reader)
     */
    loadingOptionsAnnouncement: string;
    /**
     * - Announcement when options finish loading (screen reader)
     */
    optionsLoadedAnnouncement: string;
    /**
     * - Announcement when no options found (screen reader)
     */
    noOptionsFoundAnnouncement: string;
    /**
     * - Text for adding a new option (includes {value} placeholder)
     */
    addOption: string;
    /**
     * - Text shown when more options can be loaded
     */
    typeToLoadMore: string;
    /**
     * - Aria label for clear button
     */
    clearValue: string;
    /**
     * - Screen reader text for selected options
     */
    selectedOption: string;
    /**
     * - Screen reader text for invalid options
     */
    invalidOption: string;
    /**
     * - Header text for invalid values tooltip
     */
    invalidValues: string;
    /**
     * - Announcement for invalid values (screen reader)
     */
    fieldContainsInvalidValues: string;
    /**
     * - Announcement when no options are selected
     */
    noOptionsSelected: string;
    /**
     * - Announcement prefix when selection is added
     */
    selectionAdded: string;
    /**
     * - Announcement prefix when selection is removed
     */
    selectionRemoved: string;
    /**
     * - Announcement prefix for current selections
     */
    selectionsCurrent: string;
    /**
     * - Text for additional options (singular)
     */
    selectionsMore: string;
    /**
     * - Text for additional options (plural)
     */
    selectionsMorePlural: string;
    /**
     * - Function to format the count in the badge
     */
    selectedCountFormatter: (count: number, language: string) => string;
};
export type PreactComboboxProps = {
    /**
     * The id of the component
     */
    id: string;
    /**
     * Multi-select or single-select mode
     */
    multiple?: boolean | undefined;
    /**
     * Array of allowed options or function to fetch allowed options
     */
    allowedOptions: Option[] | ((queryOrValues: string[] | string, limit: number, currentSelections: string[], abortControllerSignal: AbortSignal) => Promise<Option[]>);
    /**
     * Allow free text input
     */
    allowFreeText?: boolean | undefined;
    /**
     * Callback when selection changes
     */
    onChange: (options: string[] | string) => void;
    /**
     * Currently selected options (array for multi-select, string for single-select)
     */
    value: string[] | string;
    /**
     * BCP 47 language code for word splitting and matching. The language can be any language tag
     * recognized by Intl.Segmenter and Intl.Collator
     */
    language?: string | undefined;
    /**
     * experimental feature.
     */
    showValue?: boolean | undefined;
    /**
     * Disable the component
     */
    disabled?: boolean | undefined;
    /**
     * Is required for form submission
     */
    required?: boolean | undefined;
    /**
     * Show the clear button for single-select mode
     */
    showClearButton?: boolean | undefined;
    /**
     * name to be set on hidden select element
     */
    name?: string | undefined;
    /**
     * Additional class names for the component
     */
    className?: string | undefined;
    /**
     * Input placeholder text shown when no selections are made
     */
    placeholder?: string | undefined;
    /**
     * Theme to use - 'light', 'dark', or 'system' (follows data-theme attribute)
     */
    theme?: "light" | "dark" | "system" | undefined;
    /**
     * Enable mobile tray mode - true/false or 'auto' for media query detection
     */
    tray?: boolean | "auto" | undefined;
    /**
     * CSS breakpoint for auto tray mode (e.g., '768px', '50rem')
     */
    trayBreakpoint?: string | undefined;
    /**
     * Label text for the tray header (auto-detects from associated label if not provided)
     */
    trayLabel?: string | undefined;
    /**
     * Custom translation strings
     */
    translations?: Translations | undefined;
    /**
     * Root element props
     */
    rootElementProps?: Record<string, any> | undefined;
    /**
     * Input element props
     */
    inputProps?: Record<string, any> | undefined;
    /**
     * Render a hidden select for progressive enhanced compatible form submission
     */
    formSubmitCompatible?: boolean | undefined;
    /**
     * Whether the component is rendered on the server (auto-detected if not provided).
     * This prop is only relevant if formSubmitCompatible is true.
     */
    isServer?: boolean | undefined;
    /**
     * Props for the hidden select element. This is useful for forms
     */
    selectElementProps?: Record<string, any> | undefined;
    /**
     * The element to render the Dropdown <ul> element
     */
    portal?: HTMLElement | undefined;
    /**
     * Transform the label text
     */
    optionRenderer?: OptionTransformFunction | undefined;
    /**
     * Custom icon renderer for options.
     * isInput is `true` when rendering the icon besides the input element in single-select mode.
     * It's `undefined` or `false` when rendering the icon besides each option.
     * This function is also passed into `optionRenderer` as an argument instead of being used directly for option rendering.
     */
    optionIconRenderer?: ((option: Option, isInput?: boolean) => VNode | null) | undefined;
    /**
     * Custom warning icon element or component
     */
    warningIcon?: import("preact").VNode<any> | undefined;
    /**
     * Custom tick icon element or component for selected options
     */
    tickIcon?: import("preact").VNode<any> | undefined;
    /**
     * Custom chevron icon element or component
     */
    chevronIcon?: import("preact").VNode<any> | undefined;
    /**
     * Custom loading indicator element or text
     */
    loadingRenderer?: ((text: string) => VNode | string) | undefined;
    /**
     * - [private property - do not use] Maximum number of options to present
     */
    maxNumberOfPresentedOptions?: number | undefined;
};
/**
 * PreactCombobox component
 * @param {PreactComboboxProps} props - Component props
 */
declare function PreactCombobox({ id: idProp, multiple, allowedOptions, allowFreeText, onChange, value, language, placeholder, disabled, required, name, portal, className, rootElementProps, inputProps: { tooltipContent, ...inputProps }, formSubmitCompatible, isServer, selectElementProps, showValue, showClearButton, optionRenderer, optionIconRenderer, warningIcon, tickIcon, chevronIcon, loadingRenderer, theme, tray, trayBreakpoint, trayLabel: trayLabelProp, translations, maxNumberOfPresentedOptions, }: PreactComboboxProps): import("preact").JSX.Element;
