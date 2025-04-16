import { createPopper } from "@popperjs/core";
import { createPortal, Fragment } from "preact/compat";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { useDeepMemo, useLive } from "./hooks.js";
import "./PreactCombobox.css";

// --- types ---
/**
 * @typedef {Object} Option
 * @property {string} label - The display text for the option
 * @property {string} value - The value of the option
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
 * @property {Intl.Collator} [baseMatcher] - The base matcher for the language
 * @property {Intl.Collator} [caseMatcher] - The case matcher for the language
 * @property {Intl.Segmenter} [wordSegmenter] - The word segmenter for the language
 */

/**
 * @typedef {import("preact").VNode} VNode
 */

/**
 * @typedef {(
 *   match: OptionMatch,
 *   language: string,
 *   isActive: boolean,
 *   isSelected: boolean,
 *   isInvalid: boolean,
 *   showValue: boolean,
 * ) => VNode} OptionTransformFunction
 */

/**
 * @typedef {Object} PreactComboboxProps
 * @property {string} id The id of the component
 * @property {boolean} [multiple=true] Multi-select or single-select mode
 * @property {Option[]
 * | ((
 *   query: string,
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
 * @property {Record<string, any>} [selectElementProps] Props for the hidden select element. This is useful for forms
 *
 * @property {HTMLElement} [portal=document.body] The element to render the Dropdown <ul> element
 * @property {OptionTransformFunction} [optionTransform=identity] Transform the label text
 */

// --- end of types ---

/**
 * @param {string[]} arr Array to remove duplicates from
 */
