import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { useDeepMemo } from "./hooks.js";
import { getMatchScore, sortValuesToTop, toHTMLId } from "./PreactCombobox.jsx";

/**
 * @typedef {import("./PreactCombobox.jsx").Option} Option
 * @typedef {import("./PreactCombobox.jsx").OptionMatch} OptionMatch
 * @typedef {import("./PreactCombobox.jsx").Translations} Translations
 * @typedef {import("./PreactCombobox.jsx").OptionTransformFunction} OptionTransformFunction
 * @typedef {import("preact").VNode} VNode
 */

/**
 * @typedef {Object} SearchableListProps
 * @property {string} id - Component ID for ARIA attributes
 * @property {string} searchText - Current search/input text
 * @property {Option[] | ((queryOrValues: string[] | string, limit: number, currentSelections: string[], abortControllerSignal: AbortSignal) => Promise<Option[]>)} allowedOptions - Options data or fetcher function
 * @property {string[]} arrayValues - Currently selected values
 * @property {string[]} invalidValues - Invalid selected values
 * @property {boolean} multiple - Whether multi-select is enabled
 * @property {boolean} allowFreeText - Allow adding custom options
 * @property {string} language - Language code for matching
 * @property {number} maxNumberOfPresentedOptions - Maximum options to show
 * @property {string} activeDescendant - Currently active descendant ID
 * @property {(optionValue: string, scroll?: boolean) => void} onActivateDescendant - Activate an option
 * @property {(selectedValue: string, options?: {toggleSelected?: boolean}) => void} onOptionSelect - Handle option selection
 * @property {(newValue: string) => void} onAddNewOption - Handle adding new option
 * @property {() => void} [onClose] - Handle close (for single-select)
 * @property {OptionTransformFunction} optionRenderer - Function to render options
 * @property {VNode} warningIcon - Warning icon element
 * @property {VNode} tickIcon - Tick icon element
 * @property {(option: Option, isInput?: boolean) => VNode|null} optionIconRenderer - Option icon renderer
 * @property {boolean} showValue - Whether to show option values
 * @property {(text: string) => VNode|string} loadingRenderer - Loading renderer
 * @property {Translations} translations - Translation strings
 * @property {string} theme - Theme for styling
 * @property {boolean} isOpen - Whether the list should be visible
 * @property {boolean} shouldUseTray - Whether this is used in tray mode
 * @property {HTMLUListElement | null} dropdownPopperRef - Ref for dropdown positioning
 */


// @ts-ignore
const isPlaywright = navigator.webdriver === true;

/**
 * SearchableList component - handles filtering, fetching, and rendering options list
 * @param {SearchableListProps} props
 */
