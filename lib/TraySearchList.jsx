import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { subscribeToVirtualKeyboard } from "./hooks.js";

/**
 * @typedef {import("./PreactCombobox.jsx").Translations} Translations
 * @typedef {import("preact").VNode} VNode
 */

/**
 * @typedef {Object} TraySearchListProps
 * @property {string} id - Component ID for ARIA attributes
 * @property {boolean} isOpen - Whether the tray is open
 * @property {() => void} onClose - Callback to close the tray
 * @property {string} [trayLabel] - Label for the tray header
 * @property {string} theme - Theme ('light' | 'dark' | 'system')
 * @property {Translations} translations - Translation strings
 * @property {(value: string) => void} onInputChange - Handle input change
 * @property {import("preact").ComponentChildren} children - The AutocompleteList component
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
  onInputChange,
  children,
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

  // Children contains the SearchableList component

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
        {children}
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