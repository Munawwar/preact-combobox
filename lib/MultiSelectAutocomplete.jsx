// @ts-check
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createPopper } from "@popperjs/core";
import "./MultiSelectAutocomplete.css";

const identity = (x) => x;

/**
 * @param {string[]} arr Array to remove duplicates from
 */
function unique(arr) {
  return Array.from(new Set(arr));
}

/**
 * @param {Object} props - Props for the PopperContent component
 * @param {HTMLElement} [props.parent=document.body] The parent element to render the PopperContent component
 * @param {React.ReactNode} props.children The children to render
 */
const Portal = ({ parent = document.body, children }) => {
  return createPortal(children, parent);
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
    fn: ({ state }) => {
      state.styles.popper.width = `${state.rects.reference.width}px`;
    },
    effect: ({ state }) => {
      state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
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
 * @property {Intl.Segmenter} [wordSegmenter] - The word segmenter for the language
 * @property {Intl.Collator} [charSegmenter] - The character segmenter for the language
 * @property {Intl.Collator} [baseMatcher] - The base matcher for the language
 * @property {Intl.Collator} [caseMatcher] - The case matcher for the language
 */
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
 * @param {boolean} [sort=true] Whether to sort the results
 * @returns {Array<OptionMatch>}
 */
function getMatchScore(query, options, language = "en", sort = true) {
  // biome-ignore lint/style/noParameterAssign: ignore
  query = query.trim();
  const lowercaseQuery = query.toLowerCase();

  if (!lowercaseQuery) {
    const matchSlices = [];
    return options.map((option) => ({
      label: option.label,
      value: option.value,
      score: 0,
      matched: "none",
      matchSlices,
    }));
  }

  let querySegments;
  let queryWords;
  let queryLastWordChars;
  const matches = options
    .map(({ label, value }) => {
      // Rule 1: Exact match (case insensitive)
      if (value.toLowerCase() === lowercaseQuery) {
        return {
          label,
          value,
          score: 7,
          /** @type {'value'} */
          matched: "value",
          /** @type {Array<[number, number]>} */
          matchSlices: [[0, value.length]],
        };
      }
      const labelLowerCase = label.toLowerCase();
      if (labelLowerCase === lowercaseQuery) {
        return {
          label,
          value,
          score: 7,
          /** @type {'label'} */
          matched: "label",
          /** @type {Array<[number, number]>} */
          matchSlices: [[0, label.length]],
        };
      }

      // Rule 2: Exact match with accents normalized (case insensitive)
      if (!languageCache[language]) {
        languageCache[language] = {};
      }
      const langUtils = languageCache[language];
      if (!langUtils.baseMatcher) {
        langUtils.baseMatcher = new Intl.Collator(language, { usage: "search", sensitivity: "base" });
        langUtils.caseMatcher = new Intl.Collator(language, { usage: "search", sensitivity: "accent" });
      }
      const { baseMatcher } = langUtils;
      if (baseMatcher.compare(label, query) === 0) {
        return {
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
          label,
          value,
          score: 5,
          /** @type {'value'} */
          matched: "value",
          /** @type {Array<[number, number]>} */
          matchSlices: [[0, value.length]],
        };
      }

      // Rule 3: Phrase match (imagine a wildcard query like "word1 partialWord2*")
      // This match needs to be case and accent insensitive
      if (!langUtils.wordSegmenter) {
        Object.assign(langUtils, {
          // @ts-ignore
          wordSegmenter: new Intl.Segmenter(language, { granularity: "word" }),
          // @ts-ignore
          charSegmenter: new Intl.Segmenter(language, { granularity: "grapheme" }),
        });
      }
      const { wordSegmenter, charSegmenter } = langUtils;
      if (!querySegments) {
        querySegments = Array.from(wordSegmenter.segment(query));
      }
      const labelSegments = Array.from(wordSegmenter.segment(label.trim()));
      let len = 0;
      let firstIndex = -1;
      for (let i = 0; i < labelSegments.length; i++) {
        const labelSegment = labelSegments[i];
        const querySegment = querySegments[len];
        if (len === querySegments.length - 1) {
          // check for partial word match
          // I can't use labelSegment.segment.startsWith(querySegment.segment) because it's case and accent sensitive
          // I have to loop through each character and use Intl.Collator.compare to check if they match
          // Note: A "char" is a grapheme cluster, not actually a character
          // @ts-ignore
          const labelWordChars = Array.from(charSegmenter.segment(labelSegment.segment));
          if (!queryLastWordChars) {
            // @ts-ignore
            queryLastWordChars = Array.from(charSegmenter.segment(querySegment.segment));
          }
          const isPartialMatch = queryLastWordChars.every(
            ({ segment }, index) =>
              labelWordChars[index] && baseMatcher.compare(segment, labelWordChars[index].segment) === 0,
          );
          if (isPartialMatch) {
            return {
              label,
              value,
              score: 3,
              /** @type {'label'} */
              matched: "label",
              /** @type {Array<[number, number]>} */
              // @ts-ignore
              matchSlices: [
                [firstIndex > -1 ? firstIndex : labelSegment.index, labelSegment.index + querySegment.segment.length],
              ],
            };
          }
        } else if (baseMatcher.compare(labelSegment.segment, querySegment.segment) === 0) {
          len++;
          if (len === 1) {
            firstIndex = labelSegment.index;
          }
          continue;
        }
        len = 0;
        firstIndex = -1;
      }

      // Rule 4: Word matches
      if (!queryWords) {
        queryWords = querySegments.filter((s) => s.isWordLike);
      }
      const labelWords = labelSegments.filter((s) => s.isWordLike);
      /** @type {Array<[number, number]|undefined>} */
      const slices = queryWords.map((word) => {
        const match = labelWords.find((labelWord) => baseMatcher.compare(labelWord.segment, word.segment) === 0);
        if (match) {
          return [match.index, match.index + match.segment.length];
        }
      });
      const matchSlices = slices.filter((s) => s !== undefined).sort((a, b) => a[0] - b[0]);
      const wordScoring = matchSlices.length / queryWords.length;
      return {
        label,
        value,
        score: wordScoring,
        /** @type {'label'|'none'} */
        matched: wordScoring ? "label" : "none",
        matchSlices,
      };
    })
    // FIXME: Comment this after testing
    // .filter((match) => match);
    .filter((match) => match.score > 0);

  if (sort) {
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
 * @param {OptionMatch} match
 * @param {(label: JSX.Element[], match: OptionMatch) => JSX.Element} labelTransform
 */
function highlightMatches(match, labelTransform) {
  const { label, matched, matchSlices } = match;
  if (!matched || matched === "none") return label;

  const labelTextPart = [];
  let index = 0;
  matchSlices.map((slice) => {
    const [start, end] = slice;
    // console.log(slice);
    if (index < start) {
      // console.log(label.slice(index, start));
      labelTextPart.push(<span key={`${index}-${start}`}>{label.slice(index, start)}</span>);
    }
    // console.log(label.slice(start, end));
    labelTextPart.push(<u key={`${start}-${end}`}>{label.slice(start, end)}</u>);
    index = end;
  });
  if (index < label.length) {
    // console.log(label.slice(index));
    labelTextPart.push(<span key={`${index}-${label.length}`}>{label.slice(index)}</span>);
  }
  return labelTransform(labelTextPart, match);
}

/**
 * @typedef {Object} MultiSelectAutocompleteProps
 * @property {string} id The id of the component
 * @property {boolean} [multiple=true] Multi-select or single-select mode
 * @property {Option[] | ((query: string, limit: number, abortControllerSignal: AbortSignal) => Promise<Option[]>)} allowedOptions Array of allowed options or function to fetch allowed options
 * @property {boolean} [allowFreeText=false] Allow free text input
 * @property {boolean} [enableBackspaceDelete=false] Enable backspace delete
 * @property {(options: string[] | string) => void} onChange Callback when selection changes
 * @property {string[] | string} value Currently selected options (array for multi-select, string for single-select)
 * @property {string} [language='en'] Language for word splitting and matching. The language can be any language tag
 * recognized by Intl.Segmenter and Intl.Collator
 * @property {boolean} [disabled=false] Disable the component
 * @property {boolean} [required=false] Is required for form submission
 * @property {string} [name] name to be set on hidden select element
 *
 * @property {Record<string, any>} [rootElementProps] Root element props
 * @property {Record<string, any>} [inputProps] Input element props
 * @property {Record<string, any>} [selectElementProps] Props for the hidden select element. This is useful for forms
 *
 * @property {HTMLElement} [portal=document.body] The element to render the Dropdown <ul> element
 * @property {(label: JSX.Element[], match: OptionMatch) => JSX.Element} [labelTransform=identity] Transform the label text
 */

const defaultArrayValue = [];

/**
 * MultiSelectAutocomplete component
 * @param {MultiSelectAutocompleteProps} props - Component props
 */
const MultiSelectAutocomplete = ({
  id,
  multiple = true,
  allowedOptions,
  allowFreeText = false,
  enableBackspaceDelete = false,
  onChange,
  value = multiple ? defaultArrayValue : "",
  language = "en",
  disabled,
  required,
  name,
  portal = document.body,

  rootElementProps,
  inputProps,
  selectElementProps,
  labelTransform = identity,
}) => {
  const values = multiple ? /** @type {string[]} */ (value) : null;
  const singleSelectValue = multiple ? null : /** @type {string} */ (value);
  const arrayValues = useMemo(() => {
    if (multiple) {
      return /** @type {string[]} */ (value);
    }
    return value ? [/** @type {string} */ (value)] : [];
  }, [multiple, value]);

  const [inputValue, setInputValue] = useState(singleSelectValue || "");
  const [lastValue, setLastValue] = useState(singleSelectValue || "");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(/** @type {OptionMatch[]} */ ([]));
  const [isLoading, setIsLoading] = useState(false);
  const [activeDescendant, setActiveDescendant] = useState("");
  const [chipHovered, setChipHovered] = useState("");
  const [inputWrapperHovered, setInputWrapperHovered] = useState(false);
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const blurTimeoutRef = useRef(/** @type {number | undefined} */ (undefined));
  const rootElementRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const popperRef = useRef(null);
  const hoveredChipRef = useRef(null);
  const tooltipPopperRef = useRef(null);
  const undoStack = useRef(/** @type {string[][]} */ ([]));
  const redoStack = useRef(/** @type {string[][]} */ ([]));

  // biome-ignore lint/correctness/useExhaustiveDependencies: values.length is used to readjust when values wrap around
  useEffect(() => {
    if (isFocused && rootElementRef.current && popperRef.current) {
      const popperInstance = createPopper(rootElementRef.current, popperRef.current, {
        placement: "bottom-start",
        // @ts-ignore
        modifiers: dropdownPopperModifiers,
      });

      // Clean up function
      return () => {
        popperInstance.destroy();
      };
    }
  }, [isFocused, values?.length]);
  useEffect(() => {
    if (chipHovered && hoveredChipRef.current && tooltipPopperRef.current) {
      const popperInstance = createPopper(hoveredChipRef.current, tooltipPopperRef.current, {
        placement: "bottom",
        // @ts-ignore
        modifiers: tooltipPopperModifiers,
      });

      // Clean up function
      return () => {
        popperInstance.destroy();
      };
    }
    if (inputWrapperHovered && inputRef.current && tooltipPopperRef.current) {
      const popperInstance = createPopper(inputRef.current, tooltipPopperRef.current, {
        placement: "bottom-start",
        // @ts-ignore
        modifiers: tooltipPopperModifiers,
      });

      // Clean up function
      return () => {
        popperInstance.destroy();
      };
    }
  }, [chipHovered, inputWrapperHovered]);

  /**
   * Filter options based on input query
   * @param {string} query - The search query
   * @returns {Promise<OptionMatch[]>} Filtered options
   */
  const filterOptions = useCallback(
    async (query, abortControllerSignal) => {
      const valuesLookup = new Set(arrayValues);
      if (typeof allowedOptions === "function") {
        setIsLoading(true);
        const fetchedOptions = await allowedOptions(
          query,
          100 + (multiple ? arrayValues.length : 1),
          abortControllerSignal,
        );
        setIsLoading(false);
        return getMatchScore(
          query,
          fetchedOptions.filter((option) => !valuesLookup.has(option.value)).slice(0, 100),
          language,
          false,
        );
      }
      if (Array.isArray(allowedOptions)) {
        return getMatchScore(
          query,
          allowedOptions.filter((option) => !valuesLookup.has(option.value)),
          language,
        ).slice(0, 100);
      }
      return [];
    },
    [allowedOptions, multiple, arrayValues, language],
  );

  useEffect(() => {
    const abortController = new AbortController();
    filterOptions(inputValue, abortController.signal)
      .then((newOptions) => {
        if (!abortController.signal.aborted) {
          setFilteredOptions(newOptions);
        }
      })
      .catch((error) => {
        if (!abortController.signal.aborted) {
          throw error;
        }
      });
    return () => abortController.abort();
  }, [inputValue, filterOptions]);

  const allOptions = Array.isArray(allowedOptions) ? allowedOptions : filteredOptions;
  const allOptionsLookup = Object.fromEntries(allOptions.map((o) => [o.value, o]));
  const isInvalidSingleSelectValue = singleSelectValue && !allowFreeText && !allOptionsLookup[singleSelectValue];

  /**
   * Handle option selection
   * @param {string} selectedValue The selected option value
   */
  const handleOptionSelect = (selectedValue) => {
    if (values) {
      setActiveDescendant("");
      setInputValue("");
      const existingOption = values.includes(selectedValue);
      const newValues = [...values, selectedValue];
      if (!existingOption) {
        onChange(newValues);
        undoStack.current.push(values);
        redoStack.current = [];
      }
    } else if (singleSelectValue !== null && singleSelectValue !== selectedValue) {
      console.log(selectedValue);
      setInputValue(allOptionsLookup[selectedValue]?.label || selectedValue);
      setLastValue(selectedValue);
      onChange(selectedValue);
      undoStack.current.push([selectedValue]);
      redoStack.current = [];
    }
  };

  /**
   * Handle input change
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (!multiple) {
      const trimmedValue = newValue.trim();
      // whether field is required or not, empty value should be allowed to clear the field
      if (allowFreeText || !trimmedValue || allOptionsLookup[trimmedValue]) {
        handleOptionSelect(trimmedValue);
      }
    }
  };

  const handleInputFocus = () => {
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
    if (isFocused) return;
    setIsFocused(true);
  };

  // Delay blur to allow option selection
  const handleInputBlur = () => {
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
    if (!isFocused) return;
    setIsFocused(false);
    if (!multiple) {
      if (!allowFreeText && inputValue.trim() && !allOptionsLookup[inputValue.trim()]) {
        setInputValue(allOptionsLookup[lastValue]?.label || lastValue);
      } else {
        handleOptionSelect(inputValue.trim());
      }
    } else if (inputValue) {
      if (allowFreeText && inputValue.trim() !== "") {
        handleOptionSelect(inputValue.trim());
      } else {
        setInputValue("");
        setActiveDescendant("");
      }
    }
  };

  /**
   * Handle option removal
   * @param {string} option The option to remove
   * @param {boolean} [focusNext=false] Whether to focus the next button in the tab order or to focus the autocomplete input field
   */
  const handleRemoveOption = (option, focusNext = false) => {
    if (!values) {
      // single-select mode
      const newValue = "";
      inputRef.current?.focus();
      onChange(newValue);
      undoStack.current.push([newValue]);
      redoStack.current = [];
    } else {
      // multi-select mode
      const newValues = values.filter((value) => value !== option);
      const nextEl = document.activeElement?.closest("span")?.nextElementSibling;
      if (focusNext && nextEl && nextEl.tagName === "SPAN" && nextEl.querySelector("button")) {
        nextEl.querySelector("button")?.focus();
      } else {
        inputRef.current?.focus();
      }
      onChange(newValues);
      undoStack.current.push(values);
      redoStack.current = [];
    }
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
  };

  /**
   * Handle keydown events on the input
   * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    // Backspace removes last selected option (multi-select mode only)
    if (values && e.key === "Backspace" && enableBackspaceDelete && inputValue === "" && values.length > 0) {
      setActiveDescendant("");
      handleRemoveOption(values[values.length - 1]);
      // Enter selects current option
    } else if (e.key === "Enter") {
      e.preventDefault();
      const currentIndex = activeDescendant
        ? filteredOptions.findIndex((o) => `option-${o.value}` === activeDescendant)
        : -1;
      if (currentIndex > -1) {
        handleOptionSelect(filteredOptions[currentIndex].value);
      } else if (allowFreeText && inputValue.trim() !== "") {
        handleOptionSelect(inputValue.trim());
      }
      // ArrowDown highlights next option
    } else if (e.key === "ArrowDown" && filteredOptions.length > 0) {
      e.preventDefault();
      const currentIndex = activeDescendant
        ? filteredOptions.findIndex((o) => `option-${o.value}` === activeDescendant)
        : -1;
      const nextIndex = currentIndex === filteredOptions.length - 1 ? 0 : currentIndex + 1;
      const nextOptionId = `option-${filteredOptions[nextIndex].value}`;
      setActiveDescendant(nextOptionId);
      inputRef.current?.setAttribute("aria-activedescendant", nextOptionId);
      // ArrowUp highlights previous option
    } else if (e.key === "ArrowUp" && filteredOptions.length > 0) {
      e.preventDefault();
      const currentIndex = activeDescendant
        ? filteredOptions.findIndex((o) => `option-${o.value}` === activeDescendant)
        : 0;
      const prevIndex = (currentIndex - 1 + filteredOptions.length) % filteredOptions.length;
      setActiveDescendant(`option-${filteredOptions[prevIndex].value}`);
      inputRef.current?.setAttribute("aria-activedescendant", `option-${filteredOptions[prevIndex].value}`);
      // Escape blurs input
    } else if (e.key === "Escape") {
      setIsFocused(false);
      setActiveDescendant("");
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
  };

  /**
   * Handle paste event
   * @param {React.ClipboardEvent<HTMLInputElement>} e - Clipboard event
   */
  const handlePaste = (e) => {
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
    const optionsLabelLookup = Object.fromEntries(allOptions.map((o) => [o.label.toLowerCase(), o.value]));
    const pastedText = e.clipboardData.getData("text");
    const pastedOptions = pastedText
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x !== "")
      .map(
        (x) =>
          valuesLookup[x] || valuesLowerCaseLookup[x.toLowerCase()] || optionsLabelLookup[x.toLocaleLowerCase()] || x,
      );

    const newValues = unique([...values, ...pastedOptions]);
    onChange(newValues);
    undoStack.current.push(values);
    redoStack.current = [];
  };

  const handleClearValue = (e) => {
    if (!singleSelectValue) return;
    e.stopPropagation();
    setInputValue("");
    setLastValue("");
    onChange("");
    undoStack.current.push([singleSelectValue]);
    redoStack.current = [];
    inputRef.current?.focus();
  };

  return (
    <div
      className={`MultiSelectAutocomplete ${disabled ? "MultiSelectAutocomplete--disabled" : ""}`}
      aria-disabled={disabled}
      onClick={() => inputRef.current?.focus()}
      id={`${id}-root`}
      ref={rootElementRef}
      {...rootElementProps}
    >
      <div className="MultiSelectAutocomplete-selectedOptions">
        {
          /* Chips UI is used for multi-select mode */
          values
            ? values.map((value, index) => {
                const label = allOptions.find((o) => o.value === value)?.label || value;
                const isInvalidOption = !allowFreeText && !allOptionsLookup[value];
                return (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: Click is optional. Also one can hover on the chip for tooltip.
                  <span
                    key={value}
                    className={`MultiSelectAutocomplete-chip ${
                      !allowFreeText && !allOptionsLookup[value] ? "MultiSelectAutocomplete-chip--invalid" : ""
                    }`}
                    aria-label={`${label}${isInvalidOption ? " (Invalid value)" : ""}`}
                    onMouseEnter={() => setChipHovered(value)}
                    onMouseLeave={() => setChipHovered("")}
                    onClick={() => setChipHovered(chipHovered === value ? "" : value)}
                    ref={chipHovered === value ? hoveredChipRef : null}
                  >
                    {label}
                    {!disabled && (
                      <button
                        type="button"
                        className="MultiSelectAutocomplete-chipRemove"
                        aria-label="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleRemoveOption(value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            e.preventDefault();
                            handleRemoveOption(value, true);
                          }
                        }}
                      >
                        <span aria-hidden="true">&#x2715;</span>
                      </button>
                    )}
                    {chipHovered === value && (
                      <Portal parent={portal}>
                        <div
                          className="MultiSelectAutocomplete-valueTooltip"
                          role="tooltip"
                          ref={chipHovered === value ? tooltipPopperRef : null}
                        >
                          {isInvalidOption ? "Invalid value" : "Value"}: {value}
                        </div>
                      </Portal>
                    )}
                  </span>
                );
              })
            : null
        }
        <div
          className="MultiSelectAutocomplete-inputWrapper"
          onMouseEnter={() => {
            if (!multiple) {
              setInputWrapperHovered(true);
            }
          }}
          onMouseLeave={() => {
            if (!multiple) {
              setInputWrapperHovered(false);
            }
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={() => {
              // @ts-ignore
              blurTimeoutRef.current = setTimeout(handleInputBlur, 200);
            }}
            onPaste={handlePaste}
            className="MultiSelectAutocomplete-input"
            role="combobox"
            aria-expanded={isFocused}
            aria-haspopup="listbox"
            aria-controls="options-listbox"
            aria-activedescendant={activeDescendant}
            disabled={disabled}
            required={required && arrayValues.length === 0}
            {...inputProps}
          />
          {!multiple && isInvalidSingleSelectValue && (
            <svg
              className="MultiSelectAutocomplete-warningIcon"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden="true"
            >
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
          )}
          {!multiple && singleSelectValue && !disabled && (
            <button
              type="button"
              className="MultiSelectAutocomplete-clearButton"
              aria-label="Clear value"
              onClick={handleClearValue}
            >
              <span aria-hidden="true">&#x2715;</span>
            </button>
          )}
          {!multiple && (
            <svg
              className="MultiSelectAutocomplete-chevron"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden="true"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          )}
        </div>
        {!multiple && singleSelectValue && inputWrapperHovered && (
          <Portal parent={portal}>
            <div className="MultiSelectAutocomplete-valueTooltip" role="tooltip" ref={tooltipPopperRef}>
              {isInvalidSingleSelectValue ? "Invalid value" : "Value"}: {singleSelectValue}
            </div>
          </Portal>
        )}
      </div>
      <Portal parent={portal}>
        <ul
          className="MultiSelectAutocomplete-options"
          role="listbox"
          id={`${id}-options-listbox`}
          hidden={!isFocused}
          ref={popperRef}
        >
          {isLoading ? (
            <li className="MultiSelectAutocomplete-option">Loading...</li>
          ) : (
            <>
              {filteredOptions.map((option) => {
                const isActiveOption = activeDescendant === `option-${option.value}`;
                const optionClasses = [
                  "MultiSelectAutocomplete-option",
                  isActiveOption ? "MultiSelectAutocomplete-option--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  // Cursor still needs to be on the input for user to be able to type
                  // biome-ignore lint/a11y/useKeyWithClickEvents: option and input both can have focus together.
                  <li
                    key={option.value}
                    id={`option-${option.value}`}
                    className={optionClasses}
                    role="option"
                    tabIndex={-1}
                    aria-selected={isActiveOption}
                    onMouseEnter={() => setActiveDescendant(`option-${option.value}`)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsFocused(!!multiple);
                      handleOptionSelect(option.value);
                      if (multiple) {
                        inputRef.current?.focus();
                      }
                    }}
                  >
                    {isActiveOption && <span className="MultiSelectAutocomplete-srOnly">Current option:</span>}
                    {highlightMatches(option, labelTransform)}
                  </li>
                );
              })}
              {filteredOptions.length === 0 && !isLoading && (
                <li className="MultiSelectAutocomplete-option">No options available</li>
              )}
              {filteredOptions.length === 100 && (
                <li className="MultiSelectAutocomplete-option">...type to load more options</li>
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
        {arrayValues.map((value) => (
          <option key={value} value={value}>
            {allOptionsLookup[value]?.label || value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MultiSelectAutocomplete;
