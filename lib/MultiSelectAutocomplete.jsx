// MultiSelectAutocomplete.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import "./MultiSelectAutocomplete.css";

/**
 * @param {string[]} arr Array to remove duplicates from
 */
function unique(arr) {
  return Array.from(new Set(arr));
}

/**
 * @typedef {Object} Option
 * @property {string} label - The display text for the option
 * @property {string} value - The value of the option
 */

/**
 * @typedef {Object} MultiSelectAutocompleteProps
 * @property {Option[] | ((query: string, limit: number, abortControllerSignal: AbortSignal) => Promise<Option[]>)} allowedOptions Array of allowed options or function to fetch allowed options
 * @property {boolean} [allowFreeText=false] Allow free text input
 * @property {boolean} [enableBackspaceDelete=false] Enable backspace delete
 * @property {(options: string[]) => void} onChange Callback when selection changes
 * @property {string[]} values Currently selected options
 */

/**
 * MultiSelectAutocomplete component
 * @param {MultiSelectAutocompleteProps} props - Component props
 */
const MultiSelectAutocomplete = ({
  allowedOptions,
  allowFreeText = false,
  enableBackspaceDelete = false,
  onChange,
  values = [],
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDescendant, setActiveDescendant] = useState("");
  const inputRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  /**
   * Filter options based on input query
   * @param {string} query - The search query
   * @returns {Promise<Option[]>} Filtered options
   */
  const filterOptions = useCallback(
    async (query, abortControllerSignal) => {
      const optionsLookup = new Set(values);
      if (typeof allowedOptions === "function") {
        setIsLoading(true);
        const fetchedOptions = await allowedOptions(query, 100 + values.length, abortControllerSignal);
        setIsLoading(false);
        return fetchedOptions.filter((option) => !optionsLookup.has(option.value)).slice(0, 100);
      }
      if (Array.isArray(allowedOptions)) {
        return allowedOptions
          .filter(
            (option) =>
              !optionsLookup.has(option.value) &&
              (query === "" || option.label.toLowerCase().includes(query.toLowerCase())),
          )
          .slice(0, 100);
      }
      return [];
    },
    [allowedOptions, values],
  );

  useEffect(() => {
    const abortController = new AbortController();
    filterOptions(inputValue, abortController.signal).then(setFilteredOptions);
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
    blurTimeoutRef.current = null;
    setIsFocused(true);
  };

  // Delay blur to allow option selection
  const handleInputBlur = () => {
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = null;
    setIsFocused(false);
  };

  /**
   * Handle option selection
   * @param {string} value The selected option value
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
   * @param {Option} optionToRemove - The option to remove
   */
  const handleRemoveOption = (optionToRemove) => {
    const newValues = values.filter((value) => value !== optionToRemove);
    const nextEl = document.activeElement.closest("span")?.nextElementSibling;
    if (nextEl && nextEl.tagName === "SPAN" && nextEl.querySelector("button")) {
      nextEl.querySelector("button")?.focus();
    } else {
      inputRef.current?.focus();
    }
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
      } else if (allowFreeText) {
        handleOptionSelect(inputValue);
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
    const pastedText = e.clipboardData.getData("text");
    const pastedOptions = pastedText
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x !== "");
    const newValues = unique([...values, ...pastedOptions]);
    onChange(newValues);
  };

  const allOptions = Array.isArray(allowedOptions) ? allowedOptions : filteredOptions;
  const allOptionsLookup = new Set(allOptions.map((o) => o.value));

  return (
    <div className="MultiSelectAutocomplete" ref={containerRef}>
      <div className="MultiSelectAutocomplete-selectedOptions">
        {values.map((value, index) => {
          const label = allOptions.find((o) => o.value === value)?.label || value;
          const isInvalidOption = !allowFreeText && !allOptionsLookup.has(value);
          return (
            <span
              key={value}
              className={`MultiSelectAutocomplete-chip ${
                !allowFreeText && !allOptionsLookup.has(value) ? "MultiSelectAutocomplete-chip--invalid" : ""
              }`}
              aria-label={`${label}${isInvalidOption ? " (Invalid value)" : ""}`}
              {...(isInvalidOption ? { "data-tooltip": "Invalid value" } : {})}
            >
              {label}
              <button
                type="button"
                className="MultiSelectAutocomplete-chipRemove"
                aria-label="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleRemoveOption(value);
                }}
              >
                <span aria-hidden="true">×</span>
              </button>
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
            blurTimeoutRef.current = setTimeout(handleInputBlur, 200);
          }}
          onPaste={handlePaste}
          className="MultiSelectAutocomplete-input"
          aria-expanded={isFocused}
          aria-haspopup="listbox"
          aria-controls="options-listbox"
          aria-activedescendant={activeDescendant}
        />
      </div>
      {isFocused && (
        <ul className="MultiSelectAutocomplete-options" role="listbox" id="options-listbox">
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
                    {option.label || option.value}
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
      )}
    </div>
  );
};

export default MultiSelectAutocomplete;
