import { createPopper } from "@popperjs/core";
import { createPortal } from "preact/compat";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import OptionsListbox from "./OptionsListbox.jsx";
import TraySearchList from "./TraySearchList.jsx";
import { subscribeToVirtualKeyboard, useAsyncOptions, useDeepMemo, useLive } from "./hooks.js";
import { matchSlicesToNodes, toHTMLId } from "./utils.jsx";
import "./PreactCombobox.css";

// --- types ---
/**
 * @typedef {Object} Option
 * @property {string} label - The display text for the option
 * @property {string} value - The value of the option
 * @property {VNode | string} [icon] - Optional icon element or URL to display before the label
 * @property {boolean} [disabled] - Whether the option is disabled and cannot be selected
 * @property {boolean} [divider] - Whether to show a divider line below this option (only when search is empty)
 */

/**
 * @typedef {Object} OptionMatch
 * @property {string} label - The display text for the option
 * @property {string} value - The value of the option
 * @property {VNode|string} [icon] - Optional icon element or URL to display before the label
 * @property {boolean} [disabled] - Whether the option is disabled and cannot be selected
 * @property {boolean} [divider] - Whether to show a divider line below this option (only when search is empty)
 * @property {number} score - The match score
 * @property {'value' | 'label' | 'none'} matched - The match type
 * @property {Array<[number, number]>} matchSlices - The match slices
 */

/**
 * Cache for language-specific word segmenters
 * @typedef {Object} LanguageCache
 * @property {Intl.Collator} baseMatcher - The base matcher for the language
 * @property {Intl.Collator} caseMatcher - The case matcher for the language
 * @property {Intl.Segmenter} wordSegmenter - The word segmenter for the language
 */

/**
 * @typedef {import("preact").VNode} VNode
 */

/**
 * @callback OptionTransformFunction
 * @param {Object} params
 * @param {OptionMatch} params.option
 * @param {string} params.language
 * @param {boolean} params.isSelected
 * @param {boolean} params.isInvalid
 * @param {boolean} params.isActive Active does not mean selected. Active means the option is being hovered over / keyboard focused over.
 * @param {boolean} params.showValue
 * @param {VNode} [params.warningIcon]
 * @param {VNode} [params.tickIcon]
 * @param {(option: Option, isInput?: boolean) => VNode|null} [params.optionIconRenderer] Read PreactComboboxProps
 * `optionIconRenderer` for more details.
 * @returns {VNode}
 */

/**
 * @typedef {Object} Translations
 * @property {string} searchPlaceholder - Placeholder text for search input
 * @property {string} noOptionsFound - Text shown when no options match the search
 * @property {string} loadingOptions - Text shown when options are loading
 * @property {string} loadingOptionsAnnouncement - Announcement when options are loading (screen reader)
 * @property {string} optionsLoadedAnnouncement - Announcement when options finish loading (screen reader)
 * @property {string} noOptionsFoundAnnouncement - Announcement when no options found (screen reader)
 * @property {string} addOption - Text for adding a new option (includes {value} placeholder)
 * @property {string} typeToLoadMore - Text shown when more options can be loaded
 * @property {string} clearValue - Aria label for clear button
 * @property {string} selectedOption - Screen reader text for selected options
 * @property {string} invalidOption - Screen reader text for invalid options
 * @property {string} invalidValues - Header text for invalid values tooltip
 * @property {string} fieldContainsInvalidValues - Announcement for invalid values (screen reader)
 * @property {string} noOptionsSelected - Announcement when no options are selected
 * @property {string} selectionAdded - Announcement prefix when selection is added
 * @property {string} selectionRemoved - Announcement prefix when selection is removed
 * @property {string} selectionsCurrent - Announcement prefix for current selections
 * @property {string} selectionsMore - Text for additional options (singular)
 * @property {string} selectionsMorePlural - Text for additional options (plural)
 * @property {(count: number, language: string) => string} selectedCountFormatter - Function to format the count in the badge
 */

/**
 * @typedef {Object} PreactComboboxProps
 * @property {string} id The id of the component
 * @property {boolean} [multiple=true] Multi-select or single-select mode
 * @property {Option[]
 * | ((
 *   queryOrValues: string[] | string,
 *   limit: number,
 *   currentSelections: string[],
 *   abortControllerSignal: AbortSignal
 * ) => Promise<Option[]>)} allowedOptions Array of allowed options or function to fetch allowed options
 * @property {boolean} [allowFreeText=false] Allow free text input
 * @property {(options: string[] | string) => void} onChange Callback when selection changes
 * @property {string[] | string} value Currently selected options (array for multi-select, string for single-select)
 * @property {string} [language='en'] BCP 47 language code for word splitting and matching. The language can be any language tag
 * recognized by Intl.Segmenter and Intl.Collator
 * @property {boolean} [showValue=false] experimental feature.
 * @property {boolean} [disabled=false] Disable the component
 * @property {boolean} [required=false] Is required for form submission
 * @property {boolean} [showClearButton=true] Show the clear button for single-select mode
 * @property {string} [name] name to be set on hidden select element
 * @property {string} [className] Additional class names for the component
 * @property {string} [placeholder] Input placeholder text shown when no selections are made
 * @property {'light' | 'dark' | 'system'} [theme='system'] Theme to use - 'light', 'dark', or 'system' (follows data-theme attribute)
 * @property {boolean | 'auto'} [tray=false] Enable mobile tray mode - true/false or 'auto' for media query detection
 * @property {string} [trayBreakpoint='768px'] CSS breakpoint for auto tray mode (e.g., '768px', '50rem')
 * @property {string} [trayLabel] Label text for the tray header (auto-detects from associated label if not provided)
 * @property {Translations} [translations] Custom translation strings
 *
 * @property {Record<string, any>} [rootElementProps] Root element props
 * @property {Record<string, any>} [inputProps] Input element props
 * @property {boolean} [formSubmitCompatible=false] Render a hidden select for progressive enhanced compatible form submission
 * @property {boolean} [isServer] Whether the component is rendered on the server (auto-detected if not provided).
 * This prop is only relevant if formSubmitCompatible is true.
 * @property {Record<string, any>} [selectElementProps] Props for the hidden select element. This is useful for forms
 *
 * @property {HTMLElement} [portal=document.body] The element to render the Dropdown <ul> element
 * @property {OptionTransformFunction} [optionRenderer=identity] Transform the label text
 * @property {(option: Option, isInput?: boolean) => VNode|null} [optionIconRenderer] Custom icon renderer for options.
 * isInput is `true` when rendering the icon besides the input element in single-select mode.
 * It's `undefined` or `false` when rendering the icon besides each option.
 * This function is also passed into `optionRenderer` as an argument instead of being used directly for option rendering.
 * @property {VNode} [warningIcon] Custom warning icon element or component
 * @property {VNode} [tickIcon] Custom tick icon element or component for selected options
 * @property {VNode} [chevronIcon] Custom chevron icon element or component
 * @property {(text: string) => VNode|string} [loadingRenderer] Custom loading indicator element or text
 *
 * @property {number} [maxNumberOfPresentedOptions=100] - [private property - do not use] Maximum number of options to present
 */

