// lib/OptionsListbox.jsx
import { forwardRef } from "preact/compat";
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "preact/hooks";

// lib/utils.jsx
import { jsx } from "preact/jsx-runtime";
function toHTMLId(text) {
  return text.replace(/[^a-zA-Z0-9\-_:.]/g, "");
}

// lib/OptionsListbox.jsx
import { Fragment, jsx as jsx2, jsxs } from "preact/jsx-runtime";
var OptionsListbox = forwardRef(
  ({
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
    setDropdownRef
  }, ref) => {
    const [activeDescendant, setActiveDescendant] = useState("");
    const listRef = useRef(
      /** @type {HTMLUListElement | null} */
      null
    );
    const searchTextTrimmed = searchText.trim();
    const addNewOptionVisible = !isLoading && allowFreeText && searchTextTrimmed && !arrayValues.includes(searchTextTrimmed) && !filteredOptions.find((o) => o.value === searchTextTrimmed);
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
            listRef.current.scrollTop += itemRect.bottom - listRect.bottom;
          } else if (itemRect.top < listRect.top) {
            listRef.current.scrollTop += itemRect.top - listRect.top;
          }
        }
      },
      [id]
    );
    const getNavigableOptions = useCallback(() => {
      const options = filteredOptions.filter((o) => !o.disabled).map((o) => o.value);
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
          if (nextValue !== void 0) {
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
          if (prevValue !== void 0) {
            setActiveDescendant(prevValue);
            scrollOptionIntoView(prevValue);
          }
        },
        navigateToFirst: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;
          const firstValue = options[0];
          if (firstValue !== void 0) {
            setActiveDescendant(firstValue);
            scrollOptionIntoView(firstValue);
          }
        },
        navigateToLast: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;
          const lastValue = options[options.length - 1];
          if (lastValue !== void 0) {
            setActiveDescendant(lastValue);
            scrollOptionIntoView(lastValue);
          }
        },
        navigatePageDown: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;
          const firstOptionEl = listRef.current?.querySelector(".PreactCombobox-option");
          const pageSize = listRef.current && firstOptionEl ? Math.max(
            1,
            Math.floor(
              listRef.current.clientHeight / firstOptionEl.getBoundingClientRect().height
            )
          ) : 10;
          const currentIndex = activeDescendant ? options.indexOf(activeDescendant) : -1;
          const targetIndex = Math.min(currentIndex + pageSize, options.length - 1);
          const targetValue = options[targetIndex];
          if (targetValue !== void 0) {
            setActiveDescendant(targetValue);
            scrollOptionIntoView(targetValue);
          }
        },
        navigatePageUp: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;
          const firstOptionEl = listRef.current?.querySelector(".PreactCombobox-option");
          const pageSize = listRef.current && firstOptionEl ? Math.max(
            1,
            Math.floor(
              listRef.current.clientHeight / firstOptionEl.getBoundingClientRect().height
            )
          ) : 10;
          const currentIndex = activeDescendant ? options.indexOf(activeDescendant) : options.length;
          const targetIndex = Math.max(currentIndex - pageSize, 0);
          const targetValue = options[targetIndex];
          if (targetValue !== void 0) {
            setActiveDescendant(targetValue);
            scrollOptionIntoView(targetValue);
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
          const option = filteredOptions.find(
            (o) => o.value === activeDescendant
          );
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
        clearActiveDescendant: () => setActiveDescendant("")
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
        onClose
      ]
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
      [setDropdownRef, shouldUseTray]
    );
    if (!isOpen) {
      return null;
    }
    return (
      // biome-ignore lint/a11y/useFocusableInteractive: <explanation>
      /* @__PURE__ */ jsx2(
        "ul",
        {
          className: [
            "PreactCombobox-options",
            `PreactCombobox--${theme}`,
            shouldUseTray ? "PreactCombobox-options--tray" : ""
          ].filter(Boolean).join(" "),
          role: "listbox",
          id: `${id}-options-listbox`,
          "aria-multiselectable": multiple ? "true" : void 0,
          hidden: !isOpen,
          ref: handleListRef,
          children: isLoading ? /* @__PURE__ */ jsx2("li", { className: "PreactCombobox-option", "aria-disabled": true, children: loadingRenderer(translations.loadingOptions) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            addNewOptionVisible && /* @__PURE__ */ jsx2(
              "li",
              {
                id: `${id}-option-${toHTMLId(searchTextTrimmed)}`,
                className: `PreactCombobox-option ${activeDescendant === searchTextTrimmed ? "PreactCombobox-option--active" : ""}`,
                role: "option",
                tabIndex: -1,
                "aria-selected": false,
                onMouseEnter: () => setActiveDescendant(searchTextTrimmed),
                onMouseDown: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOptionSelect(searchTextTrimmed);
                  if (!multiple && onClose) {
                    onClose();
                  }
                },
                children: translations.addOption.replace("{value}", searchTextTrimmed)
              },
              searchTextTrimmed
            ),
            filteredOptions.map((option) => {
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
                hasDivider ? "PreactCombobox-option--divider" : ""
              ].filter(Boolean).join(" ");
              return /* @__PURE__ */ jsxs(
                "li",
                {
                  id: `${id}-option-${toHTMLId(option.value)}`,
                  className: optionClasses,
                  role: "option",
                  tabIndex: -1,
                  "aria-selected": isSelected,
                  "aria-disabled": isDisabled,
                  onMouseEnter: () => !isDisabled && setActiveDescendant(option.value),
                  onMouseDown: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOptionSelect(option.value, { toggleSelected: true });
                    if (!multiple && onClose) {
                      onClose();
                    }
                  },
                  children: [
                    optionRenderer({
                      option,
                      language,
                      isActive,
                      isSelected,
                      isInvalid,
                      showValue,
                      warningIcon,
                      tickIcon,
                      optionIconRenderer
                    }),
                    isSelected ? /* @__PURE__ */ jsx2(
                      "span",
                      {
                        className: "PreactCombobox-srOnly",
                        "aria-atomic": "true",
                        "data-reader": "selected",
                        "aria-hidden": !isActive,
                        children: translations.selectedOption
                      }
                    ) : null,
                    isInvalid ? /* @__PURE__ */ jsx2(
                      "span",
                      {
                        className: "PreactCombobox-srOnly",
                        "aria-atomic": "true",
                        "data-reader": "invalid",
                        "aria-hidden": !isActive,
                        children: translations.invalidOption
                      }
                    ) : null
                  ]
                },
                option.value
              );
            }),
            filteredOptions.length === 0 && !isLoading && (!allowFreeText || !searchText || arrayValues.includes(searchText)) && /* @__PURE__ */ jsx2("li", { className: "PreactCombobox-option", children: translations.noOptionsFound })
          ] })
        }
      )
    );
  }
);
var OptionsListbox_default = OptionsListbox;
export {
  OptionsListbox_default as default
};
//# sourceMappingURL=OptionsListbox.js.map
