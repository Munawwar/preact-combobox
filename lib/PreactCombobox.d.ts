/**
 * @param {OptionMatch['matchSlices']} matchSlices
 * @param {string} text
 * @returns {VNode[]}
 */
export function matchSlicesToNodes(matchSlices: OptionMatch["matchSlices"], text: string): VNode[];
/**
 * @type {OptionTransformFunction}
 */
export function defaultOptionTransform({ option, isSelected, isInvalid, showValue, warningIcon }: {
    option: any;
    isSelected: any;
    isInvalid: any;
    showValue: any;
    warningIcon: any;
}): import("preact").JSX.Element;
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
export type Translations = {
    /**
     * - Placeholder text for search input
     */
    searchPlaceholder?: string | undefined;
    /**
     * - Placeholder text for search input in RTL mode
     */
    searchPlaceholderRtl?: string | undefined;
    /**
     * - Text shown when no options match the search
     */
    noOptionsFound?: string | undefined;
    /**
     * - Text shown when options are loading
     */
    loadingOptions?: string | undefined;
    /**
     * - Announcement when options are loading (screen reader)
     */
    loadingOptionsAnnouncement?: string | undefined;
    /**
     * - Announcement when options finish loading (screen reader)
     */
    optionsLoadedAnnouncement?: string | undefined;
    /**
     * - Announcement when no options found (screen reader)
     */
    noOptionsFoundAnnouncement?: string | undefined;
    /**
     * - Text for adding a new option (includes {value} placeholder)
     */
    addOption?: string | undefined;
    /**
     * - Text shown when more options can be loaded
     */
    typeToLoadMore?: string | undefined;
    /**
     * - Aria label for clear button
     */
    clearValue?: string | undefined;
    /**
     * - Screen reader text for selected options
     */
    selectedOption?: string | undefined;
    /**
     * - Screen reader text for invalid options
     */
    invalidOption?: string | undefined;
    /**
     * - Header text for invalid values tooltip
     */
    invalidValues?: string | undefined;
    /**
     * - Announcement for invalid values (screen reader)
     */
    fieldContainsInvalidValues?: string | undefined;
    /**
     * - Announcement when no options are selected
     */
    noOptionsSelected?: string | undefined;
    /**
     * - Announcement prefix when selection is added
     */
    selectionAdded?: string | undefined;
    /**
     * - Announcement prefix when selection is removed
     */
    selectionRemoved?: string | undefined;
    /**
     * - Announcement prefix for current selections
     */
    selectionsCurrent?: string | undefined;
    /**
     * - Text for additional options (singular)
     */
    selectionsMore?: string | undefined;
    /**
     * - Text for additional options (plural)
     */
    selectionsMorePlural?: string | undefined;
    /**
     * - Function to format the count in the badge
     */
    selectedCountFormatter?: ((count: number, language: string) => string) | undefined;
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
     * Language for word splitting and matching. The language can be any language tag
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
    className?: string | undefined;
    placeholder?: string | undefined;
    /**
     * Theme to use - 'light', 'dark', or 'system' (follows data-theme attribute)
     */
    theme?: "light" | "dark" | "system" | undefined;
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
    optionTransform?: OptionTransformFunction;
    /**
     * Custom warning icon element or component
     */
    warningIcon?: import("preact").VNode<any> | undefined;
    /**
     * Custom chevron icon element or component
     */
    chevronIcon?: import("preact").VNode<any> | undefined;
    /**
     * Custom loading indicator element or text
     */
    loadingIndicator?: ((text: string) => VNode) | undefined;
};
/**
 * PreactCombobox component
 * @param {PreactComboboxProps} props - Component props
 */
declare function PreactCombobox({ id: idProp, multiple, allowedOptions, allowFreeText, onChange, value, language, placeholder, disabled, required, name, portal, className, rootElementProps, inputProps: { tooltipContent, ...inputProps }, formSubmitCompatible, isServer, selectElementProps, showValue, showClearButton, optionTransform, singleSelectedStateIcon, maxNumberOfPresentedOptions, warningIcon, chevronIcon, loadingIndicator, theme, translations, }: PreactComboboxProps): import("preact").JSX.Element;
