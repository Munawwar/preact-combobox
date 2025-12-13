// lib/AutocompleteList.jsx
import { forwardRef } from "preact/compat";
import { useCallback as useCallback2, useEffect, useImperativeHandle, useMemo as useMemo2, useRef as useRef2, useState as useState2 } from "preact/hooks";

// lib/hooks.js
import { useCallback, useMemo, useRef, useState } from "preact/hooks";
function isEqual(value1, value2) {
  const seenA = /* @__PURE__ */ new WeakMap();
  const seenB = /* @__PURE__ */ new WeakMap();
  function deepCompare(a, b) {
    if (Object.is(a, b)) return true;
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
      return a === b;
    }
    if (a.$$typeof === Symbol.for("react.element") || b.$$typeof === Symbol.for("react.element")) {
      return a === b;
    }
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
      return false;
    }
    if (seenA.has(a)) return seenA.get(a) === b;
    if (seenB.has(b)) return seenB.get(b) === a;
    if (seenA.has(b) || seenB.has(a)) return false;
    seenA.set(a, b);
    seenB.set(b, a);
    if (Array.isArray(a)) {
      if (a.length !== b.length) {
        return false;
      }
      return a.every((item, index) => deepCompare(item, b[index]));
    }
    if (a instanceof Date) {
      return a.getTime() === b.getTime();
    }
    if (a instanceof RegExp) {
      return a.toString() === b.toString();
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => keysB.includes(key) && deepCompare(a[key], b[key]));
  }
  return deepCompare(value1, value2);
}
function useDeepMemo(newState) {
  const state = useRef(
    /** @type {T} */
    null
  );
  if (!isEqual(newState, state.current)) {
    state.current = newState;
  }
  return state.current;
}
var isTouchDevice = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)")?.matches;
var visualViewportInitialHeight = window.visualViewport?.height ?? 0;

