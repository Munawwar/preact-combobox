/**
 * @param {OptionMatch['matchSlices']} matchSlices
 * @param {string} text
 * @returns {VNode[]}
 */
export function matchSlicesToNodes(matchSlices: OptionMatch["matchSlices"], text: string): VNode[];
export function defaultOptionTransform({ option: OptionMatch, language: string, isSelected: boolean, isInvalid: boolean, isActive: boolean, showValue: boolean, }: {
    option: any;
    language: any;
    isSelected: any;
    isInvalid: any;
    isActive: any;
    showValue: any;
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
export type OptionTransformFunction = ({ option: OptionMatch, language: string, isSelected: boolean, isInvalid: boolean, isActive: boolean, showValue: boolean, }: any) => VNode;
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
     * name to be set on hidden select element
     */
    name?: string | undefined;
    className?: string | undefined;
    placeholder?: string | undefined;
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
    optionTransform?: OptionTransformFunction | undefined;
    /**
     * Custom warning icon element or component
     */
    warningIcon?: string | import("preact").VNode<any> | undefined;
    /**
     * Custom chevron icon element or component
     */
    chevronIcon?: string | import("preact").VNode<any> | undefined;
    /**
     * Custom loading indicator element or text
     */
    loadingIndicator?: string | import("preact").VNode<any> | undefined;
};
/**
 * PreactCombobox component
 * @param {PreactComboboxProps} props - Component props
 */
declare function PreactCombobox({ id: idProp, multiple, allowedOptions, allowFreeText, onChange, value, language, placeholder, disabled, required, name, portal, className, rootElementProps, inputProps: { tooltipContent, ...inputProps }, formSubmitCompatible, selectElementProps, showValue, optionTransform, singleSelectedStateIcon, maxNumberOfPresentedOptions, warningIcon, chevronIcon, loadingIndicator, }: PreactComboboxProps): import("preact").JSX.Element;
