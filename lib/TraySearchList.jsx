import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { subscribeToVirtualKeyboard } from "./hooks.js";

/**
 * @typedef {import("./PreactCombobox.jsx").Option} Option
 * @typedef {import("./PreactCombobox.jsx").OptionMatch} OptionMatch
 * @typedef {import("./PreactCombobox.jsx").Translations} Translations
 * @typedef {import("./PreactCombobox.jsx").OptionTransformFunction} OptionTransformFunction
 * @typedef {import("preact").VNode} VNode
 */

/**
 * @typedef {Object} TraySearchListProps
 * @property {string} id - Component ID for ARIA attributes
 * @property {boolean} isOpen - Whether the tray is open
 * @property {() => void} onClose - Callback to close the tray
 * @property {string} trayLabel - Label for the tray header
 * @property {string} theme - Theme ('light' | 'dark' | 'system')
 * @property {Translations} translations - Translation strings
 * @property {boolean} multiple - Whether multi-select is enabled
 * @property {boolean} isLoading - Whether options are loading
 * @property {OptionMatch[]} filteredOptions - Available options to display
 * @property {boolean} addNewOptionVisible - Whether "add new option" is visible
 * @property {string} inputTrimmed - Current trimmed input value
 * @property {string[]} arrayValues - Currently selected values
 * @property {string[]} invalidValues - Invalid selected values
 * @property {string} activeDescendant - Currently active descendant ID
 * @property {(optionValue: string, scroll?: boolean) => void} onActivateDescendant - Activate an option
 * @property {(selectedValue: string, options?: {toggleSelected?: boolean}) => void} onOptionSelect - Handle option selection
 * @property {(newValue: string) => void} onAddNewOption - Handle adding new option
 * @property {OptionTransformFunction} optionRenderer - Function to render options
 * @property {VNode} warningIcon - Warning icon element
 * @property {VNode} tickIcon - Tick icon element
 * @property {(option: Option, isInput?: boolean) => VNode|null} optionIconRenderer - Option icon renderer
 * @property {boolean} showValue - Whether to show option values
 * @property {string} language - Language code
 * @property {(text: string) => VNode|string} loadingRenderer - Loading renderer
 * @property {(value: string) => void} onInputChange - Handle input change
 * @property {HTMLUListElement | null} dropdownPopperRef - Ref to the dropdown list element
 */

/**
 * TraySearchList component - handles mobile tray with search input and options list
 * @param {TraySearchListProps} props
 */
