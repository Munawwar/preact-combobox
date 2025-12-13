export default AutocompleteList;
export type Option = import("./PreactCombobox-old.js").Option;
export type OptionMatch = import("./PreactCombobox-old.js").OptionMatch;
export type Translations = import("./PreactCombobox-old.js").Translations;
export type OptionTransformFunction = import("./PreactCombobox-old.js").OptionTransformFunction;
export type VNode = import("preact").VNode;
export type AutocompleteListProps = {
    /**
     * - Component ID for ARIA attributes
     */
    id: string;
    /**
     * - Current search/input text
     */
    searchText: string;
    /**
     * - Options data or fetcher function
     */
    allowedOptions: Option[] | ((queryOrValues: string[] | string, limit: number, currentSelections: string[], abortControllerSignal: AbortSignal) => Promise<Option[]>);
    /**
     * - Currently selected values
     */
    arrayValues: string[];
    /**
     * - Invalid selected values
     */
    invalidValues: string[];
    /**
     * - Whether multi-select is enabled
     */
    multiple: boolean;
    /**
     * - Allow adding custom options
     */
    allowFreeText: boolean;
    /**
     * - Language code for matching
     */
    language: string;
    /**
     * - Maximum options to show
     */
    maxNumberOfPresentedOptions: number;
    /**
     * - Handle option selection
     */
    onOptionSelect: (selectedValue: string, options?: {
        toggleSelected?: boolean;
    }) => void;
    /**
     * - Callback when active descendant changes (for aria-activedescendant)
     */
    onActiveDescendantChange?: ((value: string) => void) | undefined;
    /**
     * - Handle close (for single-select)
     */
    onClose?: (() => void) | undefined;
    /**
     * - Function to render options
     */
    optionRenderer: OptionTransformFunction;
    /**
     * - Warning icon element
     */
    warningIcon: VNode;
    /**
     * - Tick icon element
     */
    tickIcon: VNode;
    /**
     * - Option icon renderer
     */
    optionIconRenderer: (option: Option, isInput?: boolean) => VNode | null;
    /**
     * - Whether to show option values
     */
    showValue: boolean;
    /**
     * - Loading renderer
     */
    loadingRenderer: (text: string) => VNode | string;
    /**
     * - Translation strings
     */
    translations: Translations;
    /**
     * - Theme for styling
     */
    theme: string;
    /**
     * - Whether the list should be visible
     */
    isOpen: boolean;
    /**
     * - Whether this is used in tray mode
     */
    shouldUseTray: boolean;
    /**
     * - Callback to set dropdown ref for popper
     */
    setDropdownRef?: ((ref: HTMLUListElement | null) => void) | undefined;
};
export type AutocompleteListRef = {
    /**
     * - Navigate to previous option
     */
    navigateUp: () => void;
    /**
     * - Navigate to next option
     */
    navigateDown: () => void;
    /**
     * - Navigate to first option
     */
    navigateToFirst: () => void;
    /**
     * - Navigate to last option
     */
    navigateToLast: () => void;
    /**
     * - Select the currently active option, returns true if selection was made
     */
    selectActive: () => boolean;
    /**
     * - Get the currently active descendant value
     */
    getActiveDescendant: () => string;
    /**
     * - Set the active descendant value
     */
    setActiveDescendant: (value: string) => void;
    /**
     * - Clear the active descendant
     */
    clearActiveDescendant: () => void;
};
/**
 * AutocompleteList component - handles filtering, fetching, and rendering options list
 * @type {import("preact/compat").ForwardRefExoticComponent<AutocompleteListProps & import("preact/compat").RefAttributes<AutocompleteListRef>>}
 */
declare const AutocompleteList: import("preact/compat").ForwardRefExoticComponent<AutocompleteListProps & import("preact/compat").RefAttributes<AutocompleteListRef>>;