// lib/utils.jsx
import { h } from "preact";
import { jsx } from "preact/jsx-runtime";
var languageCache = {};
function toHTMLId(text) {
  return text.replace(/[^a-zA-Z0-9\-_:.]/g, "");
}
function sortValuesToTop(options, values) {
  const selectedSet = new Set(values);
  return options.sort((a, b) => {
    const aSelected = selectedSet.has(a.value);
    const bSelected = selectedSet.has(b.value);
    if (aSelected === bSelected) return 0;
    return aSelected ? -1 : 1;
  });
}
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
      matchSlices: [[0, value.length]]
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
      matchSlices: [[0, label.length]]
    };
  }
  const { caseMatcher } = (
    /** @type {LanguageCache} */
    languageCache[language]
  );
  if (caseMatcher.compare(value, query) === 0) {
    return {
      ...rest,
      label,
      value,
      score: 7,
      /** @type {'value'} */
      matched: "value",
      /** @type {Array<[number, number]>} */
      matchSlices: [[0, value.length]]
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
      matchSlices: [[0, label.length]]
    };
  }
  return null;
}
function getMatchScore(query, options, language = "en", filterAndSort = true) {
  query = query.trim();
  if (!query) {
    const matchSlices = (
      /** @type {Array<[number, number]>} */
      []
    );
    return options.map((option) => ({
      ...option,
      label: option.label,
      value: option.value,
      score: 0,
      matched: "none",
      matchSlices
    }));
  }
  if (!languageCache[language]) {
    languageCache[language] = {
      baseMatcher: new Intl.Collator(language, {
        usage: "search",
        sensitivity: "base"
      }),
      caseMatcher: new Intl.Collator(language, {
        usage: "search",
        sensitivity: "accent"
      }),
      wordSegmenter: new Intl.Segmenter(language, {
        granularity: "word"
      })
    };
  }
  const { baseMatcher, caseMatcher, wordSegmenter } = languageCache[language];
  const isCommaSeparated = query.includes(",");
  let matches = options.map((option) => {
    const { label, value, ...rest } = option;
    if (isCommaSeparated) {
      const querySegments2 = query.split(",");
      const matches2 = querySegments2.map((querySegment) => getExactMatchScore(querySegment.trim(), option, language)).filter((match) => match !== null).sort((a, b) => b.score - a.score);
      return (
        /** @type {OptionMatch} */
        matches2[0] || {
          ...rest,
          label,
          value,
          score: 0,
          matched: "none"
        }
      );
    }
    const exactMatch = getExactMatchScore(query, option, language);
    if (exactMatch) {
      return exactMatch;
    }
    if (baseMatcher.compare(label, query) === 0) {
      return {
        ...rest,
        label,
        value,
        score: 5,
        /** @type {'label'} */
        matched: "label",
        /** @type {Array<[number, number]>} */
        matchSlices: [[0, label.length]]
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
        matchSlices: [[0, value.length]]
      };
    }
    const querySegments = Array.from(wordSegmenter.segment(query));
    const labelWordSegments = Array.from(wordSegmenter.segment(label.trim()));
    let len = 0;
    let firstIndex = -1;
    for (let i = 0; i < labelWordSegments.length; i++) {
      const labelWordSegment = (
        /** @type {Intl.SegmentData} */
        labelWordSegments[i]
      );
      const querySegment = querySegments[len];
      if (!querySegment) break;
      if (len === querySegments.length - 1) {
        const lastQueryWord = querySegment.segment;
        if (baseMatcher.compare(
          labelWordSegment.segment.slice(0, lastQueryWord.length),
          lastQueryWord
        ) === 0) {
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
                labelWordSegment.index + lastQueryWord.length
              ]
            ]
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
    if (caseMatcher.compare(value.slice(0, query.length), query) === 0) {
      return {
        ...rest,
        label,
        value,
        score: 3,
        /** @type {'value'} */
        matched: "value",
        /** @type {Array<[number, number]>} */
        matchSlices: [[0, query.length]]
      };
    }
    const queryWords = querySegments.filter((s) => s.isWordLike);
    const labelWords = labelWordSegments.filter((s) => s.isWordLike);
    const slices = queryWords.map((word) => {
      const match = labelWords.find(
        (labelWord) => baseMatcher.compare(labelWord.segment, word.segment) === 0
      );
      if (match) {
        return [match.index, match.index + match.segment.length];
      }
    });
    const matchSlices = slices.filter((s) => s !== void 0).sort((a, b) => a[0] - b[0]);
    const wordScoring = matchSlices.length / queryWords.length;
    return {
      ...rest,
      label,
      value,
      score: wordScoring,
      /** @type {'label'|'none'} */
      matched: wordScoring ? "label" : "none",
      matchSlices
    };
  });
  if (filterAndSort) {
    matches = matches.filter((match) => match.score > 0);
    matches.sort((a, b) => {
      if (a.score === b.score) {
        const val = a.label.localeCompare(b.label, void 0, {
          sensitivity: "base"
        });
        return val === 0 ? a.value.localeCompare(b.value, void 0, { sensitivity: "base" }) : val;
      }
      return b.score - a.score;
    });
  }
  return matches;
}

// lib/AutocompleteList.jsx
import { Fragment, jsx as jsx2, jsxs } from "preact/jsx-runtime";
var isPlaywright = navigator.webdriver === true;
var AutocompleteList = forwardRef(
  ({
    id,
    searchText,
    allowedOptions,
    arrayValues,
    invalidValues,
    multiple,
    allowFreeText,
    language,
    maxNumberOfPresentedOptions,
    onOptionSelect,
    onActiveDescendantChange,
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
    setDropdownRef
  }, ref) => {
    const [filteredOptions, setFilteredOptions] = useState2(
      /** @type {OptionMatch[]} */
      []
    );
    const [isLoading, setIsLoading] = useState2(false);
    const [activeDescendant, setActiveDescendant] = useState2("");
    const cachedOptions = useRef2(
      /** @type {{ [value: string]: Option }} */
      {}
    );
    const abortControllerRef = useRef2(
      /** @type {AbortController | null} */
      null
    );
    const inputTypingDebounceTimer = useRef2(
      /** @type {any} */
      null
    );
    const listRef = useRef2(
      /** @type {HTMLUListElement | null} */
      null
    );
    const searchTextTrimmed = searchText.trim();
    const allowedOptionsAsKey = useDeepMemo(
      typeof allowedOptions === "function" ? null : allowedOptions
    );
    const updateCachedOptions = useCallback2(
      /** @param {Option[]} update */
      (update) => {
        for (const item of update) {
          cachedOptions.current[item.value] = item;
        }
      },
      []
    );
    const allOptions = useDeepMemo(
      Array.isArray(allowedOptions) ? allowedOptions : Object.values(cachedOptions.current)
    );
    const allOptionsLookup = useMemo2(
      () => allOptions.reduce(
        (acc, o) => {
          acc[o.value] = o;
          return acc;
        },
        /** @type {{ [value: string]: Option }} */
        {}
      ),
      [allOptions]
    );
    const newUnknownValues = arrayValues.filter((v) => !allOptionsLookup[v]);
    const newUnknownValuesAsKey = useDeepMemo(newUnknownValues);
    const addNewOptionVisible = !isLoading && allowFreeText && searchTextTrimmed && !arrayValues.includes(searchTextTrimmed) && !filteredOptions.find((o) => o.value === searchTextTrimmed);
    const scrollOptionIntoView = useCallback2(
      /** @param {string} optionValue */
      (optionValue) => {
        if (!listRef.current || !optionValue) return;
        const elementId = `${id}-option-${toHTMLId(optionValue)}`;
        const element = listRef.current.querySelector(`#${elementId}`);
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
      [id]
    );
    const getNavigableOptions = useCallback2(() => {
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
        selectActive: () => {
          if (!activeDescendant) return false;
          if (addNewOptionVisible && activeDescendant === searchTextTrimmed) {
            onOptionSelect(searchTextTrimmed);
            if (!multiple && onClose) {
              onClose();
            }
            return true;
          }
          const option = filteredOptions.find((o) => o.value === activeDescendant);
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
    useEffect(() => {
      const shouldFetchOptions = isOpen || typeof allowedOptions === "function";
      if (!shouldFetchOptions) return;
      const abortController = typeof allowedOptions === "function" ? new AbortController() : null;
      abortControllerRef.current?.abort();
      abortControllerRef.current = abortController;
      let debounceTime = 0;
      if (typeof allowedOptions === "function" && !// don't debounce for initial render (when we have to resolve the labels for selected values).
      // don't debounce for first time the dropdown is opened as well.
      (newUnknownValues.length > 0 || isOpen) && // Hack: We avoid debouncing to speed up playwright tests
      !isPlaywright) {
        debounceTime = 250;
      }
      clearTimeout(inputTypingDebounceTimer.current);
      const callback = async () => {
        if (typeof allowedOptions === "function") {
          const signal = (
            /** @type {AbortSignal} */
            abortController.signal
          );
          const [searchResults, selectedResults] = await Promise.all([
            isOpen ? allowedOptions(searchTextTrimmed, maxNumberOfPresentedOptions, arrayValues, signal) : (
              /** @type {Option[]} */
              []
            ),
            // We need to fetch unknown options's labels regardless of whether the dropdown
            // is open or not, because we want to show it in the placeholder.
            newUnknownValues.length > 0 ? allowedOptions(newUnknownValues, newUnknownValues.length, arrayValues, signal) : null
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
          if (!searchTextTrimmed) {
            const unreturnedValues = newUnknownValues.filter((v) => !cachedOptions.current[v]).map((v) => ({ label: v, value: v }));
            if (unreturnedValues.length > 0) {
              updateCachedOptions(unreturnedValues);
              updatedOptions = unreturnedValues.concat(searchResults || []);
            }
          }
          const options = searchTextTrimmed ? updatedOptions : sortValuesToTop(updatedOptions, arrayValues);
          setFilteredOptions(getMatchScore(searchTextTrimmed, options, language, false));
        } else {
          const mergedOptions = arrayValues.filter((v) => !allOptionsLookup[v]).map((v) => ({ label: v, value: v })).concat(allowedOptions);
          const options = searchText ? mergedOptions : sortValuesToTop(mergedOptions, arrayValues);
          setFilteredOptions(getMatchScore(searchText, options, language, true));
        }
      };
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
      allowedOptions
    ]);
    const handleListRef = useCallback2(
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
            filteredOptions.length === 0 && !isLoading && (!allowFreeText || !searchText || arrayValues.includes(searchText)) && /* @__PURE__ */ jsx2("li", { className: "PreactCombobox-option", children: translations.noOptionsFound }),
            filteredOptions.length === maxNumberOfPresentedOptions && /* @__PURE__ */ jsx2("li", { className: "PreactCombobox-option", children: translations.typeToLoadMore })
          ] })
        }
      )
    );
  }
);
var AutocompleteList_default = AutocompleteList;
export {
  AutocompleteList_default as default
};
//# sourceMappingURL=AutocompleteList.js.map