const TraySearchList = ({
  id,
  isOpen,
  onClose,
  trayLabel,
  theme,
  translations,
  multiple,
  isLoading,
  filteredOptions,
  addNewOptionVisible,
  inputTrimmed,
  arrayValues,
  invalidValues,
  activeDescendant,
  onActivateDescendant,
  onOptionSelect,
  onAddNewOption,
  optionRenderer,
  warningIcon,
  tickIcon,
  optionIconRenderer,
  showValue,
  language,
  loadingRenderer,
  onInputChange,
  dropdownPopperRef,
}) => {
  // Tray-specific state
  const [trayInputValue, setTrayInputValue] = useState("");
  const [virtualKeyboardHeight, setVirtualKeyboardHeight] = useState(0);
  const trayInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const trayModalRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const originalOverflowRef = useRef("");
  const virtualKeyboardHeightAdjustSubscription = useRef(/** @type {function | null} */ (null));

  // Handle tray input change
  const handleTrayInputChange = useCallback(
    /**
     * @param {import('preact/compat').ChangeEvent<HTMLInputElement>} e
     */
    (e) => {
      const value = e.currentTarget.value;
      setTrayInputValue(value);
      onInputChange(value);
    },
    [onInputChange],
  );

  // Handle tray close
  const handleClose = useCallback(() => {
    setTrayInputValue("");
    setVirtualKeyboardHeight(0);
    virtualKeyboardHeightAdjustSubscription.current?.();
    virtualKeyboardHeightAdjustSubscription.current = null;

    // Restore original overflow
    const scrollingElement = /** @type {HTMLElement} */ (
      document.scrollingElement || document.documentElement
    );
    scrollingElement.style.overflow = originalOverflowRef.current;

    onClose();
  }, [onClose]);

  // Setup virtual keyboard subscription and overflow handling when tray opens
  useEffect(() => {
    if (isOpen) {
      // Get the scrolling element (body or html)
      const scrollingElement = /** @type {HTMLElement} */ (
        document.scrollingElement || document.documentElement
      );

      // Save original overflow and apply hidden
      originalOverflowRef.current = scrollingElement.style.overflow;
      scrollingElement.style.overflow = "hidden";

      // Subscribe to virtual keyboard for tray
      if (!virtualKeyboardHeightAdjustSubscription.current) {
        virtualKeyboardHeightAdjustSubscription.current = subscribeToVirtualKeyboard({
          heightCallback(keyboardHeight, isVisible) {
            setVirtualKeyboardHeight(isVisible ? keyboardHeight : 0);
          },
        });
      }

      // Focus the input when tray opens
      trayInputRef.current?.focus();
    }
  }, [isOpen]);

  // Clean up when component unmounts or tray closes
  useEffect(() => {
    return () => {
      if (virtualKeyboardHeightAdjustSubscription.current) {
        virtualKeyboardHeightAdjustSubscription.current();
        virtualKeyboardHeightAdjustSubscription.current = null;
      }
    };
  }, []);

  // Helper function to get option ID
  const toHTMLId = (text) => {
    return text.replace(/[^a-zA-Z0-9\-_:.]/g, "");
  };

  const optionsList = (
    // biome-ignore lint/a11y/useFocusableInteractive: <explanation>
    <ul
      className={[
        "PreactCombobox-options",
        `PreactCombobox--${theme}`,
        "PreactCombobox-options--tray",
      ]
        .filter(Boolean)
        .join(" ")}
      // biome-ignore lint/a11y/useSemanticElements: it is correct by examples I've found for comboboxes
      role="listbox"
      id={`${id}-options-listbox`}
      aria-multiselectable={multiple ? "true" : undefined}
      hidden={!isOpen}
      ref={dropdownPopperRef}
    >
      {isLoading ? (
        <li className="PreactCombobox-option" aria-disabled>
          {loadingRenderer(translations.loadingOptions)}
        </li>
      ) : (
        <>
          {addNewOptionVisible && (
            <li
              key={inputTrimmed}
              id={`${id}-option-${toHTMLId(inputTrimmed)}`}
              className="PreactCombobox-option"
              // biome-ignore lint/a11y/useSemanticElements: parent is <ul> so want to keep equivalent semantics
              role="option"
              tabIndex={-1}
              aria-selected={false}
              onMouseEnter={() => onActivateDescendant(inputTrimmed, false)}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddNewOption(inputTrimmed);
                if (!multiple) {
                  handleClose();
                } else {
                  trayInputRef.current?.focus();
                }
              }}
            >
              {translations.addOption.replace("{value}", inputTrimmed)}
            </li>
          )}
          {filteredOptions.map((option) => {
            // "Active" means it's like a focus / hover. It doesn't mean the option was selected.
            // aria-activedescendant is used to tell screen readers the active option.
            const isActive = activeDescendant === option.value;
            const isSelected = arrayValues.includes(option.value);
            const isInvalid = invalidValues.includes(option.value);
            const isDisabled = option.disabled;
            const hasDivider = option.divider && !inputTrimmed; // Only show divider when search is empty
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
                  if (!multiple) {
                    handleClose();
                  } else {
                    trayInputRef.current?.focus();
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
            (!addNewOptionVisible || arrayValues.includes(trayInputValue)) && (
              <li className="PreactCombobox-option">{translations.noOptionsFound}</li>
            )}
        </>
      )}
    </ul>
  );

  if (!isOpen) {
    return null;
  }

  return (
    // I couldn't use native <dialog> element because trying to focus input right
    // after dialog.close() doesn't seem to work on Chrome (Android).
    <div
      ref={trayModalRef}
      className={`PreactCombobox-modal ${`PreactCombobox--${theme}`}`}
      style={{ display: isOpen ? null : "none" }}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === trayModalRef.current) {
          handleClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          handleClose();
        }
      }}
      // biome-ignore lint/a11y/useSemanticElements: Custom modal implementation instead of dialog element
      role="dialog"
      aria-modal="true"
      aria-labelledby={trayLabel ? `${id}-tray-label` : undefined}
      tabIndex={-1}
    >
      <div className={`PreactCombobox-tray ${`PreactCombobox--${theme}`}`}>
        <div className="PreactCombobox-trayHeader">
          {trayLabel && (
            <label
              id={`${id}-tray-label`}
              className="PreactCombobox-trayLabel"
              htmlFor={`${id}-tray-input`}
            >
              {trayLabel}
            </label>
          )}
          <input
            id={`${id}-tray-input`}
            ref={trayInputRef}
            type="text"
            value={trayInputValue}
            placeholder={translations.searchPlaceholder}
            onChange={handleTrayInputChange}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleClose();
              }
            }}
            className={`PreactCombobox-trayInput ${!trayLabel ? "PreactCombobox-trayInput--noLabel" : ""}`}
            role="combobox"
            aria-expanded="true"
            aria-haspopup="listbox"
            aria-controls={`${id}-options-listbox`}
            aria-label={trayLabel || translations.searchPlaceholder}
            autoComplete="off"
          />
        </div>
        {optionsList}
        {virtualKeyboardHeight > 0 && (
          <div
            className="PreactCombobox-virtualKeyboardSpacer"
            style={{ height: `${virtualKeyboardHeight}px` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default TraySearchList;