const SearchableList = ({
  id,
  searchText,
  allowedOptions,
  arrayValues,
  invalidValues,
  multiple,
  allowFreeText,
  language,
  maxNumberOfPresentedOptions,
  activeDescendant,
  onActivateDescendant,
  onOptionSelect,
  onAddNewOption,
  onClose,
  optionRenderer,
  warningIcon,
  tickIcon,
  optionIconRenderer,
  showValue,
  loadingRenderer,
  translations,
  theme,
  isOpen,
  shouldUseTray,
  dropdownPopperRef,
}) => {
  // Internal state for filtering/fetching
  const [filteredOptions, setFilteredOptions] = useState(/** @type {OptionMatch[]} */ ([]));
  const [isLoading, setIsLoading] = useState(false);
  const cachedOptions = useRef(/** @type {{ [value: string]: Option }} */ ({}));
  const abortControllerRef = useRef(/** @type {AbortController | null} */ (null));
  const inputTypingDebounceTimer = useRef(/** @type {any} */ (null));

  const searchTextTrimmed = searchText.trim();
  const allowedOptionsAsKey = useDeepMemo(
    typeof allowedOptions === "function" ? null : allowedOptions,
  );

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
      allOptions.reduce(
        (acc, o) => {
          acc[o.value] = o;
          return acc;
        },
        /** @type {{ [value: string]: Option }} */ ({}),
      ),
    [allOptions],
  );

  const newUnknownValues = arrayValues.filter((v) => !allOptionsLookup[v]);
  const newUnknownValuesAsKey = useDeepMemo(newUnknownValues);

  // Main filtering/fetching effect
  useEffect(() => {
    const shouldFetchOptions = isOpen || typeof allowedOptions === "function";
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
        (newUnknownValues.length > 0 || isOpen)
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
        // @ts-ignore
        const signal = /** @type {AbortSignal} */ (abortController.signal);
        const [searchResults, selectedResults] = await Promise.all([
          isOpen
            ? allowedOptions(searchTextTrimmed, maxNumberOfPresentedOptions, arrayValues, signal)
            : /** @type {Option[]} */ ([]),
          // We need to fetch unknown options's labels regardless of whether the dropdown
          // is open or not, because we want to show it in the placeholder.
          newUnknownValues.length > 0
            ? allowedOptions(newUnknownValues, newUnknownValues.length, arrayValues, signal)
            : null,
        ]).catch((error) => {
          if (signal.aborted) {
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
        if (!searchTextTrimmed) {
          const unreturnedValues = newUnknownValues
            .filter((v) => !cachedOptions.current[v])
            .map((v) => ({ label: v, value: v }));
          if (unreturnedValues.length > 0) {
            updateCachedOptions(unreturnedValues);
            updatedOptions = unreturnedValues.concat(searchResults || []);
          }
        }
        // when search is applied don't sort the selected values to the top
        const options = searchTextTrimmed
          ? updatedOptions
          : sortValuesToTop(updatedOptions, arrayValues);
        // we don't need to re-sort what the backend returns, so pass filterAndSort=false to getMatchScore()
        setFilteredOptions(getMatchScore(searchTextTrimmed, options, language, false));
      } else {
        const mergedOptions = arrayValues
          .filter((v) => !allOptionsLookup[v])
          .map((v) => ({ label: v, value: v }))
          .concat(allowedOptions);
        // when search is applied don't sort the selected values to the top
        const options = searchText ? mergedOptions : sortValuesToTop(mergedOptions, arrayValues);
        setFilteredOptions(getMatchScore(searchText, options, language, true));
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
  }, [
    isOpen,
    searchTextTrimmed,
    language,
    newUnknownValuesAsKey,
    allowedOptionsAsKey,
    arrayValues,
    maxNumberOfPresentedOptions,
    updateCachedOptions,
    allOptionsLookup,
    searchText,
    allowedOptions,
  ]);

  const addNewOptionVisible =
    !isLoading &&
    allowFreeText &&
    searchTextTrimmed &&
    !arrayValues.includes(searchTextTrimmed) &&
    !filteredOptions.find((o) => o.value === searchTextTrimmed);

  if (!isOpen) {
    return null;
  }

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: <explanation>
    <ul
      className={[
        "PreactCombobox-options",
        `PreactCombobox--${theme}`,
        shouldUseTray ? "PreactCombobox-options--tray" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      // biome-ignore lint/a11y/useSemanticElements: it is correct by examples I've found for comboboxes
      role="listbox"
      id={`${id}-options-listbox`}
      aria-multiselectable={multiple ? "true" : undefined}
      hidden={!isOpen}
      ref={shouldUseTray ? null : dropdownPopperRef}
    >
      {isLoading ? (
        <li className="PreactCombobox-option" aria-disabled>
          {loadingRenderer(translations.loadingOptions)}
        </li>
      ) : (
        <>
          {addNewOptionVisible && (
            <li
              key={searchTextTrimmed}
              id={`${id}-option-${toHTMLId(searchTextTrimmed)}`}
              className="PreactCombobox-option"
              // biome-ignore lint/a11y/useSemanticElements: parent is <ul> so want to keep equivalent semantics
              role="option"
              tabIndex={-1}
              aria-selected={false}
              onMouseEnter={() => onActivateDescendant(searchTextTrimmed, false)}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddNewOption(searchTextTrimmed);
                if (!multiple && onClose) {
                  onClose();
                }
              }}
            >
              {translations.addOption.replace("{value}", searchTextTrimmed)}
            </li>
          )}
          {filteredOptions.map((option) => {
            // "Active" means it's like a focus / hover. It doesn't mean the option was selected.
            // aria-activedescendant is used to tell screen readers the active option.
            const isActive = activeDescendant === option.value;
            const isSelected = arrayValues.includes(option.value);
            const isInvalid = invalidValues.includes(option.value);
            const isDisabled = option.disabled;
            const hasDivider = option.divider && !searchTextTrimmed; // Only show divider when search is empty
            const optionClasses = [
              "PreactCombobox-option",
              isActive ? "PreactCombobox-option--active" : "",
              isSelected ? "PreactCombobox-option--selected" : "",
              isInvalid ? "PreactCombobox-option--invalid" : "",
              isDisabled ? "PreactCombobox-option--disabled" : "",
              hasDivider ? "PreactCombobox-option--divider" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <li
                key={option.value}
                id={`${id}-option-${toHTMLId(option.value)}`}
                className={optionClasses}
                // biome-ignore lint/a11y/useSemanticElements: <explanation>
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                aria-disabled={isDisabled}
                onMouseEnter={() => !isDisabled && onActivateDescendant(option.value, false)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOptionSelect(option.value, { toggleSelected: true });
                  if (!multiple && onClose) {
                    onClose();
                  }
                }}
              >
                {optionRenderer({
                  option,
                  language,
                  isActive,
                  isSelected,
                  isInvalid,
                  showValue,
                  warningIcon,
                  tickIcon,
                  optionIconRenderer,
                })}
                {isSelected ? (
                  <span
                    className="PreactCombobox-srOnly"
                    aria-atomic="true"
                    data-reader="selected"
                    aria-hidden={!isActive}
                  >
                    {translations.selectedOption}
                  </span>
                ) : null}
                {isInvalid ? (
                  <span
                    className="PreactCombobox-srOnly"
                    aria-atomic="true"
                    data-reader="invalid"
                    aria-hidden={!isActive}
                  >
                    {translations.invalidOption}
                  </span>
                ) : null}
              </li>
            );
          })}
          {filteredOptions.length === 0 &&
            !isLoading &&
            (!allowFreeText || !searchText || arrayValues.includes(searchText)) && (
              <li className="PreactCombobox-option">{translations.noOptionsFound}</li>
            )}
          {filteredOptions.length === maxNumberOfPresentedOptions && (
            <li className="PreactCombobox-option">{translations.typeToLoadMore}</li>
          )}
        </>
      )}
    </ul>
  );
};

export default SearchableList;