function unique(arr) {
  return Array.from(new Set(arr));
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
    languageCache[language] = {};
  }
  const langUtils = languageCache[language];

  let querySegments;
  let queryWords;
  let matches = options.map(({ label, value, ...rest }) => {
    // Rule 1: Exact match (case sensitive)
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

    // Rule 2: Exact match (case insensitive)
    if (!langUtils.caseMatcher) {
      langUtils.caseMatcher = new Intl.Collator(language, {
        usage: "search",
        sensitivity: "accent",
      });
    }
    const { caseMatcher } = langUtils;
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

    // Rule 3: Exact match with accents normalized (case insensitive)
    if (!langUtils.baseMatcher) {
      langUtils.baseMatcher = new Intl.Collator(language, {
        usage: "search",
        sensitivity: "base",
      });
    }
    const { baseMatcher } = langUtils;
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
    if (!langUtils.wordSegmenter) {
      langUtils.wordSegmenter = new Intl.Segmenter(language, { granularity: "word" });
    }
    const { wordSegmenter } = langUtils;
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
        const val = a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
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

const warningIcon = (
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

/**
 * @type {OptionTransformFunction}
 */
export function defaultOptionTransform(
  match,
  _language,
  isActive,
  isSelected,
  isInvalid,
  showValue,
) {
  const isLabelSameAsValue = match.value === match.label;
  const getLabel = (labelNodes, valueNodes) => (
    <span className="PreactCombobox-labelFlex">
      <span>{labelNodes}</span>
      {isLabelSameAsValue || !showValue ? null : (
        <span className="PreactCombobox-value">({valueNodes})</span>
      )}
    </span>
  );

  const { label, value, matched, matchSlices } = match;
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
    <Fragment>
      {isActive && <span className="PreactCombobox-srOnly">Current option:</span>}
      <span
        className={`PreactCombobox-checkbox ${isSelected ? "PreactCombobox-checkbox--selected" : ""}`}
      >
        {isSelected && <span aria-hidden="true">✓</span>}
      </span>
      {labelElement}
      {isInvalid && warningIcon}
    </Fragment>
  );
}

const defaultArrayValue = [];

/**
 * PreactCombobox component
 * @param {PreactComboboxProps} props - Component props
 */
const PreactCombobox = ({
  id,
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
  selectElementProps,
  showValue = true,
  optionTransform = defaultOptionTransform,
  // private option for now
  maxNumberOfPresentedOptions = 100,
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

  const [inputValue, setInputValue] = useState("");
  const [getIsDropdownOpen, setIsDropdownOpen] = useLive(false);
  const cachedOptions = useRef(/** @type {{ [value: string]: Option }} */ ({}));
  const [filteredOptions, setFilteredOptions] = useState(/** @type {OptionMatch[]} */ ([]));
  const [isLoading, setIsLoading] = useState(false);
  // NOTE: Using ref for performance. Setting few attributes by re-rendering a large list is too expensive.
  const activeDescendant = useRef("");
  const [warningIconHovered, setWarningIconHovered] = useState(false);
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const blurTimeoutRef = useRef(/** @type {number | undefined} */ (undefined));
  const rootElementRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const popperRef = useRef(/** @type {HTMLUListElement | null} */ (null));
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

  const activateDescendant = useCallback((descendant, scroll = true) => {
    // NOTE: Using direct DOM API for performance
    // Remove current aria-selected from previous activeDescendant
    if (activeDescendant.current && popperRef.current) {
      popperRef.current
        .querySelector(`[aria-selected="true"]`)
        ?.setAttribute("aria-selected", "false");
    }

    activeDescendant.current = descendant;

    // Set the places in DOM where aria-activedescendant and aria-selected are set
    inputRef.current?.setAttribute("aria-activedescendant", descendant);
    if (descendant && popperRef.current) {
      const activeDescendantElement = popperRef.current.querySelector(`[id="${descendant}"]`);
      if (activeDescendantElement) {
        activeDescendantElement.setAttribute("aria-selected", "true");
        if (scroll) {
          const dropdownRect = popperRef.current.getBoundingClientRect();
          const itemRect = activeDescendantElement.getBoundingClientRect();

          if (itemRect.top < dropdownRect.top) {
            popperRef.current.scrollTop += itemRect.top - dropdownRect.top;
          } else if (itemRect.bottom > dropdownRect.bottom) {
            popperRef.current.scrollTop += itemRect.bottom - dropdownRect.bottom;
          }
        }
      }
    }
  }, []);

  // Setup popper when dropdown is opened
  // Reset activeDescendant and filteredOptions when dropdown closes
  useEffect(() => {
    if (getIsDropdownOpen() && rootElementRef.current && popperRef.current) {
      const popperInstance = createPopper(rootElementRef.current, popperRef.current, {
        placement: "bottom-start",
        // @ts-ignore
        modifiers: dropdownPopperModifiers,
      });
      popperRef.current.style.display = "block";
      // Clean up function
      return () => {
        popperInstance.destroy();
      };
    }
    if (!getIsDropdownOpen()) {
      activateDescendant("");
      if (popperRef.current) {
        popperRef.current.style.display = "none";
      }
    }
  }, [getIsDropdownOpen, activateDescendant]);
  // Fill the dropdown with options on open and also on input change
  // Not on useEffect deps:
  //   1. arrayValues is not fully stable dependency yet. Check the comment in arrayValues creation useMemo
  //   2. The allowedOptions and allOptionsLookup dependency is too complex here.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above comment
  useEffect(() => {
    if (!getIsDropdownOpen()) return;
    let abortController;
    if (typeof allowedOptions === "function") {
      abortController = new AbortController();
      setIsLoading(true);
      const newUnknownValues = arrayValues
        .filter((v) => !cachedOptions.current[v])
        .slice(maxNumberOfPresentedOptions);
      // Send query + maxNumberOfPresentedOptions selected options that don't have a label to the backend (if not cached)
      // Once we get label for a value, then we can cache it so as to not request it again.
      allowedOptions(
        inputTrimmed,
        maxNumberOfPresentedOptions,
        newUnknownValues,
        abortController.signal,
      )
        .then((receivedOptions) => {
          setIsLoading(false);
          let updatedOptions = receivedOptions;
          updateCachedOptions(receivedOptions);
          // Handle case where backend doesn't return labels for all the sent selections
          const unreturnedValues = newUnknownValues
            .filter((v) => !cachedOptions.current[v])
            .map((v) => ({ label: v, value: v }));
          if (unreturnedValues.length > 0) {
            updateCachedOptions(unreturnedValues);
            updatedOptions = unreturnedValues.concat(receivedOptions);
          }
          // we didn't send all existing selections to the backend, so we need to merge the results
          const mergedOptions = arrayValues
            .filter((v) => !cachedOptions.current[v])
            .map((v) => ({ label: v, value: v }))
            .concat(updatedOptions);
          // when search is applied don't sort the selected values to the top
          const options = inputTrimmed
            ? mergedOptions
            : sortValuesToTop(mergedOptions, arrayValues);
          // we don't need to re-sort what the backend returns, so pass filterAndSort=false to getMatchScore()
          // TODO: Re-use past objects for stable object references
          setFilteredOptions(getMatchScore(inputTrimmed, options, language, false));
        })
        .catch((error) => {
          if (!abortController.signal.aborted) {
            setIsLoading(false);
            throw error;
          }
        });
    } else {
      const mergedOptions = arrayValues
        .filter((v) => !allOptionsLookup[v])
        .map((v) => ({ label: v, value: v }))
        .concat(allowedOptions);
      // when search is applied don't sort the selected values to the top
      const options = inputValue ? mergedOptions : sortValuesToTop(mergedOptions, arrayValues);
      // TODO: Re-use past objects for stable object references
      setFilteredOptions(getMatchScore(inputValue, options, language, true));
    }
    // Clean up function
    return () => {
      abortController?.abort();
    };
  }, [
    getIsDropdownOpen,
    activateDescendant,
    inputTrimmed,
    language,
    typeof allowedOptions === "function" ? null : allowedOptions,
  ]);
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
          undoStack.current.push(values);
          redoStack.current = [];
        }
      } else if (
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
        undoStack.current.push([newValue]);
        redoStack.current = [];
        setIsDropdownOpen(false);
      }
    },
    [onChange, singleSelectValue, values, setIsDropdownOpen],
  );

  const handleInputChange = useCallback(
    /**
     * Handle input change
     * @param {import('preact/compat').ChangeEvent<HTMLInputElement>} e - Input change event
     */
    (e) => setInputValue(e.currentTarget.value),
    [],
  );

  const handleInputFocus = useCallback(() => {
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
    if (getIsDropdownOpen()) return;
    setIsDropdownOpen(true);
  }, [getIsDropdownOpen, setIsDropdownOpen]);

  // Delay blur to allow option selection
  const handleInputBlur = useCallback(() => {
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
    if (popperRef.current) {
      // @ts-ignore
      popperRef.current.style.display = "none";
    }
    setIsDropdownOpen(false);
    if (!multiple) {
      if (inputTrimmed && (allowFreeText || allOptionsLookup[inputTrimmed])) {
        handleOptionSelect(inputTrimmed);
      }
    }
    setInputValue("");
  }, [
    allOptionsLookup,
    allowFreeText,
    handleOptionSelect,
    multiple,
    inputTrimmed,
    setIsDropdownOpen,
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
  //       undoStack.current.push(values);
  //       redoStack.current = [];
  //     }
  //     clearTimeout(blurTimeoutRef.current);
  //     blurTimeoutRef.current = undefined;
  //   },
  //   [onChange, values],
  // );

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
      activateDescendant(`option-${newValue}`);
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
          ? filteredOptions.findIndex((o) => `option-${o.value}` === currentActiveDescendant)
          : -1;
        if (currentIndex > -1) {
          handleOptionSelect(filteredOptions[currentIndex].value, { toggleSelected: true });
        } else if (allowFreeText && inputTrimmed !== "") {
          handleAddNewOption(inputTrimmed);
        }
        // ArrowDown highlights next option
      } else if (e.key === "ArrowDown") {
        const hasAddOption =
          !isLoading && allowFreeText && inputTrimmed && !arrayValues.includes(inputTrimmed);
        if (!filteredOptions.length && !hasAddOption) return;
        e.preventDefault();
        const currentIndex =
          currentActiveDescendant && currentActiveDescendant !== "add-option"
            ? filteredOptions.findIndex((o) => `option-${o.value}` === currentActiveDescendant)
            : -1;
        if (
          hasAddOption &&
          currentActiveDescendant !== "add-option" &&
          (currentIndex < 0 || currentIndex === filteredOptions.length - 1)
        ) {
          setIsDropdownOpen(true);
          activateDescendant("add-option");
        } else if (filteredOptions.length) {
          setIsDropdownOpen(true);
          const nextIndex = currentIndex === filteredOptions.length - 1 ? 0 : currentIndex + 1;
          activateDescendant(`option-${filteredOptions[nextIndex].value}`);
        }
        // ArrowUp highlights previous option
      } else if (e.key === "ArrowUp") {
        const hasAddOption =
          !isLoading && allowFreeText && inputTrimmed && !arrayValues.includes(inputTrimmed);
        if (!filteredOptions.length && !hasAddOption) return;
        e.preventDefault();
        const currentIndex =
          currentActiveDescendant && currentActiveDescendant !== "add-option"
            ? filteredOptions.findIndex((o) => `option-${o.value}` === currentActiveDescendant)
            : 0;
        if (
          hasAddOption &&
          currentActiveDescendant !== "add-option" &&
          ((currentIndex === 0 && currentActiveDescendant) || !filteredOptions.length)
        ) {
          setIsDropdownOpen(true);
          activateDescendant("add-option");
        } else if (filteredOptions.length) {
          setIsDropdownOpen(true);
          const prevIndex = (currentIndex - 1 + filteredOptions.length) % filteredOptions.length;
          activateDescendant(`option-${filteredOptions[prevIndex].value}`);
        }
        // Escape blurs input
      } else if (e.key === "Escape") {
        setIsDropdownOpen(false);
        // Undo action
      } else if (inputValue === "" && (e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        const prevValues = undoStack.current.pop();
        if (prevValues) {
          onChange(prevValues);
          redoStack.current.push(Array.isArray(value) ? value : [value]);
        }
        // Redo action
      } else if (inputValue === "" && (e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        const nextValues = redoStack.current.pop();
        if (nextValues) {
          onChange(nextValues);
          undoStack.current.push(Array.isArray(value) ? value : [value]);
        }
      }
    },
    [
      activateDescendant,
      allowFreeText,
      filteredOptions,
      handleOptionSelect,
      handleAddNewOption,
      inputValue,
      inputTrimmed,
      onChange,
      setIsDropdownOpen,
      value,
      isLoading,
      arrayValues,
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

      e.preventDefault();
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
      undoStack.current.push(values);
      redoStack.current = [];
    },
    [allOptions, onChange, values],
  );

  const handleClearValue = useCallback(() => {
    if (!singleSelectValue) return;
    setInputValue("");
    onChange("");
    undoStack.current.push([singleSelectValue]);
    redoStack.current = [];
  }, [onChange, singleSelectValue]);

  // Memoize whatever JSX that can be memoized
  const selectChildren = useMemo(
    () =>
      arrayValues.slice(maxNumberOfPresentedOptions).map((val) => (
        <option key={val} value={val}>
          {allOptionsLookup[val]?.label || val}
        </option>
      )),
    [arrayValues, allOptionsLookup, maxNumberOfPresentedOptions],
  );

  return (
    <div
      className={`PreactCombobox ${disabled ? "PreactCombobox--disabled" : ""} ${className}`}
      aria-disabled={disabled}
      onClick={() => inputRef.current?.focus()}
      id={`${id}-root`}
      ref={rootElementRef}
      {...rootElementProps}
    >
      <div className={`PreactCombobox-field ${disabled ? "PreactCombobox-field--disabled" : ""}`}>
        <div className="PreactCombobox-inputWrapper">
          <input
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
            className={`PreactCombobox-input ${multiple ? "PreactCombobox-input--multiple" : ""} ${disabled ? "PreactCombobox-input--disabled" : ""}`}
            role="combobox"
            aria-expanded={getIsDropdownOpen()}
            aria-haspopup="listbox"
            aria-controls="options-listbox"
            aria-activedescendant={activeDescendant.current}
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
          {/* TODO:  ability to customize the warning icon? */}
          {invalidValues.length > 0 && (
            <svg
              ref={warningIconRef}
              className="PreactCombobox-warningIcon"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden="true"
              onMouseEnter={() => setWarningIconHovered(true)}
              onMouseLeave={() => setWarningIconHovered(false)}
            >
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
          )}
          {multiple && values && values.length > 1 && (
            <span className="PreactCombobox-badge">{values.length}</span>
          )}
          {/* TODO: ability to customize the chevron icon? */}
          <svg
            className="PreactCombobox-chevron"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            aria-hidden="true"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
      </div>

      <Portal parent={portal}>
        <ul
          className="PreactCombobox-options"
          role="listbox"
          id={`${id}-options-listbox`}
          hidden={!getIsDropdownOpen()}
          ref={popperRef}
          data-test-id={`${id}-autocomplete-options`}
        >
          {isLoading ? (
            <li className="PreactCombobox-option" aria-disabled>
              Loading...
            </li>
          ) : (
            <>
              {!isLoading &&
                allowFreeText &&
                inputTrimmed &&
                !arrayValues.includes(inputTrimmed) &&
                !filteredOptions.find((o) => o.value === inputTrimmed) && (
                  <li
                    key={inputTrimmed}
                    id="add-option"
                    className="PreactCombobox-option"
                    role="option"
                    tabIndex={-1}
                    data-test-value={inputTrimmed}
                    aria-selected={activeDescendant.current === "add-option"}
                    onMouseEnter={() => activateDescendant("add-option", false)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddNewOption(inputTrimmed);
                    }}
                  >
                    {`Add "${inputTrimmed}"`}
                  </li>
                )}
              {filteredOptions.map((option) => {
                const isActiveOption = activeDescendant.current === `option-${option.value}`;
                const isSelected = arrayValues.includes(option.value);
                const isInvalid = invalidValues.includes(option.value);
                const optionClasses = [
                  "PreactCombobox-option",
                  isSelected ? "PreactCombobox-option--selected" : "",
                  isInvalid ? "PreactCombobox-option--invalid" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <li
                    key={option.value}
                    id={`option-${option.value}`}
                    className={optionClasses}
                    role="option"
                    tabIndex={-1}
                    data-value={option.value}
                    aria-selected={isActiveOption}
                    onMouseEnter={() => activateDescendant(`option-${option.value}`, false)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!multiple) {
                        setIsDropdownOpen(false);
                        handleOptionSelect(option.value);
                        // Don't wait till next render cycle (which destroys the popper) to hide the popper
                        if (popperRef.current) {
                          // @ts-ignore
                          popperRef.current.style.display = "none";
                        }
                        inputRef.current?.blur();
                      } else {
                        // Toggle selection for multiple select
                        const newValues = isSelected
                          ? arrayValues.filter((v) => v !== option.value)
                          : [...arrayValues, option.value];
                        onChange(newValues);
                        inputRef.current?.focus();
                      }
                    }}
                  >
                    {optionTransform(
                      option,
                      language,
                      isActiveOption,
                      isSelected,
                      isInvalid,
                      showValue,
                    )}
                  </li>
                );
              })}
              {filteredOptions.length === 0 &&
                !isLoading &&
                (!allowFreeText || !inputValue || arrayValues.includes(inputValue)) && (
                  <li className="PreactCombobox-option">No options available</li>
                )}
              {filteredOptions.length === maxNumberOfPresentedOptions && (
                <li className="PreactCombobox-option">...type to load more options</li>
              )}
            </>
          )}
        </ul>
      </Portal>
      {/* This is a hidden select element to allow for form submission */}
      <select
        {...selectElementProps}
        multiple={multiple}
        hidden
        tabIndex={-1}
        // @ts-expect-error this is a valid react attribute
        readOnly
        value={value}
        name={name}
      >
        {selectChildren}
      </select>
      {invalidValues.length > 0 && warningIconHovered && (
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
