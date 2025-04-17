export function defaultLabelTransform(
  label: VNode[],
  value: VNode[],
  match: OptionMatch,
  language: string,
  showValue: boolean,
): VNode;
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
  baseMatcher?: Intl.Collator | undefined;
  /**
   * - The case matcher for the language
   */
  caseMatcher?: Intl.Collator | undefined;
  /**
   * - The word segmenter for the language
   */
  wordSegmenter?: Intl.Segmenter | undefined;
};
export type VNode = import("preact").VNode;
export type LabelTransformFunction = (
  label: VNode[],
  value: VNode[],
  match: OptionMatch,
  language: string,
  showValue: boolean,
) => VNode;
export type ValueTransformFunction = (label: string) => VNode;
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
  allowedOptions:
    | Option[]
    | ((
        query: string,
        limit: number,
        currentSelections: string[],
        abortControllerSignal: AbortSignal,
      ) => Promise<Option[]>);
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
  labelTransform?: LabelTransformFunction | undefined;
  /**
   * Transform the value text
   */
  valueTransform?: ValueTransformFunction | undefined;
};
/**
 * PreactCombobox component
 * @param {PreactComboboxProps} props - Component props
 */
declare function PreactCombobox({
  id,
  multiple,
  allowedOptions,
  allowFreeText,
  onChange,
  value,
  language,
  placeholder,
  disabled,
  required,
  name,
  portal,
  className,
  rootElementProps,
  inputProps: { tooltipContent, ...inputProps },
  selectElementProps,
  showValue,
  labelTransform,
}: PreactComboboxProps): import("preact").JSX.Element;
