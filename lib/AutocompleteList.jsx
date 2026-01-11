import { forwardRef } from "preact/compat";
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "preact/hooks";
import { toHTMLId } from "./utils.jsx";

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
const AutocompleteList = forwardRef(
  (
    /** @type {AutocompleteListProps} */
    {
      id,
      searchText,
      filteredOptions,
      isLoading,
      arrayValues,
      invalidValues,
      multiple,
      allowFreeText,
      onOptionSelect,
      onActiveDescendantChange,
      onClose,
      optionRenderer,
      warningIcon,
      tickIcon,
      optionIconRenderer,
      showValue,
      language,
      loadingRenderer,
      translations,
      theme,
      isOpen,
      shouldUseTray,
      setDropdownRef,
    },
    ref,
  ) => {
    const [activeDescendant, setActiveDescendant] = useState("");
    const listRef = useRef(/** @type {HTMLUListElement | null} */ (null));

    const searchTextTrimmed = searchText.trim();

    const addNewOptionVisible =
      !isLoading &&
      allowFreeText &&
      searchTextTrimmed &&
      !arrayValues.includes(searchTextTrimmed) &&
      !filteredOptions.find((/** @type {OptionMatch} */ o) => o.value === searchTextTrimmed);

    const scrollOptionIntoView = useCallback(
      /** @param {string} optionValue */
      (optionValue) => {
        if (!listRef.current || !optionValue) return;
        const elementId = `${id}-option-${toHTMLId(optionValue)}`;
        const element = listRef.current.querySelector(`#${CSS.escape(elementId)}`);
        if (element) {
          const listRect = listRef.current.getBoundingClientRect();
          const itemRect = element.getBoundingClientRect();
          if (itemRect.bottom > listRect.bottom) {
            element.scrollIntoView({ block: "end" });
          } else if (itemRect.top < listRect.top) {
            element.scrollIntoView({ block: "start" });
          }
        }
      },
      [id],
    );

    const getNavigableOptions = useCallback(() => {
      const options = filteredOptions
        .filter((/** @type {OptionMatch} */ o) => !o.disabled)
        .map((/** @type {OptionMatch} */ o) => o.value);
      if (addNewOptionVisible) {
        return [searchTextTrimmed, ...options];
      }
      return options;
    }, [filteredOptions, addNewOptionVisible, searchTextTrimmed]);

    useImperativeHandle(
      ref,
      () => ({
        navigateDown: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;

          const currentIndex = activeDescendant ? options.indexOf(activeDescendant) : -1;
          const nextIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
          const nextValue = options[nextIndex];
          if (nextValue !== undefined) {
            setActiveDescendant(nextValue);
            scrollOptionIntoView(nextValue);
          }
        },
        navigateUp: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;

          const currentIndex = activeDescendant ? options.indexOf(activeDescendant) : 0;
          const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
          const prevValue = options[prevIndex];
          if (prevValue !== undefined) {
            setActiveDescendant(prevValue);
            scrollOptionIntoView(prevValue);
          }
        },
        navigateToFirst: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;
          const firstValue = options[0];
          if (firstValue !== undefined) {
            setActiveDescendant(firstValue);
            scrollOptionIntoView(firstValue);
          }
        },
        navigateToLast: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;
          const lastValue = options[options.length - 1];
          if (lastValue !== undefined) {
            setActiveDescendant(lastValue);
            scrollOptionIntoView(lastValue);
          }
        },
        selectActive: () => {
          if (!activeDescendant) return false;

          if (addNewOptionVisible && activeDescendant === searchTextTrimmed) {
            onOptionSelect(searchTextTrimmed);
            if (!multiple && onClose) {
              onClose();
            }
            return true;
          }

          const option = filteredOptions.find((/** @type {OptionMatch} */ o) => o.value === activeDescendant);
          if (option && !option.disabled) {
            onOptionSelect(option.value, { toggleSelected: true });
            if (!multiple && onClose) {
              onClose();
            }
            return true;
          }

          return false;
        },
        getActiveDescendant: () => activeDescendant,
        setActiveDescendant: (value) => {
          setActiveDescendant(value);
          scrollOptionIntoView(value);
        },
        clearActiveDescendant: () => setActiveDescendant(""),
      }),
      [
        activeDescendant,
        getNavigableOptions,
        scrollOptionIntoView,
        addNewOptionVisible,
        searchTextTrimmed,
        filteredOptions,
        onOptionSelect,
        multiple,
        onClose,
      ],
    );

    useEffect(() => {
      if (!isOpen) {
        setActiveDescendant("");
      }
    }, [isOpen]);

    useEffect(() => {
      onActiveDescendantChange?.(activeDescendant);
    }, [activeDescendant, onActiveDescendantChange]);

    const handleListRef = useCallback(
      /** @param {HTMLUListElement | null} el */
      (el) => {
        listRef.current = el;
        if (setDropdownRef && !shouldUseTray) {
          setDropdownRef(el);
        }
      },
      [setDropdownRef, shouldUseTray],
    );

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
        ref={handleListRef}
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
                className={`PreactCombobox-option ${activeDescendant === searchTextTrimmed ? "PreactCombobox-option--active" : ""}`}
                // biome-ignore lint/a11y/useSemanticElements: parent is <ul> so want to keep equivalent semantics
                role="option"
                tabIndex={-1}
                aria-selected={false}
                onMouseEnter={() => setActiveDescendant(searchTextTrimmed)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOptionSelect(searchTextTrimmed);
                  if (!multiple && onClose) {
                    onClose();
                  }
                }}
              >
                {translations.addOption.replace("{value}", searchTextTrimmed)}
              </li>
            )}
            {filteredOptions.map((/** @type {OptionMatch} */ option) => {
              const isActive = activeDescendant === option.value;
              const isSelected = arrayValues.includes(option.value);
              const isInvalid = invalidValues.includes(option.value);
              const isDisabled = option.disabled;
              const hasDivider = option.divider && !searchTextTrimmed;
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
                  onMouseEnter={() => !isDisabled && setActiveDescendant(option.value)}
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
          </>
        )}
      </ul>
    );
  },
);

export default AutocompleteList;
