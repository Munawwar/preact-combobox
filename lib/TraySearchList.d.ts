export default TraySearchList;
export type Option = any;
export type OptionMatch = any;
export type Translations = any;
export type OptionTransformFunction = any;
export type VNode = import("preact").VNode;
export type TraySearchListProps = {
    /**
     * - Component ID for ARIA attributes
     */
    id: string;
    /**
     * - Whether the tray is open
     */
    isOpen: boolean;
    /**
     * - Callback to close the tray
     */
    onClose: () => void;
    /**
     * - Label for the tray header
     */
    trayLabel?: string | undefined;
    /**
     * - Theme ('light' | 'dark' | 'system')
     */
    theme: string;
    /**
     * - Translation strings
     */
    translations: Translations;
    /**
     * - Handle input change
     */
    onInputChange: (value: string) => void;
    /**
     * - The AutocompleteList component
     */
    children: import("preact").ComponentChildren;
};
/**
 * @typedef {import("./PreactCombobox-old.js").Option} Option
 * @typedef {import("./PreactCombobox-old.js").OptionMatch} OptionMatch
 * @typedef {import("./PreactCombobox-old.js").Translations} Translations
 * @typedef {import("./PreactCombobox-old.js").OptionTransformFunction} OptionTransformFunction
 * @typedef {import("preact").VNode} VNode
 */
/**
 * @typedef {Object} TraySearchListProps
 * @property {string} id - Component ID for ARIA attributes
 * @property {boolean} isOpen - Whether the tray is open
 * @property {() => void} onClose - Callback to close the tray
 * @property {string} [trayLabel] - Label for the tray header
 * @property {string} theme - Theme ('light' | 'dark' | 'system')
 * @property {Translations} translations - Translation strings
 * @property {(value: string) => void} onInputChange - Handle input change
 * @property {import("preact").ComponentChildren} children - The AutocompleteList component
 */
/**
 * TraySearchList component - handles mobile tray with search input and options list
 * @param {TraySearchListProps} props
 */
declare function TraySearchList({ id, isOpen, onClose, trayLabel, theme, translations, onInputChange, children, }: TraySearchListProps): import("preact").JSX.Element | null;
