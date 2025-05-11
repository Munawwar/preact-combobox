// TODO: Think about internationalization
import { createPopper } from "@popperjs/core";
import { createPortal } from "preact/compat";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "preact/hooks";
import { useDeepMemo, useLive } from "./hooks.js";
import "./PreactCombobox.css";

// --- types ---
/**
 * @typedef {Object} Option
 * @property {string} label - The display text for the option
 * @property {string} value - The value of the option
 * @property {VNode | string} [icon] - Optional icon element or URL to display before the label
 */

/**
 * @typedef {Object} OptionMatch
 * @property {string} label - The display text for the option
 * @property {string} value - The value of the option
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
 * @typedef {({
 *   option: OptionMatch,
 *   language: string,
 *   isSelected: boolean,
 *   isInvalid: boolean,
 *   isActive: boolean,
 *   showValue: boolean,
 * }) => VNode} OptionTransformFunction
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
 * @property {string} [language='en'] Language for word splitting and matching. The language can be any language tag
 * recognized by Intl.Segmenter and Intl.Collator
 * @property {boolean} [showValue=false] experimental feature.
 * @property {boolean} [disabled=false] Disable the component
 * @property {boolean} [required=false] Is required for form submission
 * @property {string} [name] name to be set on hidden select element
 * @property {string} [className]
 * @property {string} [placeholder]
 *
 * @property {Record<string, any>} [rootElementProps] Root element props
 * @property {Record<string, any>} [inputProps] Input element props
 * @property {boolean} [formSubmitCompatible=false] Render a hidden select for progressive enhanced compatible form submission
 * @property {boolean} [isServer] Whether the component is rendered on the server (auto-detected if not provided).
 * This prop is only relevant if formSubmitCompatible is true.
 * @property {Record<string, any>} [selectElementProps] Props for the hidden select element. This is useful for forms
 *
 * @property {HTMLElement} [portal=document.body] The element to render the Dropdown <ul> element
 * @property {OptionTransformFunction} [optionTransform=identity] Transform the label text
 * @property {VNode | string} [warningIcon] Custom warning icon element or component
 * @property {VNode | string} [chevronIcon] Custom chevron icon element or component
 * @property {VNode | string} [loadingIndicator] Custom loading indicator element or text
 */

// --- end of types ---

// @ts-ignore
const isPlaywright = navigator.webdriver === true;

// Auto-detect server-side rendering
const isServerDefault = typeof self === 'undefined';

/**
 * @param {string[]} arr Array to remove duplicates from
 */
function unique(arr) {
  return Array.from(new Set(arr));
}

/**
 * Converts any text into a valid HTML ID attribute value.
 * Returns empty string if text becomes empty after removing invalid characters.
 *
 * @param {string} text - The text to convert into an HTML ID
 * @returns {string} A valid HTML ID or empty string
 */
function toHTMLId(text) {
  // Remove any characters that are not letters, numbers, hyphens, underscores, colons, or periods
  return text.replace(/[^a-zA-Z0-9\-_:.]/g, "");
}

/**
 * @template {OptionMatch|Option} T
 * @param {T[]} options
 * @param {string[]} values
 * @returns {T[]}
 */
function sortValuesToTop(options, values) {
  const selectedSet = new Set(values);
  return options.sort((a, b) => {
    const aSelected = selectedSet.has(a.value);
    const bSelected = selectedSet.has(b.value);
    if (aSelected === bSelected) return 0;
    return aSelected ? -1 : 1;
  });
}

/**
 * @param {Object} props - Props for the PopperContent component
 * @param {HTMLElement} [props.parent=document.body] The parent element to render the PopperContent component
 * @param {VNode[]} props.children The children to render
 */
const Portal = ({ parent = document.body, children }) => createPortal(children, parent);

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
    fn: ({ state }) => {
      state.styles.popper.minWidth = `${state.rects.reference.width}px`;
    },
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

/** @type {Record<string, LanguageCache>} */
const languageCache = {};

/**
 * @param {string} query
 * @param {Option} option
 * @param {string} language
 * @returns {OptionMatch|null}
 */
function getExactMatchScore(query, option, language) {
  const { label, value, ...rest } = option;
  if (value === query) {
    return {
      ...rest,
      label,
      value,
      score: 9,
      /** @type {'value'} */
      matched: "value",
      /** @type {Array<[number, number]>} */
      matchSlices: [[0, value.length]],
    };
  }
  if (label === query) {
    return {
      ...rest,
      label,
      value,
      score: 9,
      /** @type {'label'} */
      matched: "label",
      /** @type {Array<[number, number]>} */
      matchSlices: [[0, label.length]],
    };
  }

  const { caseMatcher } = languageCache[language];
  if (caseMatcher.compare(value, query) === 0) {
    return {
      ...rest,
      label,
      value,
      score: 7,
      /** @type {'value'} */
      matched: "value",
      /** @type {Array<[number, number]>} */
      matchSlices: [[0, value.length]],
    };
  }
  if (caseMatcher.compare(label, query) === 0) {
    return {
      ...rest,
      label,
      value,
      score: 7,
      /** @type {'label'} */
      matched: "label",
      /** @type {Array<[number, number]>} */
      matchSlices: [[0, label.length]],
    };
  }

  return null;
}

