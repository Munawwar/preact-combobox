// @ts-check
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createPopper } from "@popperjs/core";
import "./MultiSelectAutocomplete.css";

const identity = (x) => x;

// TODO: Integrate with popper.js for invalid tooltip as well
// TODO: Implement Undo/Redo stack
// TODO: Think of mobile design

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
const popperModifiers = [
  {
    name: "flip",
    enabled: true,
  },
  {
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
 * @property {Option[] | ((query: string, limit: number, abortControllerSignal: AbortSignal) => Promise<Option[]>)} allowedOptions Array of allowed options or function to fetch allowed options
 * @property {boolean} [allowFreeText=false] Allow free text input
 * @property {boolean} [enableBackspaceDelete=false] Enable backspace delete
 * @property {(options: string[]) => void} onChange Callback when selection changes
 * @property {string[]} values Currently selected options
 * @property {string} [language='en'] Language for word splitting and matching. The language can be any language tag
 * recognized by Intl.Segmenter and Intl.Collator
 * @property {boolean} [disabled=false] Disable the component
 *
 * @property {Record<string, any>} [rootElementProps] Root element props
 * @property {Record<string, any>} [inputProps] Input element props
 * @property {Record<string, any>} [selectElementProps] Props for the hidden select element. This is useful for forms
 *
 * @property {HTMLElement} [portal=document.body] The element to render the Dropdown <ul> element
 * @property {(label: JSX.Element[], match: OptionMatch) => JSX.Element} [labelTransform=identity] Transform the label text
 */

/**
 * MultiSelectAutocomplete component
 * @param {MultiSelectAutocompleteProps} props - Component props
 */
const MultiSelectAutocomplete = ({
  id,
  allowedOptions,
  allowFreeText = false,
  enableBackspaceDelete = false,
  onChange,
  values = [],
  language = "en",
  disabled,
  portal = document.body,

  rootElementProps,
  inputProps,
  selectElementProps,
  labelTransform = identity,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(/** @type {OptionMatch[]} */ ([]));
  const [isLoading, setIsLoading] = useState(false);
  const [activeDescendant, setActiveDescendant] = useState("");
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const blurTimeoutRef = useRef(/** @type {number | undefined} */ (undefined));
  const rootElementRef = useRef(null);
  const popperRef = useRef(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: values.length is used to readjust when values wrap around
  useEffect(() => {
    if (isFocused && rootElementRef.current && popperRef.current) {
      const popperInstance = createPopper(rootElementRef.current, popperRef.current, {
        placement: "bottom-start",
        // @ts-ignore
        modifiers: popperModifiers,
      });

      // Clean up function
      return () => {
        popperInstance.destroy();
      };
    }
  }, [isFocused, values.length]);

  /**
   * Filter options based on input query
   * @param {string} query - The search query
   * @returns {Promise<OptionMatch[]>} Filtered options
   */
  const filterOptions = useCallback(
    async (query, abortControllerSignal) => {
      const valuesLookup = new Set(values);
      if (typeof allowedOptions === "function") {
        setIsLoading(true);
        const fetchedOptions = await allowedOptions(query, 100 + values.length, abortControllerSignal);
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
    [allowedOptions, values, language],
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

  /**
   * Handle input change
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputFocus = () => {
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
    setIsFocused(true);
  };

  // Delay blur to allow option selection
  const handleInputBlur = () => {
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
    setIsFocused(false);
    if (inputValue) {
      if (allowFreeText && inputValue.trim() !== "") {
        handleOptionSelect(inputValue.trim());
      } else {
        setInputValue("");
        setActiveDescendant("");
      }
    }
  };

  /**
   * Handle option selection
   * @param {string} selectedValue The selected option value
   */
  const handleOptionSelect = (selectedValue) => {
    const existingOption = values.includes(selectedValue);
    const newValues = [...values, selectedValue];
    setActiveDescendant("");
    setInputValue("");
    if (!existingOption) {
      onChange(newValues);
    }
  };

  /**
   * Handle option removal
   * @param {string} option The option to remove
   * @param {boolean} [focusNext=false] Whether to focus the next button in the tab order or to focus the autocomplete input field
   */
  const handleRemoveOption = (option, focusNext = false) => {
    const newValues = values.filter((value) => value !== option);
    const nextEl = document.activeElement?.closest("span")?.nextElementSibling;
    if (focusNext && nextEl && nextEl.tagName === "SPAN" && nextEl.querySelector("button")) {
      nextEl.querySelector("button")?.focus();
    } else {
      inputRef.current?.focus();
    }
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = undefined;
    onChange(newValues);
  };

  /**
   * Handle keydown events on the input
   * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    // Backspace removes last selected option
    if (e.key === "Backspace" && enableBackspaceDelete && inputValue === "" && values.length > 0) {
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
      // inputRef.current?.blur();
    }
  };

  /**
   * Handle paste event
   * @param {React.ClipboardEvent<HTMLInputElement>} e - Clipboard event
   */
  const handlePaste = (e) => {
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
    console.log(newValues);
    onChange(newValues);
  };

  const allOptions = Array.isArray(allowedOptions) ? allowedOptions : filteredOptions;
  const allOptionsLookup = Object.fromEntries(allOptions.map((o) => [o.value, o]));

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
        {values.map((value, index) => {
          const label = allOptions.find((o) => o.value === value)?.label || value;
          const isInvalidOption = !allowFreeText && !allOptionsLookup[value];
          return (
            <span
              key={value}
              className={`MultiSelectAutocomplete-chip ${
                !allowFreeText && !allOptionsLookup[value] ? "MultiSelectAutocomplete-chip--invalid" : ""
              }`}
              aria-label={`${label}${isInvalidOption ? " (Invalid value)" : ""}`}
              {...(isInvalidOption ? { "data-tooltip": "Invalid value" } : {})}
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
            </span>
          );
        })}
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
          aria-expanded={isFocused}
          aria-haspopup="listbox"
          aria-controls="options-listbox"
          aria-activedescendant={activeDescendant}
          disabled={disabled}
          {...inputProps}
        />
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
                      handleOptionSelect(option.value);
                      setIsFocused(true);
                      inputRef.current?.focus();
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
      <select
        multiple
        hidden
        tabIndex={-1}
        // @ts-expect-error this is a valid react attribute
        readOnly
        value={values}
        {...selectElementProps}
      >
        {values.map((value) => (
          <option key={value} value={value}>
            {allOptionsLookup[value]?.label || value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MultiSelectAutocomplete;