// --- end of types ---

/** @type {Translations} */
const defaultEnglishTranslations = {
  searchPlaceholder: "Search...",
  noOptionsFound: "No options found",
  loadingOptions: "Loading...",
  loadingOptionsAnnouncement: "Loading options, please wait...",
  optionsLoadedAnnouncement: "Options loaded.",
  noOptionsFoundAnnouncement: "No options found.",
  addOption: 'Add "{value}"',
  typeToLoadMore: "...type to load more options",
  clearValue: "Clear value",
  selectedOption: "Selected option.",
  invalidOption: "Invalid option.",
  invalidValues: "Invalid values:",
  fieldContainsInvalidValues: "Field contains invalid values",
  noOptionsSelected: "No options selected",
  selectionAdded: "added selection",
  selectionRemoved: "removed selection",
  selectionsCurrent: "currently selected",
  selectionsMore: "and {count} more option",
  selectionsMorePlural: "and {count} more options",
  // Function to format the count in badge, receives count and language as parameters
  selectedCountFormatter: (count, lang) => new Intl.NumberFormat(lang).format(count),
};

// Auto-detect server-side rendering
const isServerDefault = typeof self === "undefined";

/**
 * @param {string[]} arr Array to remove duplicates from
 */
function unique(arr) {
  return Array.from(new Set(arr));
}

/**
 * @param {Object} props - Props for the PopperContent component
 * @param {HTMLElement} [props.parent=document.body] The parent element to render the PopperContent component
 * @param {VNode} props.children The children to render
 * @param {React.RefObject<HTMLElement>} [props.rootElementRef] Reference to the source element to get direction context
 */
const Portal = ({ parent = document.body, children, rootElementRef }) => {
  const [dir, setDir] = useState(/** @type {string|null} */ (null));

  useEffect(() => {
    if (rootElementRef?.current) {
      const rootDir = window.getComputedStyle(rootElementRef.current).direction;
      const parentDir = window.getComputedStyle(parent).direction;
      if (rootDir !== parentDir) {
        setDir(rootDir);
      } else {
        setDir(null);
      }
    }
  }, [rootElementRef, parent]);

  const wrappedChildren = dir ? (
    <div dir={/** @type {"auto" | "rtl" | "ltr"} */ (dir)} style={{ direction: dir }}>
      {children}
    </div>
  ) : (
    children
  );

  return createPortal(wrappedChildren, parent);
};

// Popper.js helper
const dropdownPopperModifiers = [
  {
    name: "flip",
    enabled: true,
  },
  {
    // make the popper width same as root element
    name: "referenceElementWidth",
    enabled: true,
    phase: "beforeWrite",
    requires: ["computeStyles"],
    // @ts-ignore
    fn: ({ state }) => {
      state.styles.popper.minWidth = `${state.rects.reference.width}px`;
    },
    // @ts-ignore
    effect: ({ state }) => {
      state.elements.popper.style.minWidth = `${state.elements.reference.offsetWidth}px`;
    },
  },
  {
    name: "eventListeners",
    enabled: true,
    options: {
      scroll: true,
      resize: true,
    },
  },
];

const tooltipPopperModifiers = [
  {
    name: "offset",
    options: {
      offset: [0, 2],
    },
  },
  {
    name: "eventListeners",
    enabled: true,
    options: {
      scroll: true,
      resize: true,
    },
  },
];