/**
 * Calculates the match score between a query text and a list of option labels.
 * It returns scores for each option sorted in descending order.
 *
 * It takes the `query` string, evaluates the following rules in order and assigns the one with highest score:
 * - Score 7: If whole query matches a label on an option (Case insensitive match)
 * - Score 5: Same as previous check but this time case and accent insensitive matching
 * - Score 3: Phrase matching (e.g. "word1 partialWord2*")
 * - Score 0-1: Number of words matched / total number of words in query (e.g. "word1")
 *
 * @param {string} query - The query text to match against options.
 * @param {Option[]} options
 * @param {string} [language='en'] Language to use for word splitting and matching
 * @param {boolean} [filterAndSort=true] Whether to filter and sort the results. If false, returns all options but with attempted matches.
 * @returns {Array<OptionMatch>}
 */
function getMatchScore(query, options, language = "en", filterAndSort = true) {
  // biome-ignore lint/style/noParameterAssign: ignore
  query = query.trim();

  if (!query) {
    const matchSlices = [];
    return options.map((option) => ({
      ...option,
      label: option.label,
      value: option.value,
      score: 0,
      matched: "none",
      matchSlices,
    }));
  }

  if (!languageCache[language]) {
    languageCache[language] = {
      baseMatcher: new Intl.Collator(language, {
        usage: "search",
        sensitivity: "base",
      }),
      caseMatcher: new Intl.Collator(language, {
        usage: "search",
        sensitivity: "accent",
      }),
      wordSegmenter: new Intl.Segmenter(language, {
        granularity: "word",
      }),
    };
  }
  const { baseMatcher, caseMatcher, wordSegmenter } = languageCache[language];

  const isCommaSeparated = query.includes(",");

  let querySegments;
  let queryWords;
  let matches = options.map((option) => {
    const { label, value, ...rest } = option;
    if (isCommaSeparated) {
      const querySegments = query.split(",");
      const matches = querySegments
        .map((querySegment) => getExactMatchScore(querySegment.trim(), option, language))
        .filter((match) => match !== null)
        .sort((a, b) => b.score - a.score);
      return (
        matches[0] || {
          ...rest,
          label,
          value,
          score: 0,
          matched: "none",
        }
      );
    }

    // Rule 1: Exact match (case sensitive)
    // Rule 2: Exact match (case insensitive)
    const exactMatch = getExactMatchScore(query, option, language);
    if (exactMatch) {
      return exactMatch;
    }

    // Rule 3: Exact match with accents normalized (case insensitive)
    if (baseMatcher.compare(label, query) === 0) {
      return {
        ...rest,
        label,
        value,
        score: 5,
        /** @type {'label'} */
        matched: "label",
        /** @type {Array<[number, number]>} */
        matchSlices: [[0, label.length]],
      };
    }
    if (baseMatcher.compare(value, query) === 0) {
      return {
        ...rest,
        label,
        value,
        score: 5,
        /** @type {'value'} */
        matched: "value",
        /** @type {Array<[number, number]>} */
        matchSlices: [[0, value.length]],
      };
    }

    // Rule 4: Phrase match (imagine a wildcard query like "word1 partialWord2*")
    // This match needs to be case and accent insensitive
    if (!querySegments) {
      querySegments = Array.from(wordSegmenter.segment(query));
    }
    const labelWordSegments = Array.from(wordSegmenter.segment(label.trim()));
    let len = 0;
    let firstIndex = -1;
    for (let i = 0; i < labelWordSegments.length; i++) {
      const labelWordSegment = labelWordSegments[i];
      const querySegment = querySegments[len];
      if (len === querySegments.length - 1) {
        // check for partial word match
        // I can't use labelWordSegment.segment.startsWith(querySegment.segment) because it's case and accent sensitive
        const lastQueryWord = querySegment.segment;
        if (
          baseMatcher.compare(
            labelWordSegment.segment.slice(0, lastQueryWord.length),
            lastQueryWord,
          ) === 0
        ) {
          return {
            ...rest,
            label,
            value,
            score: 3,
            /** @type {'label'} */
            matched: "label",
            /** @type {Array<[number, number]>} */
            // @ts-ignore
            matchSlices: [
              [
                firstIndex > -1 ? firstIndex : labelWordSegment.index,
                labelWordSegment.index + lastQueryWord.length,
              ],
            ],
          };
        }
      } else if (baseMatcher.compare(labelWordSegment.segment, querySegment.segment) === 0) {
        len++;
        if (len === 1) {
          firstIndex = labelWordSegment.index;
        }
        continue;
      }
      len = 0;
      firstIndex = -1;
    }
    // Also check for partial value match (this doesn't need accent check)
    if (caseMatcher.compare(value.slice(0, query.length), query) === 0) {
      return {
        ...rest,
        label,
        value,
        score: 3,
        /** @type {'value'} */
        matched: "value",
        /** @type {Array<[number, number]>} */
        matchSlices: [[0, query.length]],
      };
    }

    // Rule 5: Word matches
    if (!queryWords) {
      queryWords = querySegments.filter((s) => s.isWordLike);
    }
    const labelWords = labelWordSegments.filter((s) => s.isWordLike);
    /** @type {Array<[number, number]|undefined>} */
    const slices = queryWords.map((word) => {
      const match = labelWords.find(
        (labelWord) => baseMatcher.compare(labelWord.segment, word.segment) === 0,
      );
      if (match) {
        return [match.index, match.index + match.segment.length];
      }
    });
    // TODO: Do we need a deep equal de-duplication here?
    const matchSlices = slices.filter((s) => s !== undefined).sort((a, b) => a[0] - b[0]);
    const wordScoring = matchSlices.length / queryWords.length;
    return {
      ...rest,
      label,
      value,
      score: wordScoring,
      /** @type {'label'|'none'} */
      matched: wordScoring ? "label" : "none",
      matchSlices,
    };
  });

  if (filterAndSort) {
    matches = matches.filter((match) => match.score > 0);
    matches.sort((a, b) => {
      if (a.score === b.score) {
        const val = a.label.localeCompare(b.label, undefined, {
          sensitivity: "base",
        });
        return val === 0 ? a.value.localeCompare(b.value, undefined, { sensitivity: "base" }) : val;
      }
      return b.score - a.score;
    });
  }
  return matches;
}

