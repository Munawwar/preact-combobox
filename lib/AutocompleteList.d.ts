export default AutocompleteList;
export type Option = import("./PreactCombobox.jsx").Option;
export type OptionMatch = import("./PreactCombobox.jsx").OptionMatch;
export type Translations = import("./PreactCombobox.jsx").Translations;
export type OptionTransformFunction = import("./PreactCombobox.jsx").OptionTransformFunction;
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
     * - Pre-filtered options to display
     */
    filteredOptions: OptionMatch[];
    /**
     * - Whether options are currently loading
     */
    isLoading: boolean;
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
     * - Language code for rendering
     */
    language: string;
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
 * @typedef {import("./PreactCombobox.jsx").Option} Option
 * @typedef {import("./PreactCombobox.jsx").OptionMatch} OptionMatch
 * @typedef {import("./PreactCombobox.jsx").Translations} Translations
 * @typedef {import("./PreactCombobox.jsx").OptionTransformFunction} OptionTransformFunction
 * @typedef {import("preact").VNode} VNode
 */
/**
 * @typedef {Object} AutocompleteListProps
 * @property {string} id - Component ID for ARIA attributes
 * @property {string} searchText - Current search/input text
 * @property {OptionMatch[]} filteredOptions - Pre-filtered options to display
 * @property {boolean} isLoading - Whether options are currently loading
 * @property {string[]} arrayValues - Currently selected values
 * @property {string[]} invalidValues - Invalid selected values
 * @property {boolean} multiple - Whether multi-select is enabled
 * @property {boolean} allowFreeText - Allow adding custom options
 * @property {(selectedValue: string, options?: {toggleSelected?: boolean}) => void} onOptionSelect - Handle option selection
 * @property {(value: string) => void} [onActiveDescendantChange] - Callback when active descendant changes (for aria-activedescendant)
 * @property {() => void} [onClose] - Handle close (for single-select)
 * @property {OptionTransformFunction} optionRenderer - Function to render options
 * @property {VNode} warningIcon - Warning icon element
 * @property {VNode} tickIcon - Tick icon element
 * @property {(option: Option, isInput?: boolean) => VNode|null} optionIconRenderer - Option icon renderer
 * @property {boolean} showValue - Whether to show option values
 * @property {string} language - Language code for rendering
 * @property {(text: string) => VNode|string} loadingRenderer - Loading renderer
 * @property {Translations} translations - Translation strings
 * @property {string} theme - Theme for styling
 * @property {boolean} isOpen - Whether the list should be visible
 * @property {boolean} shouldUseTray - Whether this is used in tray mode
 * @property {(ref: HTMLUListElement | null) => void} [setDropdownRef] - Callback to set dropdown ref for popper
 */
/**
 * @typedef {Object} AutocompleteListRef
 * @property {() => void} navigateUp - Navigate to previous option
 * @property {() => void} navigateDown - Navigate to next option
 * @property {() => void} navigateToFirst - Navigate to first option
 * @property {() => void} navigateToLast - Navigate to last option
 * @property {() => boolean} selectActive - Select the currently active option, returns true if selection was made
 * @property {() => string} getActiveDescendant - Get the currently active descendant value
 * @property {(value: string) => void} setActiveDescendant - Set the active descendant value
 * @property {() => void} clearActiveDescendant - Clear the active descendant
 */
/**
 * AutocompleteList component - presentational component for rendering options list
 * Receives pre-filtered options and handles navigation/selection
 * @type {import("preact/compat").ForwardRefExoticComponent<AutocompleteListProps & import("preact/compat").RefAttributes<AutocompleteListRef>>}
 */
declare const AutocompleteList: import("preact/compat").ForwardRefExoticComponent<AutocompleteListProps & import("preact/compat").RefAttributes<AutocompleteListRef>>;