// Default icons
const defaultWarningIcon = (
  <svg
    className="PreactCombobox-warningIcon"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    aria-hidden="true"
  >
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const defaultTickIcon = (
  <svg
    className="PreactCombobox-tickIcon"
    viewBox="0 0 24 24"
    width="14"
    height="14"
    aria-hidden="true"
  >
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
  </svg>
);

const defaultChevronIcon = (
  <svg
    className="PreactCombobox-chevron"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    aria-hidden="true"
  >
    <path d="M7 10l5 5 5-5z" />
  </svg>
);

/** @type {NonNullable<PreactComboboxProps['loadingRenderer']>} */
const defaultLoadingRenderer = (loadingText) => loadingText;

/** @type {OptionTransformFunction} */
export function defaultOptionRenderer({
  option,
  isSelected,
  isInvalid,
  showValue,
  warningIcon,
  tickIcon,
  optionIconRenderer,
}) {
  const isLabelSameAsValue = option.value === option.label;
  /**
   * @param {(VNode|string)[]} labelNodes
   * @param {(VNode|string)[]} valueNodes
   * @returns {VNode}
   */
  const getLabel = (labelNodes, valueNodes) => (
    <>
      {optionIconRenderer?.(option, false)}
      <span className="PreactCombobox-optionLabelFlex">
        <span>{labelNodes}</span>
        {isLabelSameAsValue || !showValue ? null : (
          <span className="PreactCombobox-optionValue" aria-hidden="true">
            ({valueNodes})
          </span>
        )}
      </span>
    </>
  );

  const { label, value, matched, matchSlices } = option;
  let labelElement;
  if (matched === "label" || (matched === "value" && value === label)) {
    const labelNodes = matchSlicesToNodes(matchSlices, label);
    labelElement = getLabel(labelNodes, [value]);
  } else if (matched === "value") {
    const valueNodes = matchSlicesToNodes(matchSlices, value);
    labelElement = getLabel([label], valueNodes);
  } else {
    // if matched === "none"
    labelElement = getLabel([label], [value]);
  }

  return (
    <>
      <span
        className={`PreactCombobox-optionCheckbox ${
          isSelected ? "PreactCombobox-optionCheckbox--selected" : ""
        }`}
      >
        {isSelected && tickIcon}
      </span>
      {labelElement}
      {isInvalid && warningIcon}
    </>
  );
}

/** @type {NonNullable<PreactComboboxProps['optionIconRenderer']>} */
function defaultOptionIconRenderer(option) {
  return option.icon ? (
    <span className="PreactCombobox-optionIcon" aria-hidden="true" role="img">
      {option.icon}
    </span>
  ) : null;
}

/** @type {string[]} */
const defaultArrayValue = [];

/**
 * Creates a human-readable announcement of selected items
 * @param {string[]} selectedValues - Array of selected values
 * @param {"added"|"removed"|null|undefined} diff - Lookup object containing option labels
 * @param {string} language - Language code
 * @param {Record<string, Option>} optionsLookup - Lookup object containing option labels
 * @param {Translations} translations - Translations object
 * @returns {string} - Human-readable announcement of selections
 */
function formatSelectionAnnouncement(selectedValues, diff, optionsLookup, language, translations) {
  if (!selectedValues || selectedValues.length === 0) {
    return translations.noOptionsSelected;
  }

  const labels = selectedValues.map((value) => optionsLookup[value]?.label || value);

  const prefix = diff
    ? diff === "added"
      ? translations.selectionAdded
      : translations.selectionRemoved
    : translations.selectionsCurrent;

  if (selectedValues.length <= 3) {
    return `${prefix} ${new Intl.ListFormat(language, { style: "long", type: "conjunction" }).format(labels)}`;
  }

  const firstThree = labels.slice(0, 3);
  const remaining = selectedValues.length - 3;
  const moreText =
    remaining === 1
      ? translations.selectionsMore.replace("{count}", remaining.toString())
      : translations.selectionsMorePlural.replace("{count}", remaining.toString());

  return `${prefix} ${firstThree.join(", ")} ${moreText}`;
}

/**
 * PreactCombobox component
 * @param {PreactComboboxProps} props - Component props
 */
const PreactCombobox = ({
  id: idProp,
  multiple = true,
  allowedOptions,
  allowFreeText = false,
  onChange,
  value = multiple ? defaultArrayValue : "",
  language = "en",
  placeholder = "",
  disabled,
  required,
  name,
  portal = document.body,
  className = "",
  rootElementProps,
  inputProps: { tooltipContent = null, ...inputProps } = {},
  formSubmitCompatible = false,
  isServer = isServerDefault,
  selectElementProps,
  showValue = true,
  showClearButton = true,
  optionRenderer = defaultOptionRenderer,
  optionIconRenderer = defaultOptionIconRenderer,
  warningIcon = defaultWarningIcon,
  tickIcon = defaultTickIcon,
  chevronIcon = defaultChevronIcon,
  loadingRenderer = defaultLoadingRenderer,
  theme = "system",
  tray = "auto",
  trayBreakpoint = "768px",
  trayLabel: trayLabelProp,
  translations = defaultEnglishTranslations,
  // private option for now
  maxNumberOfPresentedOptions = 100,
}) => {
  // Merge default translations with provided translations
  const mergedTranslations = useDeepMemo(
    translations === defaultEnglishTranslations
      ? translations
      : { ...defaultEnglishTranslations, ...translations },
  );
  const values = multiple ? /** @type {string[]} */ (value) : null;
  const singleSelectValue = multiple ? null : /** @type {string} */ (value);

  /** @type {string[]} */
  let tempArrayValue;
  if (Array.isArray(value)) {
    tempArrayValue = /** @type {string[]} */ (value);
  } else {
    tempArrayValue = value ? [/** @type {string} */ (value)] : [];
  }
  const arrayValues = useDeepMemo(tempArrayValue);
  const arrayValuesLookup = useMemo(() => new Set(arrayValues), [arrayValues]);

  const autoId = useId();
  const id = idProp || autoId;
  const [inputValue, setInputValue] = useState("");
  const [getIsDropdownOpen, setIsDropdownOpen] = useLive(false);
  const [getIsFocused, setIsFocused] = useLive(false);
  // For screen reader announcement
  const [lastSelectionAnnouncement, setLastSelectionAnnouncement] = useState("");
  // For loading status announcements
  const [loadingAnnouncement, setLoadingAnnouncement] = useState("");
  // Ref for OptionsListbox component to call navigation methods
  const optionsListboxRef = useRef(
    /** @type {import("./OptionsListbox.jsx").OptionsListboxRef | null} */ (null),
  );
  // Track active descendant for aria-activedescendant on input (synced from AutocompleteList)
  const [activeDescendantValue, setActiveDescendantValue] = useState("");
  const [warningIconHovered, setWarningIconHovered] = useState(false);
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const blurTimeoutRef = useRef(/** @type {number | undefined} */ (undefined));
  const rootElementRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const dropdownPopperRef = useRef(/** @type {HTMLUListElement | null} */ (null));
  const dropdownClosedExplicitlyRef = useRef(false);
  const warningIconRef = useRef(null);
  const tooltipPopperRef = useRef(null);
  const undoStack = useRef(/** @type {string[][]} */ ([]));
  const redoStack = useRef(/** @type {string[][]} */ ([]));
  const [getTrayLabel, setTrayLabel] = useLive(trayLabelProp);

  // Tray-related state
  const [getIsTrayOpen, setIsTrayOpen] = useLive(false);
  const trayClosedExplicitlyRef = useRef(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [trayActiveInputValue, setTrayActiveInputValue] = useState("");

  // Media query detection for auto tray mode
  useEffect(() => {
    if (tray === "auto") {
      const mediaQuery = window.matchMedia(`(max-width: ${trayBreakpoint})`);
      setIsMobileScreen(mediaQuery.matches);
      const handleChange = (/** @type {MediaQueryListEvent} */ e) => setIsMobileScreen(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [tray, trayBreakpoint]);

  // Determine if tray should be used
  const shouldUseTray = tray === true || (tray === "auto" && isMobileScreen);

  // Use appropriate input value based on mode
  const activeInputValue = getIsTrayOpen() ? trayActiveInputValue : inputValue;
  const inputTrimmed = activeInputValue.trim();

  /**
   * Get the effective tray label
   * If needed, automatically detect the label associated with the input field
   * Following W3C accessible name computation priority order:
   * 1. aria-labelledby (highest priority)
   * 2. aria-label
   * 3. Native HTML label element (label with 'for' attribute or wrapping label)
   * 4. title attribute (fallback)
   * @returns {string} The final computed tray label
   */
  const computeEffectiveTrayLabel = useCallback(() => {
    if (trayLabelProp) return trayLabelProp;
    if (typeof self === "undefined" || isServer || !inputRef.current) return "";

    const inputElement = inputRef.current;
    const inputId = inputElement.id;

    // Priority 1: aria-labelledby (highest priority)
    const ariaLabelledBy = inputElement.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) {
        return labelElement.textContent?.trim() || "";
      }
    }

    // Priority 2: aria-label
    const ariaLabel = inputElement.getAttribute("aria-label");
    if (ariaLabel) {
      return ariaLabel.trim();
    }

    // Priority 3: Native HTML label element
    // Method 3a: Look for label with 'for' attribute matching the input id
    if (inputId) {
      const labelElement = document.querySelector(`label[for="${inputId}"]`);
      if (labelElement) {
        return labelElement.textContent?.trim() || "";
      }
    }

    // Method 3b: Look for label that wraps the input element (using closest for efficiency)
    const wrappingLabel = inputElement.closest("label");
    if (wrappingLabel) {
      return wrappingLabel.textContent?.trim() || "";
    }

    // Priority 4: title attribute (fallback - lowest priority)
    const title = inputElement.getAttribute("title");
    if (title) {
      return title.trim();
    }

    return "";
  }, [trayLabelProp, isServer]);
  useLayoutEffect(() => {
    setTrayLabel(computeEffectiveTrayLabel());
  }, [setTrayLabel, computeEffectiveTrayLabel]);

  // Determine if options should be fetched/filtered (dropdown or tray is open)
  const isListOpen = shouldUseTray ? getIsTrayOpen() : getIsDropdownOpen();

  // Use the async options hook for fetching, caching, and filtering
  const { filteredOptions, resolvedOptionsLookup, isLoading } = useAsyncOptions({
    allowedOptions,
    selectedValues: arrayValues,
    searchText: activeInputValue,
    isOpen: isListOpen,
    language,
    maxNumberOfPresentedOptions,
  });

  // Alias for backward compatibility with existing code
  const allOptionsLookup = resolvedOptionsLookup;

  const invalidValues = useMemo(() => {
    if (allowFreeText) return [];
    return arrayValues?.filter((v) => !allOptionsLookup[v]) || [];
  }, [allowFreeText, arrayValues, allOptionsLookup]);

  const updateSelectionAnnouncement = useCallback(
    /**
     * @param {string[]} selectedValues
     * @param {"added"|"removed"|null} [diff]
     */
    (selectedValues, diff) => {
      const announcement = formatSelectionAnnouncement(
        selectedValues,
        diff,
        allOptionsLookup,
        language,
        mergedTranslations,
      );
      setLastSelectionAnnouncement(announcement);
    },
    [allOptionsLookup, mergedTranslations, language],
  );

  /**
   * Callback for when OptionsListbox's active descendant changes
   * @param {string} value - The new active descendant value
   */
  const handleActiveDescendantChange = useCallback(
    /** @param {string} value */
    (value) => {
      setActiveDescendantValue(value);
    },
    [],
  );

  const closeDropdown = useCallback(
    (closedExplicitly = false) => {
      setIsDropdownOpen(false);
      // Don't wait till next render cycle (which destroys the popper) to hide the popper
      if (dropdownPopperRef.current) {
        // @ts-ignore
        dropdownPopperRef.current.style.display = "none";
      }
      if (closedExplicitly) {
        dropdownClosedExplicitlyRef.current = true;
      }

      // Announce current selections when dropdown is closed
      updateSelectionAnnouncement(arrayValues);

      // Clear active descendant via ref (will also trigger state update via callback)
      optionsListboxRef.current?.clearActiveDescendant();
    },
    [setIsDropdownOpen, updateSelectionAnnouncement, arrayValues],
  );

  // Setup popper when dropdown is opened
  useEffect(() => {
    if (
      getIsDropdownOpen() &&
      !shouldUseTray &&
      rootElementRef.current &&
      dropdownPopperRef.current
    ) {
      // Get computed direction to handle RTL layout
      const computedDir = window.getComputedStyle(rootElementRef.current).direction;
      const placement = computedDir === "rtl" ? "bottom-end" : "bottom-start";

      const popperInstance = createPopper(rootElementRef.current, dropdownPopperRef.current, {
        placement: placement,
        // @ts-ignore
        modifiers: dropdownPopperModifiers,
      });
      dropdownPopperRef.current.style.display = "block";
      // Clean up function
      return () => {
        popperInstance.destroy();
      };
    }
    if (shouldUseTray && dropdownPopperRef.current) {
      dropdownPopperRef.current.style.display = "none";
    }
  }, [getIsDropdownOpen, shouldUseTray]);

  // Note: filtering state moved to AutocompleteList component
  // Note: All filtering and fetching logic moved to AutocompleteList component

  // Note: addNewOptionVisible now handled in AutocompleteList component

  // Note: activeDescendant state now lives in AutocompleteList, synced via onActiveDescendantChange callback

  // Setup warning tooltip popper when hovering over warning icon
  useEffect(() => {
    if (
      invalidValues.length > 0 &&
      warningIconHovered &&
      warningIconRef.current &&
      tooltipPopperRef.current &&
      rootElementRef.current
    ) {
      // Get computed direction to handle RTL layout
      const computedDir = window.getComputedStyle(rootElementRef.current).direction;
      const placement = computedDir === "rtl" ? "bottom-end" : "bottom-start";

      const popperInstance = createPopper(warningIconRef.current, tooltipPopperRef.current, {
        placement: placement,
        // @ts-ignore
        modifiers: tooltipPopperModifiers,
      });
      // @ts-ignore
      tooltipPopperRef.current.style.display = "block";

      // Clean up function
      return () => {
        popperInstance.destroy();
      };
    }
  }, [warningIconHovered, invalidValues.length]);

  /**
   * Handle option selection
   * @param {string} selectedValue The selected option value
   */
  const handleOptionSelect = useCallback(
    /**
     * @param {string} selectedValue
     * @param {{ toggleSelected?: boolean }} [options]
     */
    (selectedValue, { toggleSelected = false } = {}) => {
      // Check if the option is disabled
      const option = allOptionsLookup[selectedValue];
      if (option?.disabled) {
        return;
      }
      if (values) {
        const isExistingOption = values.includes(selectedValue);
        let newValues;
        if (!isExistingOption || (toggleSelected && isExistingOption)) {
          if (toggleSelected && isExistingOption) {
            newValues = values.filter((v) => v !== selectedValue);
          } else {
            newValues = [...values, selectedValue];
          }
          onChange(newValues);
          updateSelectionAnnouncement(
            [selectedValue],
            newValues.length < values.length ? "removed" : "added",
          );
          undoStack.current.push(values);
          redoStack.current = [];
        }
      } else {
        if (
          singleSelectValue !== selectedValue ||
          (toggleSelected && singleSelectValue === selectedValue)
        ) {
          let newValue;
          if (toggleSelected && singleSelectValue === selectedValue) {
            newValue = "";
          } else {
            newValue = selectedValue;
          }
          onChange(newValue);
          updateSelectionAnnouncement([selectedValue], newValue ? "removed" : "added");
          undoStack.current.push([newValue]);
          redoStack.current = [];
          closeDropdown();
        }
        setInputValue("");
      }
    },
    [
      onChange,
      singleSelectValue,
      values,
      updateSelectionAnnouncement,
      closeDropdown,
      allOptionsLookup,
    ],
  );

  const focusInputWithVirtualKeyboardGuard = useCallback(
    /**
     * @param {Object} params
     * @param {HTMLInputElement | null} params.input
     * @param {boolean} [params.shouldPreventKeyboardReopen]
     * @param {boolean} [params.forceOpenKeyboard]
     * @param {{ current: ReturnType<typeof setTimeout> | null } | null} [params.readonlyResetTimeoutRef]
     */
    (params) => {
      const {
        input,
        shouldPreventKeyboardReopen = false,
        forceOpenKeyboard = false,
        readonlyResetTimeoutRef = null,
      } = params;
      if (!input) return;
      // If user explicitly closed the keyboard, we need to temporarily disable the input
      // to prevent the keyboard from being reopened.
      const shouldTemporarilyDisableInput = shouldPreventKeyboardReopen && !forceOpenKeyboard;
      if (shouldTemporarilyDisableInput) {
        input.setAttribute("readonly", "readonly");
      }
      // Does it make sense to focus the input if it's already focused?
      // Yes, because it's possible that the next event in the event loop
      // is the one that will trigger the a 'blur' event. To cancel the blur,
      // we need to focus the input again.
      input.focus();
      if (shouldTemporarilyDisableInput) {
        if (readonlyResetTimeoutRef?.current) {
          clearTimeout(readonlyResetTimeoutRef.current);
        }
        const removeReadonly = () => {
          input.removeAttribute("readonly");
          if (readonlyResetTimeoutRef) {
            readonlyResetTimeoutRef.current = null;
          }
        };
        if (readonlyResetTimeoutRef) {
          readonlyResetTimeoutRef.current = setTimeout(removeReadonly, 10);
        } else {
          setTimeout(removeReadonly, 10);
        }
      }
    },
    [],
  );

  const focusInput = useCallback(
    (forceOpenKeyboard = false) => {
      focusInputWithVirtualKeyboardGuard({
        input: inputRef.current,
        shouldPreventKeyboardReopen:
          getIsFocused() && virtualKeyboardExplicitlyClosedRef.current === true,
        forceOpenKeyboard,
      });
    },
    [getIsFocused, focusInputWithVirtualKeyboardGuard],
  );

  const openTray = useCallback(() => {
    if (!shouldUseTray) return;
    setIsTrayOpen(true);
    setIsDropdownOpen(false);
    trayClosedExplicitlyRef.current = false;
  }, [shouldUseTray, setIsDropdownOpen, setIsTrayOpen]);

  const closeTray = useCallback(() => {
    setIsTrayOpen(false);
    setTrayActiveInputValue("");
    trayClosedExplicitlyRef.current = true;
    focusInput(true);
  }, [setIsTrayOpen, focusInput]);

  const handleInputChange = useCallback(
    /**
     * Handle input change
     * @param {import('preact/compat').ChangeEvent<HTMLInputElement>} e - Input change event
     */
    (e) => {
      if (shouldUseTray) {
        e.preventDefault();
        openTray();
        return;
      }
      setInputValue(e.currentTarget.value);
      if (!dropdownClosedExplicitlyRef.current) {
        setIsDropdownOpen(true);
      }
    },
    [setIsDropdownOpen, shouldUseTray, openTray],
  );

  const handleTrayInputChange = useCallback(
    /**
     * Handle tray input change
     * @param {string} value - Input value
     */
    (value) => {
      setTrayActiveInputValue(value);
    },
    [],
  );

  /**
   * Tristate - null means virtual keyboard is not actively being detected.
   * True means virtual keyboard was explicitly closed.
   * False means virtual keyboard was not explicitly closed.
   * @type {import('preact').RefObject<boolean|null>}
   */
  const virtualKeyboardExplicitlyClosedRef = useRef(null);
  const virtualKeyboardDismissSubscription = useRef(/** @type {function | null} */ (null));

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
    if (shouldUseTray) {
      if (!trayClosedExplicitlyRef.current) {
        openTray();
      }
      trayClosedExplicitlyRef.current = false;
    } else {
      setIsDropdownOpen(true);
      dropdownClosedExplicitlyRef.current = false;
      if (!virtualKeyboardDismissSubscription.current) {
        virtualKeyboardDismissSubscription.current = subscribeToVirtualKeyboard({
          visibleCallback(isVisible) {
            virtualKeyboardExplicitlyClosedRef.current = !isVisible;
          },
        });
      }
    }
    updateSelectionAnnouncement(arrayValues);
  }, [
    setIsFocused,
    setIsDropdownOpen,
    openTray,
    arrayValues,
    updateSelectionAnnouncement,
    shouldUseTray,
  ]);

  // Delay blur to allow option selection
  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
    closeDropdown();
    dropdownClosedExplicitlyRef.current = false;
    // Auto-select matching option if single-select
    if (!multiple) {
      if (inputTrimmed && (allowFreeText || allOptionsLookup[inputTrimmed])) {
        handleOptionSelect(inputTrimmed);
      }
    }
    setInputValue("");
    setLastSelectionAnnouncement("");
    if (!shouldUseTray) {
      virtualKeyboardDismissSubscription.current?.();
      virtualKeyboardDismissSubscription.current = null;
      virtualKeyboardExplicitlyClosedRef.current = null;
    }
  }, [
    setIsFocused,
    allOptionsLookup,
    allowFreeText,
    handleOptionSelect,
    multiple,
    inputTrimmed,
    closeDropdown,
    shouldUseTray,
  ]);

  const handleAddNewOption = useCallback(
    /**
     * @param {string} newValue
     */
    (newValue) => {
      handleOptionSelect(newValue);
      // Set active descendant via ref
      optionsListboxRef.current?.setActiveDescendant(newValue);
    },
    [handleOptionSelect],
  );

  /**
   * Handle keydown events on the input
   */
  const handleKeyDown = useCallback(
    /**
     * @param {import('preact/compat').KeyboardEvent<HTMLInputElement>} e - Keyboard event
     */
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        // Try to select the active option first
        const selected = optionsListboxRef.current?.selectActive();
        // If nothing was selected and free text is allowed, add new option
        if (!selected && allowFreeText && inputTrimmed !== "") {
          handleAddNewOption(inputTrimmed);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
        // Navigate to next option
        optionsListboxRef.current?.navigateDown();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
        // Navigate to previous option
        optionsListboxRef.current?.navigateUp();
      } else if (e.key === "Escape") {
        closeDropdown(true);
      } else if (e.key === "Home" && e.ctrlKey && getIsDropdownOpen()) {
        e.preventDefault();
        optionsListboxRef.current?.navigateToFirst();
      } else if (e.key === "End" && e.ctrlKey && getIsDropdownOpen()) {
        e.preventDefault();
        optionsListboxRef.current?.navigateToLast();
        // Undo action
      } else if (inputValue === "" && (e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        const prevValues = undoStack.current.pop();
        if (prevValues) {
          onChange(prevValues);
          updateSelectionAnnouncement(prevValues);
          redoStack.current.push(Array.isArray(value) ? value : [value]);
        }
        // Redo action
      } else if (inputValue === "" && (e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        const nextValues = redoStack.current.pop();
        if (nextValues) {
          onChange(nextValues);
          updateSelectionAnnouncement(nextValues);
          undoStack.current.push(Array.isArray(value) ? value : [value]);
        }
      }
    },
    [
      allowFreeText,
      handleAddNewOption,
      inputValue,
      inputTrimmed,
      onChange,
      getIsDropdownOpen,
      setIsDropdownOpen,
      value,
      closeDropdown,
      updateSelectionAnnouncement,
    ],
  );
  /**
   * Handle paste event
   */
  const handlePaste = useCallback(
    /**
     * @param {import('preact/compat').ClipboardEvent<HTMLInputElement>} e - Clipboard event
     */
    (e) => {
      // only handle paste in multi-select mode
      if (!values) return;

      // e.preventDefault();
      // Get options array from lookup
      const allOptions = Object.values(allOptionsLookup);
      // Case 1 : Exact matches
      const valuesLookup = {
        ...Object.fromEntries(values.map((v) => [v, v])),
        ...Object.fromEntries(allOptions.map((o) => [o.value, o.value])),
      };
      // Case 2 : Case insensitive matches
      const valuesLowerCaseLookup = {
        ...Object.fromEntries(values.map((v) => [v.toLowerCase(), v])),
        ...Object.fromEntries(allOptions.map((o) => [o.value.toLowerCase(), o.value])),
      };
      // Case 3 : Case insensitive matches against label
      const optionsLabelLookup = Object.fromEntries(
        allOptions.map((o) => [o.label.toLowerCase(), o.value]),
      );
      const pastedText = e.clipboardData?.getData("text") || "";
      if (!pastedText) return;
      const pastedOptions = pastedText
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x !== "")
        .map(
          (x) =>
            valuesLookup[x] ||
            valuesLowerCaseLookup[x.toLowerCase()] ||
            optionsLabelLookup[x.toLocaleLowerCase()] ||
            x,
        );

      const newValues = unique([...values, ...pastedOptions]);
      onChange(newValues);
      updateSelectionAnnouncement(newValues, "added");
      undoStack.current.push(values);
      redoStack.current = [];
      // Note: Option re-rendering handled by AutocompleteList component
    },
    [allOptionsLookup, onChange, values, updateSelectionAnnouncement],
  );

  const handleClearValue = useCallback(() => {
    setInputValue("");
    onChange(multiple ? [] : "");
    updateSelectionAnnouncement(arrayValues, "removed");
    undoStack.current.push(arrayValues);
    redoStack.current = [];
    // If current input is focused, we need to prevent a blur event from being triggered
    // by focusing the input again. Else don't focus the input.
    if (getIsFocused()) {
      focusInput();
    }
  }, [onChange, multiple, arrayValues, updateSelectionAnnouncement, getIsFocused, focusInput]);

  const handleRootElementClick = useCallback(() => {
    if (!disabled) {
      if (shouldUseTray) {
        openTray();
      } else {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          // We regard an explicit click on the root element as an attempt to open the keyboard.
          focusInput(true);
        }
        // This set is not redundant as input may already be focused
        // and handleInputFocus may not be called
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
      }
    }
  }, [disabled, shouldUseTray, openTray, focusInput, setIsDropdownOpen]);

  // Memoize whatever JSX that can be memoized
  const selectChildren = useMemo(
    () =>
      formSubmitCompatible
        ? arrayValues
            .map((val) => (
              <option key={val} value={val} disabled={allOptionsLookup[val]?.disabled}>
                {allOptionsLookup[val]?.label || val}
              </option>
            ))
            .concat(
              typeof allowedOptions !== "function"
                ? allowedOptions
                    .filter((o) => !arrayValuesLookup.has(o.value))
                    .slice(0, maxNumberOfPresentedOptions - arrayValues.length)
                    .map((o) => (
                      <option key={o.value} value={o.value} disabled={o.disabled}>
                        {o.label}
                      </option>
                    ))
                : [],
            )
        : null,
    [
      arrayValues,
      allOptionsLookup,
      formSubmitCompatible,
      allowedOptions,
      arrayValuesLookup,
      maxNumberOfPresentedOptions,
    ],
  );

  // Update loading announcement when isLoading changes
  useEffect(() => {
    // Only announce loading if the list is open
    if (isLoading && isListOpen) {
      setLoadingAnnouncement(mergedTranslations.loadingOptionsAnnouncement);
    } else if (loadingAnnouncement && !isLoading && isListOpen) {
      // Only announce completion if we previously announced loading
      // and the list is still open
      setLoadingAnnouncement(
        filteredOptions.length
          ? mergedTranslations.optionsLoadedAnnouncement
          : mergedTranslations.noOptionsFoundAnnouncement,
      );
      // Clear the announcement after a delay
      const timer = setTimeout(() => {
        setLoadingAnnouncement("");
      }, 1000);
      return () => clearTimeout(timer);
    } else if (loadingAnnouncement && !isListOpen) {
      // Clear any loading announcements when list closes
      setLoadingAnnouncement("");
    }
  }, [
    isLoading,
    loadingAnnouncement,
    isListOpen,
    filteredOptions.length,
    mergedTranslations.loadingOptionsAnnouncement,
    mergedTranslations.optionsLoadedAnnouncement,
    mergedTranslations.noOptionsFoundAnnouncement,
  ]);

  // Determine if we should render interactive elements
  const isServerSideForm = isServer && formSubmitCompatible;

  // Callback to set dropdown ref for popper positioning
  const setDropdownRef = useCallback(
    /** @param {HTMLUListElement | null} el */
    (el) => {
      dropdownPopperRef.current = el;
    },
    [],
  );

  const optionsListbox = !isServer ? (
    <OptionsListbox
      ref={optionsListboxRef}
      id={id}
      searchText={activeInputValue}
      filteredOptions={filteredOptions}
      isLoading={isLoading}
      arrayValues={arrayValues}
      invalidValues={invalidValues}
      multiple={multiple}
      allowFreeText={allowFreeText}
      onOptionSelect={handleOptionSelect}
      onActiveDescendantChange={handleActiveDescendantChange}
      onClose={shouldUseTray ? closeTray : closeDropdown}
      optionRenderer={optionRenderer}
      warningIcon={warningIcon}
      tickIcon={tickIcon}
      optionIconRenderer={optionIconRenderer}
      showValue={showValue}
      language={language}
      loadingRenderer={loadingRenderer}
      translations={mergedTranslations}
      theme={theme}
      isOpen={isListOpen}
      shouldUseTray={shouldUseTray}
      setDropdownRef={setDropdownRef}
    />
  ) : null;

  return (
    <div
      className={[
        className,
        "PreactCombobox",
        disabled ? "PreactCombobox--disabled" : "",
        `PreactCombobox--${theme}`,
        tray === "auto" ? "PreactCombobox--trayAuto" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-disabled={disabled}
      onClick={handleRootElementClick}
      id={`${id}-root`}
      ref={rootElementRef}
      {...rootElementProps}
    >
      {/* Live region for announcing selections to screen readers */}
      <div className="PreactCombobox-srOnly" aria-live="polite" aria-atomic="true">
        {getIsFocused() ? lastSelectionAnnouncement : ""}
      </div>

      {/* Live region for announcing loading status to screen readers */}
      <div className="PreactCombobox-srOnly" aria-live="polite" aria-atomic="true">
        {getIsFocused() ? loadingAnnouncement : ""}
      </div>

      {/* Live region for announcing loading status to screen readers */}
      <div className="PreactCombobox-srOnly" aria-live="polite" aria-atomic="true">
        {invalidValues.length > 0 && getIsFocused()
          ? mergedTranslations.fieldContainsInvalidValues
          : ""}
      </div>

      <div className={`PreactCombobox-field ${disabled ? "PreactCombobox-field--disabled" : ""}`}>
        {!isServerSideForm && (
          <>
            {/* Show icon for single select mode */}
            {!multiple &&
              singleSelectValue &&
              allOptionsLookup[singleSelectValue] &&
              optionIconRenderer?.(allOptionsLookup[singleSelectValue], true)}
            <input
              id={id}
              ref={inputRef}
              type="text"
              value={inputValue}
              placeholder={
                !shouldUseTray && getIsDropdownOpen()
                  ? mergedTranslations.searchPlaceholder
                  : arrayValues.length > 0
                    ? arrayValues.map((value) => allOptionsLookup[value]?.label || value).join(", ")
                    : placeholder
              }
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={() => {
                // @ts-ignore
                blurTimeoutRef.current = setTimeout(handleInputBlur, 200);
              }}
              onPaste={handlePaste}
              className={`PreactCombobox-input ${
                multiple ? "PreactCombobox-input--multiple" : ""
              } ${disabled ? "PreactCombobox-input--disabled" : ""}`}
              role="combobox"
              aria-expanded={getIsDropdownOpen()}
              aria-haspopup="listbox"
              aria-controls={`${id}-options-listbox`}
              aria-activedescendant={
                activeDescendantValue
                  ? `${id}-option-${toHTMLId(activeDescendantValue)}`
                  : undefined
              }
              disabled={disabled}
              required={required && arrayValues.length === 0}
              {...inputProps}
            />
            {!disabled && showClearButton && arrayValues.length > 0 ? (
              <button
                type="button"
                className="PreactCombobox-clearButton"
                aria-label={mergedTranslations.clearValue}
                onClick={handleClearValue}
              >
                <span aria-hidden="true">&#x2715;</span>
              </button>
            ) : null}
            {invalidValues.length > 0 && (
              <span
                ref={warningIconRef}
                className="PreactCombobox-warningIconWrapper"
                onMouseEnter={() => setWarningIconHovered(true)}
                onMouseLeave={() => setWarningIconHovered(false)}
              >
                {warningIcon}
              </span>
            )}
            {multiple && arrayValues.length > 1 && (
              <span className="PreactCombobox-badge">
                {mergedTranslations.selectedCountFormatter(arrayValues.length, language)}
              </span>
            )}
            {chevronIcon}
          </>
        )}

        {/* This is a hidden select element to allow for form submission */}
        {formSubmitCompatible ? (
          <select
            {...selectElementProps}
            multiple={multiple}
            hidden={!isServerSideForm}
            tabIndex={isServerSideForm ? 0 : -1}
            readOnly={!isServerSideForm}
            // @ts-expect-error this is a valid react attribute
            value={value}
            name={name}
            size={1}
            className={isServerSideForm ? "PreactCombobox-formSelect" : ""}
          >
            {selectChildren}
          </select>
        ) : null}
      </div>

      {optionsListbox ? (
        <Portal parent={portal} rootElementRef={rootElementRef}>
          {shouldUseTray ? (
            <TraySearchList
              id={id}
              isOpen={getIsTrayOpen()}
              onClose={closeTray}
              trayLabel={getTrayLabel() || ""}
              theme={theme}
              translations={mergedTranslations}
              onInputChange={handleTrayInputChange}
            >
              {optionsListbox}
            </TraySearchList>
          ) : (
            optionsListbox
          )}
        </Portal>
      ) : null}
      {invalidValues.length > 0 && warningIconHovered && !isServer && (
        <Portal parent={portal} rootElementRef={rootElementRef}>
          <div
            className={`PreactCombobox-valueTooltip ${`PreactCombobox--${theme}`}`}
            role="tooltip"
            ref={tooltipPopperRef}
          >
            {mergedTranslations.invalidValues}
            {invalidValues.map((value) => (
              <div key={value} className="PreactCombobox-tooltipValue">
                {value}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
};

export default PreactCombobox;