/**
 * @param {OptionMatch['matchSlices']} matchSlices
 * @param {string} text
 * @returns {VNode[]}
 */
export function matchSlicesToNodes(matchSlices, text) {
  const nodes = /** @type {VNode[]} */ ([]);
  let index = 0;
  matchSlices.map((slice) => {
    const [start, end] = slice;
    // console.log(slice);
    if (index < start) {
      // console.log(label.slice(index, start));
      nodes.push(<span key={`${index}-${start}`}>{text.slice(index, start)}</span>);
    }
    // console.log(label.slice(start, end));
    nodes.push(<u key={`${start}-${end}`}>{text.slice(start, end)}</u>);
    index = end;
  });
  if (index < text.length) {
    // console.log(label.slice(index));
    nodes.push(<span key={`${index}-${text.length}`}>{text.slice(index)}</span>);
  }
  return nodes;
}

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

const defaultLoadingIndicator = (
  <li className="PreactCombobox-option" aria-disabled>
    Loading...
  </li>
);

/**
 * @type {OptionTransformFunction}
 */
export function defaultOptionTransform({
  option,
  isSelected,
  isInvalid,
  showValue,
}) {
  const isLabelSameAsValue = option.value === option.label;
  const getLabel = (labelNodes, valueNodes) => (
    <>
      {option.icon && (
        <span className="PreactCombobox-optionIcon" aria-hidden="true">
          {option.icon}
        </span>
      )}
      <span className="PreactCombobox-labelFlex">
        <span>{labelNodes}</span>
        {isLabelSameAsValue || !showValue ? null : (
          <span className="PreactCombobox-value" aria-hidden="true">
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
        className={`PreactCombobox-checkbox ${
          isSelected ? "PreactCombobox-checkbox--selected" : ""
        }`}
      >
        {isSelected && <span aria-hidden="true">✓</span>}
      </span>
      {labelElement}
      {isInvalid && warningIcon}
    </>
  );
}

function defaultSingleSelectedStateIcon(option) {
  return (
    <span className="PreactCombobox-optionIcon" aria-hidden="true">
      {option.icon}
    </span>
  );
}

const defaultArrayValue = [];

/**
 * Creates a human-readable announcement of selected items
 * @param {string[]} selectedValues - Array of selected values
 * @param {"added"|"removed"|null} diff - Lookup object containing option labels
 * @param {Object} optionsLookup - Lookup object containing option labels
 * @returns {string} - Human-readable announcement of selections
 */
function formatSelectionAnnouncement(selectedValues, diff, optionsLookup) {
  if (!selectedValues || selectedValues.length === 0) {
    return "No options selected";
  }

  const labels = selectedValues.map((value) => optionsLookup[value]?.label || value);

  const prefix = diff ? `${diff} selection` : "currently selected";

  if (selectedValues.length <= 3) {
    return `${prefix} ${new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(labels)}`;
  }

  const firstThree = labels.slice(0, 3);
  const remaining = selectedValues.length - 3;
  return `${prefix} ${firstThree.join(", ")} and ${remaining} more option${remaining > 1 ? "s" : ""}`;
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
  optionTransform = defaultOptionTransform,
  singleSelectedStateIcon = defaultSingleSelectedStateIcon,
  // private option for now
  maxNumberOfPresentedOptions = 100,
  warningIcon = defaultWarningIcon,
  chevronIcon = defaultChevronIcon,
  loadingIndicator = defaultLoadingIndicator,
}) => {
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
  const allowedOptionsAsKey = useDeepMemo(
    typeof allowedOptions === "function" ? null : allowedOptions,
  );

  const autoId = useId();
  const id = idProp || autoId;
  const [inputValue, setInputValue] = useState("");
  const [getIsDropdownOpen, setIsDropdownOpen, hasDropdownOpenChanged] = useLive(false);
  const cachedOptions = useRef(/** @type {{ [value: string]: Option }} */ ({}));
  const [filteredOptions, setFilteredOptions] = useState(/** @type {OptionMatch[]} */ ([]));
  const [isLoading, setIsLoading] = useState(false);
  const [getIsFocused, setIsFocused] = useLive(false);
  // For screen reader announcement
  const [lastSelectionAnnouncement, setLastSelectionAnnouncement] = useState("");
  // For loading status announcements
  const [loadingAnnouncement, setLoadingAnnouncement] = useState("");
  // NOTE: Using ref for performance. Setting few attributes by re-rendering a large list is too expensive.
  const activeDescendant = useRef("");
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

  const inputTrimmed = inputValue.trim();

  const updateCachedOptions = useCallback(
    /** @param {Option[]} update */
    (update) => {
      for (const item of update) {
        cachedOptions.current[item.value] = item;
      }
    },
    [],
  );

  const allOptions = useDeepMemo(
    Array.isArray(allowedOptions) ? allowedOptions : Object.values(cachedOptions.current),
  );
  const allOptionsLookup = useMemo(
    () =>
      allOptions.reduce((acc, o) => {
        acc[o.value] = o;
        return acc;
      }, {}),
    [allOptions],
  );
  const invalidValues = useMemo(() => {
    if (allowFreeText) return [];
    return arrayValues?.filter((v) => !allOptionsLookup[v]) || [];
  }, [allowFreeText, arrayValues, allOptionsLookup]);

  const updateSelectionAnnouncement = useCallback(
    (selectedValues, isDiff = false) => {
      const announcement = formatSelectionAnnouncement(selectedValues, isDiff, allOptionsLookup);
      setLastSelectionAnnouncement(announcement);
    },
    [allOptionsLookup],
  );

  /**
   * Note that aria-activedescendant only works with HTML id attributes.
   * @param {string} optionValue - The value of the option to activate
   * @param {boolean} [scroll=true] Scroll to the option if it's not already in view
   */
  const activateDescendant = useCallback(
    (optionValue, scroll = true) => {
      // NOTE: Using direct DOM API for performance
      // Remove current active element CSS
      if (activeDescendant.current && dropdownPopperRef.current) {
        const el = dropdownPopperRef.current.querySelector(".PreactCombobox-option--active");
        el?.classList.remove("PreactCombobox-option--active");
        // Remove non-active options from screen reader announcement
        el?.querySelector('span[data-reader="selected"]')?.setAttribute("aria-hidden", "true");
        el?.querySelector('span[data-reader="invalid"]')?.setAttribute("aria-hidden", "true");
      }

      activeDescendant.current = optionValue;

      // Set the places in DOM where aria-activedescendant and aria-selected are set
      const elementId = optionValue ? `${id}-option-${toHTMLId(optionValue)}` : "";
      inputRef.current?.setAttribute("aria-activedescendant", elementId);
      if (elementId && dropdownPopperRef.current) {
        const activeDescendantElement = dropdownPopperRef.current.querySelector(`#${elementId}`);
        if (activeDescendantElement) {
          activeDescendantElement.classList.add("PreactCombobox-option--active");
          activeDescendantElement
            .querySelector('span[data-reader="selected"]')
            ?.setAttribute("aria-hidden", "false");
          activeDescendantElement
            .querySelector('span[data-reader="invalid"]')
            ?.setAttribute("aria-hidden", "false");
          if (scroll) {
            const dropdownRect = dropdownPopperRef.current.getBoundingClientRect();
            const itemRect = activeDescendantElement.getBoundingClientRect();

            if (itemRect.top < dropdownRect.top) {
              dropdownPopperRef.current.scrollTop += itemRect.top - dropdownRect.top;
            } else if (itemRect.bottom > dropdownRect.bottom) {
              dropdownPopperRef.current.scrollTop += itemRect.bottom - dropdownRect.bottom;
            }
          }
        }
      }
    },
    [id],
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

      activateDescendant("");
    },
    [setIsDropdownOpen, activateDescendant, updateSelectionAnnouncement, arrayValues],
  );

  // Setup popper when dropdown is opened
  // Reset activeDescendant and filteredOptions when dropdown closes
  useEffect(() => {
    if (getIsDropdownOpen() && rootElementRef.current && dropdownPopperRef.current) {
      const popperInstance = createPopper(rootElementRef.current, dropdownPopperRef.current, {
        placement: "bottom-start",
        // @ts-ignore
        modifiers: dropdownPopperModifiers,
      });
      dropdownPopperRef.current.style.display = "block";
      // Clean up function
      return () => {
        popperInstance.destroy();
      };
    }
  }, [getIsDropdownOpen]);

  const abortControllerRef = useRef(/** @type {AbortController | null} */ (null));
  const inputTypingDebounceTimer = useRef(/** @type {any} */ (null));
  const newUnknownValues = arrayValues.filter((v) => !allOptionsLookup[v]);
  const newUnknownValuesAsKey = useMemo(() => JSON.stringify(newUnknownValues), [newUnknownValues]);
  // Fill the dropdown with options on open and also on input change
  // Not on useEffect deps:
  // arrayValues doesn't need to be a dependency except on an unexpected selection change from parent
  // because options info don't change on arrayValues change rather only the toggle state of the rendered
  // option changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above comment
  useEffect(() => {
    const shouldFetchOptions = getIsDropdownOpen() || typeof allowedOptions === "function";
    if (!shouldFetchOptions) return;

    const abortController = typeof allowedOptions === "function" ? new AbortController() : null;
    abortControllerRef.current?.abort();
    abortControllerRef.current = abortController;

    let debounceTime = 0; // for local data
    if (
      typeof allowedOptions === "function" &&
      !(
        // don't debounce for initial render (when we have to resolve the labels for selected values).
        // don't debounce for first time the dropdown is opened as well.
        (newUnknownValues.length > 0 || (getIsDropdownOpen() && hasDropdownOpenChanged))
      ) &&
      // Hack: We avoid debouncing to speed up playwright tests
      !isPlaywright
    ) {
      // a typical user types 4 characters per second, so 250ms is a good debounce time
      debounceTime = 250;
    }
    clearTimeout(inputTypingDebounceTimer.current);

    const callback = async () => {
      if (typeof allowedOptions === "function") {
        const [searchResults, selectedResults] = await Promise.all([
          getIsDropdownOpen()
            ? allowedOptions(
                inputTrimmed,
                maxNumberOfPresentedOptions,
                arrayValues,
                abortController.signal,
              )
            : [],
          // We need to fetch unknown options's labels regardless of whether the dropdown
          // is open or not, because we want to show it in the placeholder.
          newUnknownValues.length > 0
            ? allowedOptions(
                newUnknownValues,
                newUnknownValues.length,
                arrayValues,
                abortController.signal,
              )
            : null,
        ]).catch(() => {
          if (abortController.signal.aborted) {
            return [null, null];
          }
          setIsLoading(false);
          throw error;
        });

        setIsLoading(false);
        if (searchResults?.length) {
          updateCachedOptions(searchResults);
        }
        if (selectedResults?.length) {
          updateCachedOptions(selectedResults);
        }
        let updatedOptions = searchResults || [];
        // Handle case where backend doesn't return labels for all the sent selections
        if (!inputTrimmed) {
          const unreturnedValues = newUnknownValues
            .filter((v) => !cachedOptions.current[v])
            .map((v) => ({ label: v, value: v }));
          if (unreturnedValues.length > 0) {
            updateCachedOptions(unreturnedValues);
            updatedOptions = unreturnedValues.concat(searchResults);
          }
        }
        // when search is applied don't sort the selected values to the top
        const options = inputTrimmed
          ? updatedOptions
          : sortValuesToTop(updatedOptions, arrayValues);
        // we don't need to re-sort what the backend returns, so pass filterAndSort=false to getMatchScore()
        setFilteredOptions(getMatchScore(inputTrimmed, options, language, false));
      } else {
        const mergedOptions = arrayValues
          .filter((v) => !allOptionsLookup[v])
          .map((v) => ({ label: v, value: v }))
          .concat(allowedOptions);
        // when search is applied don't sort the selected values to the top
        const options = inputValue ? mergedOptions : sortValuesToTop(mergedOptions, arrayValues);
        setFilteredOptions(getMatchScore(inputValue, options, language, true));
      }
    };

    // We need to set isLoading immediately to show "loading" state without waiting
    // for the debounce to complete so that playwright tests don't need an arbitrary
    // wait delay for the options to load.
    if (typeof allowedOptions === "function") {
      setIsLoading(true);
    }

    let timer = null;
    if (debounceTime > 0) {
      timer = setTimeout(callback, debounceTime);
    } else {
      callback();
    }
    inputTypingDebounceTimer.current = timer;

    // Clean up function
    return () => {
      abortController?.abort();
      if (timer) clearTimeout(timer);
    };
  }, [getIsDropdownOpen, inputTrimmed, language, newUnknownValuesAsKey, allowedOptionsAsKey]);
  useEffect(() => {
    if (
      invalidValues.length > 0 &&
      warningIconHovered &&
      warningIconRef.current &&
      tooltipPopperRef.current
    ) {
      const popperInstance = createPopper(warningIconRef.current, tooltipPopperRef.current, {
        placement: "bottom-start",
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
    (selectedValue, { toggleSelected = false } = {}) => {
      if (values) {
        const existingOption = values.includes(selectedValue);
        let newValues;
        if (!existingOption || (toggleSelected && existingOption)) {
          if (toggleSelected && existingOption) {
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
    [onChange, singleSelectValue, values, updateSelectionAnnouncement, closeDropdown],
  );

  const handleInputChange = useCallback(
    /**
     * Handle input change
     * @param {import('preact/compat').ChangeEvent<HTMLInputElement>} e - Input change event
     */
    (e) => {
      setInputValue(e.currentTarget.value);
      if (!dropdownClosedExplicitlyRef.current) {
        setIsDropdownOpen(true);
      }
    },
    [setIsDropdownOpen],
  );

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
    setIsDropdownOpen(true);
    dropdownClosedExplicitlyRef.current = false;
    updateSelectionAnnouncement(arrayValues);
  }, [setIsFocused, setIsDropdownOpen, arrayValues, updateSelectionAnnouncement]);

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
  }, [
    setIsFocused,
    allOptionsLookup,
    allowFreeText,
    handleOptionSelect,
    multiple,
    inputTrimmed,
    closeDropdown,
  ]);

  /**
   * FIXME: Add a clear/remove button
   * Handle option removal
   * @param {string} option The option to remove
   * @param {boolean} [focusNext=false] Whether to focus the next button in the tab order or to focus the autocomplete input field
   */
  // const handleRemoveOption = useCallback(
  //   (option, focusNext = false) => {
  //     if (!values) {
  //       // single-select mode
  //       const newValue = "";
  //       inputRef.current?.focus();
  //       onChange(newValue);
  //       updateSelectionAnnouncement([option], 'removed');
  //       undoStack.current.push([newValue]);
  //       redoStack.current = [];
  //     } else {
  //       // multi-select mode
  //       const newValues = values.filter((val) => val !== option);
  //       const nextEl = document.activeElement?.closest("span")?.nextElementSibling;
  //       if (focusNext && nextEl && nextEl.tagName === "SPAN" && nextEl.querySelector("button")) {
  //         nextEl.querySelector("button")?.focus();
  //       } else {
  //         inputRef.current?.focus();
  //       }
  //       onChange(newValues);
  //       updateSelectionAnnouncement(newValues, 'removed');
  //       undoStack.current.push(values);
  //       redoStack.current = [];
  //     }
  //     clearTimeout(blurTimeoutRef.current);
  //     blurTimeoutRef.current = undefined;
  //   },
  //   [onChange, values],
  // );

  const addNewOptionVisible =
    !isLoading &&
    allowFreeText &&
    inputTrimmed &&
    !arrayValues.includes(inputTrimmed) &&
    !filteredOptions.find((o) => o.value === inputTrimmed);

  const handleAddNewOption = useCallback(
    (newValue) => {
      handleOptionSelect(newValue);
      setFilteredOptions((options) => {
        // biome-ignore lint/style/noParameterAssign:
        options = [
          /** @type {OptionMatch} */ ({
            label: newValue,
            value: newValue,
          }),
        ].concat(options);
        const isRemoteSearch = typeof allowedOptions === "function";
        return getMatchScore(inputTrimmed, options, language, !isRemoteSearch);
      });
      activateDescendant(newValue);
    },
    [allowedOptions, language, handleOptionSelect, activateDescendant, inputTrimmed],
  );

  /**
   * Handle keydown events on the input
   * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event
   */
  const handleKeyDown = useCallback(
    (e) => {
      const currentActiveDescendant = activeDescendant.current;
      if (e.key === "Enter") {
        e.preventDefault();
        const currentIndex = currentActiveDescendant
          ? filteredOptions.findIndex((o) => o.value === currentActiveDescendant)
          : -1;
        if (currentIndex > -1) {
          handleOptionSelect(filteredOptions[currentIndex].value, {
            toggleSelected: true,
          });
        } else if (allowFreeText && inputTrimmed !== "") {
          handleAddNewOption(inputTrimmed);
        }
        // ArrowDown highlights next option
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
        if (!filteredOptions.length && !addNewOptionVisible) return;
        const currentIndex = currentActiveDescendant
          ? filteredOptions.findIndex((o) => o.value === currentActiveDescendant)
          : -1;
        if (
          addNewOptionVisible &&
          currentActiveDescendant !== inputTrimmed &&
          (currentIndex < 0 || currentIndex === filteredOptions.length - 1)
        ) {
          activateDescendant(inputTrimmed);
        } else if (filteredOptions.length) {
          const nextIndex = currentIndex === filteredOptions.length - 1 ? 0 : currentIndex + 1;
          activateDescendant(filteredOptions[nextIndex].value);
        }
        // ArrowUp highlights previous option
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
        if (!filteredOptions.length && !addNewOptionVisible) return;
        const currentIndex = currentActiveDescendant
          ? filteredOptions.findIndex((o) => o.value === currentActiveDescendant)
          : 0;
        if (
          addNewOptionVisible &&
          currentActiveDescendant !== inputTrimmed &&
          ((currentIndex === 0 && currentActiveDescendant) || !filteredOptions.length)
        ) {
          activateDescendant(inputTrimmed);
        } else if (filteredOptions.length) {
          const prevIndex = (currentIndex - 1 + filteredOptions.length) % filteredOptions.length;
          activateDescendant(filteredOptions[prevIndex].value);
        }
        // Escape blurs input
      } else if (e.key === "Escape") {
        closeDropdown(true);
        // Home key navigates to first option
      } else if (e.key === "Home" && e.ctrlKey && getIsDropdownOpen()) {
        e.preventDefault();
        if (filteredOptions.length > 0) {
          activateDescendant(filteredOptions[0].value);
        } else if (addNewOptionVisible) {
          activateDescendant(inputTrimmed);
        }
        // End key navigates to last option
      } else if (e.key === "End" && e.ctrlKey && getIsDropdownOpen()) {
        e.preventDefault();
        if (filteredOptions.length > 0) {
          activateDescendant(filteredOptions[filteredOptions.length - 1].value);
        } else if (addNewOptionVisible) {
          activateDescendant(inputTrimmed);
        }
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
      activateDescendant,
      allowFreeText,
      filteredOptions,
      addNewOptionVisible,
      handleOptionSelect,
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
   * @param {React.ClipboardEvent<HTMLInputElement>} e - Clipboard event
   */
  const handlePaste = useCallback(
    (e) => {
      // only handle paste in multi-select mode
      if (!values) return;

      // e.preventDefault();
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
      const pastedText = e.clipboardData.getData("text");
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
      // force a re-render
      setFilteredOptions((filteredOptions) => filteredOptions.slice());
    },
    [allOptions, onChange, values, updateSelectionAnnouncement],
  );

  const handleClearValue = useCallback(() => {
    if (!singleSelectValue) return;
    setInputValue("");
    onChange("");
    updateSelectionAnnouncement([singleSelectValue], "removed");
    undoStack.current.push([singleSelectValue]);
    redoStack.current = [];
  }, [onChange, singleSelectValue, updateSelectionAnnouncement]);

  // Memoize whatever JSX that can be memoized
  const selectChildren = useMemo(
    () =>
      formSubmitCompatible
        ? arrayValues.map((val) => (
            <option key={val} value={val}>
              {allOptionsLookup[val]?.label || val}
            </option>
          ))
        : null,
    [arrayValues, allOptionsLookup, formSubmitCompatible],
  );

  // Update loading announcement when isLoading changes
  useEffect(() => {
    // Only announce loading if the dropdown is open
    if (isLoading && getIsDropdownOpen()) {
      setLoadingAnnouncement("Loading options, please wait...");
    } else if (loadingAnnouncement && !isLoading && getIsDropdownOpen()) {
      // Only announce completion if we previously announced loading
      // and the dropdown is still open
      setLoadingAnnouncement(filteredOptions.length ? "Options loaded." : "No options found.");
      // Clear the announcement after a delay
      const timer = setTimeout(() => {
        setLoadingAnnouncement("");
      }, 1000);
      return () => clearTimeout(timer);
    } else if (loadingAnnouncement && !getIsDropdownOpen()) {
      // Clear any loading announcements when dropdown closes
      setLoadingAnnouncement("");
    }
  }, [isLoading, loadingAnnouncement, getIsDropdownOpen, filteredOptions.length]);

  // Determine if we should render interactive elements
  const isServerSideForm = isServer && formSubmitCompatible;

  return (
    <div
      className={`PreactCombobox ${disabled ? "PreactCombobox--disabled" : ""} ${className}`}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) {
          inputRef.current?.focus();
          // This set is not redundant as input may already be focused
          // and handleInputFocus may not be called
          setIsDropdownOpen(true);
          dropdownClosedExplicitlyRef.current = false;
        }
      }}
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
        {invalidValues.length > 0 && getIsFocused() ? "Field contains invalid values" : ""}
      </div>

      <div className={`PreactCombobox-field ${disabled ? "PreactCombobox-field--disabled" : ""}`}>
        {!isServerSideForm && (
          <>
            {/* Show icon for single select mode */}
            {!multiple && singleSelectValue && allOptionsLookup[singleSelectValue]?.icon &&
              singleSelectedStateIcon(allOptionsLookup[singleSelectValue])
            }
            <input
              id={id}
              ref={inputRef}
              type="text"
              value={inputValue}
              placeholder={
                getIsDropdownOpen()
                  ? "Search..."
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
                activeDescendant.current
                  ? `${id}-option-${toHTMLId(activeDescendant.current)}`
                  : undefined
              }
              disabled={disabled}
              required={required && arrayValues.length === 0}
              {...inputProps}
            />
            {!multiple && singleSelectValue && !disabled && !required ? (
              <button
                type="button"
                className="PreactCombobox-clearButton"
                aria-label="Clear value"
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
            {multiple && values && values.length > 1 && (
              <span className="PreactCombobox-badge">{values.length}</span>
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
            // @ts-expect-error this is a valid react attribute
            readOnly={!isServerSideForm}
            value={value}
            name={name}
            size="1"
            className={isServerSideForm ? "PreactCombobox-formSelect" : ""}
          >
            {selectChildren}
          </select>
        ) : null}
      </div>

      {!isServerSideForm && (
        <Portal parent={portal}>
          <ul
            className="PreactCombobox-options"
            role="listbox"
            id={`${id}-options-listbox`}
            aria-multiselectable={multiple ? "true" : undefined}
            hidden={!getIsDropdownOpen()}
            ref={dropdownPopperRef}
          >
            {isLoading ? loadingIndicator : (
              <>
                {addNewOptionVisible && (
                  <li
                    key={inputTrimmed}
                    id={`${id}-option-${toHTMLId(inputTrimmed)}`}
                    className="PreactCombobox-option"
                    role="option"
                    tabIndex={-1}
                    aria-selected={false}
                    onMouseEnter={() => activateDescendant(inputTrimmed, false)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddNewOption(inputTrimmed);
                      if (!multiple) {
                        closeDropdown();
                      }
                      inputRef.current?.focus();
                    }}
                  >
                    {`Add "${inputTrimmed}"`}
                  </li>
                )}
                {filteredOptions.map((option) => {
                  // "Active" means it's like a focus / hover. It doesn't mean the option was selected.
                  // aria-activedescendant is used to tell screen readers the active option.
                  const isActive = activeDescendant.current === option.value;
                  const isSelected = arrayValues.includes(option.value);
                  const isInvalid = invalidValues.includes(option.value);
                  const optionClasses = [
                    "PreactCombobox-option",
                    isActive ? "PreactCombobox-option--active" : "",
                    isSelected ? "PreactCombobox-option--selected" : "",
                    isInvalid ? "PreactCombobox-option--invalid" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <li
                      key={option.value}
                      id={`${id}-option-${toHTMLId(option.value)}`}
                      className={optionClasses}
                      role="option"
                      tabIndex={-1}
                      aria-selected={isSelected}
                      onMouseEnter={() => activateDescendant(option.value, false)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOptionSelect(option.value, { toggleSelected: true });
                        if (!multiple) {
                          closeDropdown();
                        }
                        inputRef.current?.focus();
                      }}
                    >
                      {optionTransform({
                        option,
                        language,
                        isActive,
                        isSelected,
                        isInvalid,
                        showValue
                      })}
                      {isSelected ? (
                        <span
                          className="PreactCombobox-srOnly"
                          aria-atomic="true"
                          data-reader="selected"
                          aria-hidden={!isActive}
                        >
                          Selected option.
                        </span>
                      ) : null}
                      {isInvalid ? (
                        <span
                          className="PreactCombobox-srOnly"
                          aria-atomic="true"
                          data-reader="invalid"
                          aria-hidden={!isActive}
                        >
                          Invalid option.
                        </span>
                      ) : null}
                    </li>
                  );
                })}
                {filteredOptions.length === 0 &&
                  !isLoading &&
                  (!allowFreeText || !inputValue || arrayValues.includes(inputValue)) && (
                    <li className="PreactCombobox-option">No options found</li>
                  )}
                {filteredOptions.length === maxNumberOfPresentedOptions && (
                  <li className="PreactCombobox-option">...type to load more options</li>
                )}
              </>
            )}
          </ul>
        </Portal>
      )}
      {invalidValues.length > 0 && warningIconHovered && !isServerSideForm && (
        <Portal parent={portal}>
          <div className="PreactCombobox-valueTooltip" role="tooltip" ref={tooltipPopperRef}>
            Invalid values:
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
