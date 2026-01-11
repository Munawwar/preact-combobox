// lib/PreactCombobox.jsx
import { createPopper } from "@popperjs/core";
import { createPortal } from "preact/compat";
import {
  useCallback as useCallback4,
  useEffect as useEffect4,
  useId,
  useLayoutEffect,
  useMemo as useMemo2,
  useRef as useRef4,
  useState as useState4
} from "preact/hooks";

// lib/hooks.js
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";

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
function matchSlicesToNodes(matchSlices, text) {
  const nodes = (
    /** @type {VNode[]} */
    []
  );
  let index = 0;
  matchSlices.map((slice) => {
    const [start, end] = slice;
    if (index < start) {
      nodes.push(/* @__PURE__ */ jsx("span", { children: text.slice(index, start) }, `${index}-${start}`));
    }
    nodes.push(/* @__PURE__ */ jsx("u", { children: text.slice(start, end) }, `${start}-${end}`));
    index = end;
  });
  if (index < text.length) {
    nodes.push(/* @__PURE__ */ jsx("span", { children: text.slice(index) }, `${index}-${text.length}`));
  }
  return nodes;
}

// lib/hooks.js
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
function useLive(initialValue) {
  const [refreshValue, forceRefresh] = useState(0);
  const ref = useRef(initialValue);
  let hasValueChanged = false;
  const getValue = useMemo(() => {
    hasValueChanged = true;
    return () => ref.current;
  }, [refreshValue]);
  const setValue = useCallback(
    /** @param {T} value */
    (value) => {
      if (value !== ref.current) {
        ref.current = value;
        forceRefresh((x) => x + 1);
      }
    },
    []
  );
  return [getValue, setValue, hasValueChanged];
}
var isTouchDevice = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)")?.matches;
var visualViewportInitialHeight = window.visualViewport?.height ?? 0;
function subscribeToVirtualKeyboard({ visibleCallback, heightCallback }) {
  if (!isTouchDevice || typeof window === "undefined" || !window.visualViewport) return null;
  let isVisible = false;
  const handleViewportResize = () => {
    if (!window.visualViewport) return;
    const heightDiff = visualViewportInitialHeight - window.visualViewport.height;
    const isVisibleNow = heightDiff > 150;
    if (isVisible !== isVisibleNow) {
      isVisible = isVisibleNow;
      visibleCallback?.(isVisible);
    }
    heightCallback?.(heightDiff, isVisible);
  };
  window.visualViewport.addEventListener("resize", handleViewportResize, { passive: true });
  return () => {
    window.visualViewport?.removeEventListener("resize", handleViewportResize);
  };
}
var isPlaywright = typeof navigator !== "undefined" && navigator.webdriver === true;
function useAsyncOptions({
  allowedOptions,
  selectedValues,
  searchText,
  isOpen,
  language,
  maxNumberOfPresentedOptions
}) {
  const [filteredOptions, setFilteredOptions] = useState(
    /** @type {OptionMatch[]} */
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [cacheVersion, setCacheVersion] = useState(0);
  const cachedOptions = useRef(
    /** @type {{ [value: string]: Option }} */
    {}
  );
  const abortControllerRef = useRef(
    /** @type {AbortController | null} */
    null
  );
  const debounceTimerRef = useRef(
    /** @type {ReturnType<typeof setTimeout> | null} */
    null
  );
  const searchTextTrimmed = searchText.trim();
  const allowedOptionsAsKey = useDeepMemo(
    typeof allowedOptions === "function" ? null : allowedOptions
  );
  const selectedValuesAsKey = useDeepMemo(selectedValues);
  const updateCachedOptions = useCallback(
    /** @param {Option[]} update */
    (update) => {
      let hasNewOptions = false;
      for (const item of update) {
        if (!cachedOptions.current[item.value]) {
          hasNewOptions = true;
        }
        cachedOptions.current[item.value] = item;
      }
      if (hasNewOptions) {
        setCacheVersion((v) => v + 1);
      }
    },
    []
  );
  const resolvedOptionsLookup = useMemo(() => {
    if (Array.isArray(allowedOptions)) {
      return allowedOptions.reduce(
        (acc, o) => {
          acc[o.value] = o;
          return acc;
        },
        /** @type {{ [value: string]: Option }} */
        {}
      );
    }
    return { ...cachedOptions.current };
  }, [allowedOptionsAsKey, cacheVersion]);
  const unresolvedValues = useMemo(
    () => selectedValues.filter((v) => !resolvedOptionsLookup[v]),
    [selectedValues, resolvedOptionsLookup]
  );
  const unresolvedValuesAsKey = useDeepMemo(unresolvedValues);
  useEffect(() => {
    if (typeof allowedOptions !== "function") return;
    if (unresolvedValues.length === 0) return;
    const abortController = new AbortController();
    allowedOptions(
      unresolvedValues,
      unresolvedValues.length,
      selectedValues,
      abortController.signal
    ).then((results) => {
      if (abortController.signal.aborted) return;
      if (results?.length) {
        updateCachedOptions(results);
      }
      const stillUnresolved = unresolvedValues.filter(
        (v) => !results?.find((r) => r.value === v)
      );
      if (stillUnresolved.length > 0) {
        updateCachedOptions(stillUnresolved.map((v) => ({ label: v, value: v })));
      }
    }).catch((error) => {
      if (abortController.signal.aborted) return;
      console.error("Failed to resolve option labels:", error);
      updateCachedOptions(unresolvedValues.map((v) => ({ label: v, value: v })));
    });
    return () => abortController.abort();
  }, [unresolvedValuesAsKey, allowedOptions, selectedValuesAsKey, updateCachedOptions]);
  useEffect(() => {
    abortControllerRef.current?.abort();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (!isOpen) {
      setFilteredOptions([]);
      setIsLoading(false);
      return;
    }
    if (typeof allowedOptions === "function") {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      let debounceTime = 0;
      if (searchTextTrimmed && !isPlaywright) {
        debounceTime = 250;
      }
      setIsLoading(true);
      const fetchOptions = async () => {
        try {
          const results = await allowedOptions(
            searchTextTrimmed,
            maxNumberOfPresentedOptions,
            selectedValues,
            abortController.signal
          );
          if (abortController.signal.aborted) return;
          if (results?.length) {
            updateCachedOptions(results);
          }
          let updatedOptions = results || [];
          if (!searchTextTrimmed) {
            const unreturnedSelectedValues = selectedValues.filter((v) => !results?.find((r) => r.value === v)).filter((v) => !cachedOptions.current[v]).map((v) => ({ label: v, value: v }));
            if (unreturnedSelectedValues.length > 0) {
              updateCachedOptions(unreturnedSelectedValues);
              updatedOptions = unreturnedSelectedValues.concat(results || []);
            }
          }
          const options2 = searchTextTrimmed ? updatedOptions : sortValuesToTop(updatedOptions, selectedValues);
          setFilteredOptions(getMatchScore(searchTextTrimmed, options2, language, false));
          setIsLoading(false);
        } catch (error) {
          if (abortController.signal.aborted) return;
          setIsLoading(false);
          throw error;
        }
      };
      if (debounceTime > 0) {
        debounceTimerRef.current = setTimeout(fetchOptions, debounceTime);
      } else {
        fetchOptions();
      }
      return () => {
        abortController.abort();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }
    const mergedOptions = selectedValues.filter((v) => !resolvedOptionsLookup[v]).map((v) => ({ label: v, value: v })).concat(allowedOptions);
    const options = searchText ? mergedOptions : sortValuesToTop(mergedOptions, selectedValues);
    setFilteredOptions(getMatchScore(searchText, options, language, true));
  }, [
    isOpen,
    searchTextTrimmed,
    searchText,
    language,
    selectedValuesAsKey,
    allowedOptionsAsKey,
    maxNumberOfPresentedOptions,
    updateCachedOptions,
    resolvedOptionsLookup,
    allowedOptions,
    selectedValues
  ]);
  return {
    filteredOptions,
    resolvedOptionsLookup,
    isLoading
  };
}

// lib/AutocompleteList.jsx
import { forwardRef } from "preact/compat";
import { useCallback as useCallback2, useEffect as useEffect2, useImperativeHandle, useRef as useRef2, useState as useState2 } from "preact/hooks";
import { Fragment, jsx as jsx2, jsxs } from "preact/jsx-runtime";
var AutocompleteList = forwardRef(
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
    const [activeDescendant, setActiveDescendant] = useState2("");
    const listRef = useRef2(
      /** @type {HTMLUListElement | null} */
      null
    );
    const searchTextTrimmed = searchText.trim();
    const addNewOptionVisible = !isLoading && allowFreeText && searchTextTrimmed && !arrayValues.includes(searchTextTrimmed) && !filteredOptions.find((o) => o.value === searchTextTrimmed);
    const scrollOptionIntoView = useCallback2(
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
    useEffect2(() => {
      if (!isOpen) {
        setActiveDescendant("");
      }
    }, [isOpen]);
    useEffect2(() => {
      onActiveDescendantChange?.(activeDescendant);
    }, [activeDescendant, onActiveDescendantChange]);
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
            filteredOptions.length === 0 && !isLoading && (!allowFreeText || !searchText || arrayValues.includes(searchText)) && /* @__PURE__ */ jsx2("li", { className: "PreactCombobox-option", children: translations.noOptionsFound })
          ] })
        }
      )
    );
  }
);
var AutocompleteList_default = AutocompleteList;

// lib/TraySearchList.jsx
import { useCallback as useCallback3, useEffect as useEffect3, useRef as useRef3, useState as useState3 } from "preact/hooks";
import { jsx as jsx3, jsxs as jsxs2 } from "preact/jsx-runtime";
var TraySearchList = ({
  id,
  isOpen,
  onClose,
  trayLabel,
  theme,
  translations,
  onInputChange,
  children
}) => {
  const [trayInputValue, setTrayInputValue] = useState3("");
  const [virtualKeyboardHeight, setVirtualKeyboardHeight] = useState3(0);
  const trayInputRef = useRef3(
    /** @type {HTMLInputElement | null} */
    null
  );
  const trayModalRef = useRef3(
    /** @type {HTMLDivElement | null} */
    null
  );
  const originalOverflowRef = useRef3("");
  const virtualKeyboardHeightAdjustSubscription = useRef3(
    /** @type {function | null} */
    null
  );
  const handleTrayInputChange = useCallback3(
    /**
     * @param {import('preact/compat').ChangeEvent<HTMLInputElement>} e
     */
    (e) => {
      const value = e.currentTarget.value;
      setTrayInputValue(value);
      onInputChange(value);
    },
    [onInputChange]
  );
  const handleClose = useCallback3(() => {
    setTrayInputValue("");
    setVirtualKeyboardHeight(0);
    virtualKeyboardHeightAdjustSubscription.current?.();
    virtualKeyboardHeightAdjustSubscription.current = null;
    const scrollingElement = (
      /** @type {HTMLElement} */
      document.scrollingElement || document.documentElement
    );
    scrollingElement.style.overflow = originalOverflowRef.current;
    onClose();
  }, [onClose]);
  useEffect3(() => {
    if (isOpen) {
      const scrollingElement = (
        /** @type {HTMLElement} */
        document.scrollingElement || document.documentElement
      );
      originalOverflowRef.current = scrollingElement.style.overflow;
      scrollingElement.style.overflow = "hidden";
      if (!virtualKeyboardHeightAdjustSubscription.current) {
        virtualKeyboardHeightAdjustSubscription.current = subscribeToVirtualKeyboard({
          heightCallback(keyboardHeight, isVisible) {
            setVirtualKeyboardHeight(isVisible ? keyboardHeight : 0);
          }
        });
      }
      trayInputRef.current?.focus();
    }
  }, [isOpen]);
  useEffect3(() => {
    return () => {
      if (virtualKeyboardHeightAdjustSubscription.current) {
        virtualKeyboardHeightAdjustSubscription.current();
        virtualKeyboardHeightAdjustSubscription.current = null;
      }
    };
  }, []);
  if (!isOpen) {
    return null;
  }
  return (
    // I couldn't use native <dialog> element because trying to focus input right
    // after dialog.close() doesn't seem to work on Chrome (Android).
    /* @__PURE__ */ jsx3(
      "div",
      {
        ref: trayModalRef,
        className: `PreactCombobox-modal ${`PreactCombobox--${theme}`}`,
        style: { display: isOpen ? null : "none" },
        onClick: (e) => {
          if (e.target === trayModalRef.current) {
            handleClose();
          }
        },
        onKeyDown: (e) => {
          if (e.key === "Escape") {
            handleClose();
          }
        },
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": trayLabel ? `${id}-tray-label` : void 0,
        tabIndex: -1,
        children: /* @__PURE__ */ jsxs2("div", { className: `PreactCombobox-tray ${`PreactCombobox--${theme}`}`, children: [
          /* @__PURE__ */ jsxs2("div", { className: "PreactCombobox-trayHeader", children: [
            trayLabel && /* @__PURE__ */ jsx3(
              "label",
              {
                id: `${id}-tray-label`,
                className: "PreactCombobox-trayLabel",
                htmlFor: `${id}-tray-input`,
                children: trayLabel
              }
            ),
            /* @__PURE__ */ jsx3(
              "input",
              {
                id: `${id}-tray-input`,
                ref: trayInputRef,
                type: "text",
                value: trayInputValue,
                placeholder: translations.searchPlaceholder,
                onChange: handleTrayInputChange,
                onKeyDown: (e) => {
                  if (e.key === "Escape") {
                    handleClose();
                  }
                },
                className: `PreactCombobox-trayInput ${!trayLabel ? "PreactCombobox-trayInput--noLabel" : ""}`,
                role: "combobox",
                "aria-expanded": "true",
                "aria-haspopup": "listbox",
                "aria-controls": `${id}-options-listbox`,
                "aria-label": trayLabel || translations.searchPlaceholder,
                autoComplete: "off"
              }
            )
          ] }),
          children,
          virtualKeyboardHeight > 0 && /* @__PURE__ */ jsx3(
            "div",
            {
              className: "PreactCombobox-virtualKeyboardSpacer",
              style: { height: `${virtualKeyboardHeight}px` },
              "aria-hidden": "true"
            }
          )
        ] })
      }
    )
  );
};
var TraySearchList_default = TraySearchList;

// lib/PreactCombobox.jsx
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs3 } from "preact/jsx-runtime";
var defaultEnglishTranslations = {
  searchPlaceholder: "Search...",
  noOptionsFound: "No options found",
  loadingOptions: "Loading...",
  loadingOptionsAnnouncement: "Loading options, please wait...",
  optionsLoadedAnnouncement: "Options loaded.",
  noOptionsFoundAnnouncement: "No options found.",
  addOption: 'Add "{value}"',
  typeToLoadMore: "...type to load more options",
  clearValue: "Clear value",
  selectedOption: "Selected option.",
  invalidOption: "Invalid option.",
  invalidValues: "Invalid values:",
  fieldContainsInvalidValues: "Field contains invalid values",
  noOptionsSelected: "No options selected",
  selectionAdded: "added selection",
  selectionRemoved: "removed selection",
  selectionsCurrent: "currently selected",
  selectionsMore: "and {count} more option",
  selectionsMorePlural: "and {count} more options",
  // Function to format the count in badge, receives count and language as parameters
  selectedCountFormatter: (count, lang) => new Intl.NumberFormat(lang).format(count)
};
var isPlaywright2 = navigator.webdriver === true;
var isServerDefault = typeof self === "undefined";
function unique(arr) {
  return Array.from(new Set(arr));
}
var Portal = ({ parent = document.body, children, rootElementRef }) => {
  const [dir, setDir] = useState4(
    /** @type {string|null} */
    null
  );
  useEffect4(() => {
    if (rootElementRef?.current) {
      const rootDir = window.getComputedStyle(rootElementRef.current).direction;
      const parentDir = window.getComputedStyle(parent).direction;
      if (rootDir !== parentDir) {
        setDir(rootDir);
      } else {
        setDir(null);
      }
    }
  }, [rootElementRef, parent]);
  const wrappedChildren = dir ? /* @__PURE__ */ jsx4("div", { dir: (
    /** @type {"auto" | "rtl" | "ltr"} */
    dir
  ), style: { direction: dir }, children }) : children;
  return createPortal(wrappedChildren, parent);
};
var dropdownPopperModifiers = [
  {
    name: "flip",
    enabled: true
  },
  {
    // make the popper width same as root element
    name: "referenceElementWidth",
    enabled: true,
    phase: "beforeWrite",
    requires: ["computeStyles"],
    // @ts-ignore
    fn: ({ state }) => {
      state.styles.popper.minWidth = `${state.rects.reference.width}px`;
    },
    // @ts-ignore
    effect: ({ state }) => {
      state.elements.popper.style.minWidth = `${state.elements.reference.offsetWidth}px`;
    }
  },
  {
    name: "eventListeners",
    enabled: true,
    options: {
      scroll: true,
      resize: true
    }
  }
];
var tooltipPopperModifiers = [
  {
    name: "offset",
    options: {
      offset: [0, 2]
    }
  },
  {
    name: "eventListeners",
    enabled: true,
    options: {
      scroll: true,
      resize: true
    }
  }
];
var defaultWarningIcon = /* @__PURE__ */ jsx4(
  "svg",
  {
    className: "PreactCombobox-warningIcon",
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx4("path", { d: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" })
  }
);
var defaultTickIcon = /* @__PURE__ */ jsx4(
  "svg",
  {
    className: "PreactCombobox-tickIcon",
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx4("path", { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z", fill: "currentColor" })
  }
);
var defaultChevronIcon = /* @__PURE__ */ jsx4(
  "svg",
  {
    className: "PreactCombobox-chevron",
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx4("path", { d: "M7 10l5 5 5-5z" })
  }
);
var defaultLoadingRenderer = (loadingText) => loadingText;
function defaultOptionRenderer({
  option,
  isSelected,
  isInvalid,
  showValue,
  warningIcon,
  tickIcon,
  optionIconRenderer
}) {
  const isLabelSameAsValue = option.value === option.label;
  const getLabel = (labelNodes, valueNodes) => /* @__PURE__ */ jsxs3(Fragment2, { children: [
    optionIconRenderer?.(option, false),
    /* @__PURE__ */ jsxs3("span", { className: "PreactCombobox-optionLabelFlex", children: [
      /* @__PURE__ */ jsx4("span", { children: labelNodes }),
      isLabelSameAsValue || !showValue ? null : /* @__PURE__ */ jsxs3("span", { className: "PreactCombobox-optionValue", "aria-hidden": "true", children: [
        "(",
        valueNodes,
        ")"
      ] })
    ] })
  ] });
  const { label, value, matched, matchSlices } = option;
  let labelElement;
  if (matched === "label" || matched === "value" && value === label) {
    const labelNodes = matchSlicesToNodes(matchSlices, label);
    labelElement = getLabel(labelNodes, [value]);
  } else if (matched === "value") {
    const valueNodes = matchSlicesToNodes(matchSlices, value);
    labelElement = getLabel([label], valueNodes);
  } else {
    labelElement = getLabel([label], [value]);
  }
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsx4(
      "span",
      {
        className: `PreactCombobox-optionCheckbox ${isSelected ? "PreactCombobox-optionCheckbox--selected" : ""}`,
        children: isSelected && tickIcon
      }
    ),
    labelElement,
    isInvalid && warningIcon
  ] });
}
function defaultOptionIconRenderer(option) {
  return option.icon ? /* @__PURE__ */ jsx4("span", { className: "PreactCombobox-optionIcon", "aria-hidden": "true", role: "img", children: option.icon }) : null;
}
var defaultArrayValue = [];
function formatSelectionAnnouncement(selectedValues, diff, optionsLookup, language, translations) {
  if (!selectedValues || selectedValues.length === 0) {
    return translations.noOptionsSelected;
  }
  const labels = selectedValues.map((value) => optionsLookup[value]?.label || value);
  const prefix = diff ? diff === "added" ? translations.selectionAdded : translations.selectionRemoved : translations.selectionsCurrent;
  if (selectedValues.length <= 3) {
    return `${prefix} ${new Intl.ListFormat(language, { style: "long", type: "conjunction" }).format(labels)}`;
  }
  const firstThree = labels.slice(0, 3);
  const remaining = selectedValues.length - 3;
  const moreText = remaining === 1 ? translations.selectionsMore.replace("{count}", remaining.toString()) : translations.selectionsMorePlural.replace("{count}", remaining.toString());
  return `${prefix} ${firstThree.join(", ")} ${moreText}`;
}
var PreactCombobox = ({
  id: idProp,
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
  formSubmitCompatible = false,
  isServer = isServerDefault,
  selectElementProps,
  showValue = true,
  showClearButton = true,
  optionRenderer = defaultOptionRenderer,
  optionIconRenderer = defaultOptionIconRenderer,
  warningIcon = defaultWarningIcon,
  tickIcon = defaultTickIcon,
  chevronIcon = defaultChevronIcon,
  loadingRenderer = defaultLoadingRenderer,
  theme = "system",
  tray = "auto",
  trayBreakpoint = "768px",
  trayLabel: trayLabelProp,
  translations = defaultEnglishTranslations,
  // private option for now
  maxNumberOfPresentedOptions = 100
}) => {
  const mergedTranslations = useDeepMemo(
    translations === defaultEnglishTranslations ? translations : { ...defaultEnglishTranslations, ...translations }
  );
  const values = multiple ? (
    /** @type {string[]} */
    value
  ) : null;
  const singleSelectValue = multiple ? null : (
    /** @type {string} */
    value
  );
  let tempArrayValue;
  if (Array.isArray(value)) {
    tempArrayValue = /** @type {string[]} */
    value;
  } else {
    tempArrayValue = value ? [
      /** @type {string} */
      value
    ] : [];
  }
  const arrayValues = useDeepMemo(tempArrayValue);
  const arrayValuesLookup = useMemo2(() => new Set(arrayValues), [arrayValues]);
  const allowedOptionsAsKey = useDeepMemo(
    typeof allowedOptions === "function" ? null : allowedOptions
  );
  const autoId = useId();
  const id = idProp || autoId;
  const [inputValue, setInputValue] = useState4("");
  const [getIsDropdownOpen, setIsDropdownOpen, hasDropdownOpenChanged] = useLive(false);
  const [getIsFocused, setIsFocused] = useLive(false);
  const [lastSelectionAnnouncement, setLastSelectionAnnouncement] = useState4("");
  const [loadingAnnouncement, setLoadingAnnouncement] = useState4("");
  const autocompleteListRef = useRef4(
    /** @type {import("./AutocompleteList.jsx").AutocompleteListRef | null} */
    null
  );
  const [activeDescendantValue, setActiveDescendantValue] = useState4("");
  const [warningIconHovered, setWarningIconHovered] = useState4(false);
  const inputRef = useRef4(
    /** @type {HTMLInputElement | null} */
    null
  );
  const blurTimeoutRef = useRef4(
    /** @type {number | undefined} */
    void 0
  );
  const rootElementRef = useRef4(
    /** @type {HTMLDivElement | null} */
    null
  );
  const dropdownPopperRef = useRef4(
    /** @type {HTMLUListElement | null} */
    null
  );
  const dropdownClosedExplicitlyRef = useRef4(false);
  const warningIconRef = useRef4(null);
  const tooltipPopperRef = useRef4(null);
  const undoStack = useRef4(
    /** @type {string[][]} */
    []
  );
  const redoStack = useRef4(
    /** @type {string[][]} */
    []
  );
  const [getTrayLabel, setTrayLabel] = useLive(trayLabelProp);
  const [getIsTrayOpen, setIsTrayOpen, hasTrayOpenChanged] = useLive(false);
  const trayClosedExplicitlyRef = useRef4(false);
  const [isMobileScreen, setIsMobileScreen] = useState4(false);
  const [trayActiveInputValue, setTrayActiveInputValue] = useState4("");
  useEffect4(() => {
    if (tray === "auto") {
      const mediaQuery = window.matchMedia(`(max-width: ${trayBreakpoint})`);
      setIsMobileScreen(mediaQuery.matches);
      const handleChange = (e) => setIsMobileScreen(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [tray, trayBreakpoint]);
  const shouldUseTray = tray === true || tray === "auto" && isMobileScreen;
  const activeInputValue = getIsTrayOpen() ? trayActiveInputValue : inputValue;
  const inputTrimmed = activeInputValue.trim();
  const computeEffectiveTrayLabel = useCallback4(() => {
    if (trayLabelProp) return trayLabelProp;
    if (typeof self === "undefined" || isServer || !inputRef.current) return "";
    const inputElement = inputRef.current;
    const inputId = inputElement.id;
    const ariaLabelledBy = inputElement.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) {
        return labelElement.textContent?.trim() || "";
      }
    }
    const ariaLabel = inputElement.getAttribute("aria-label");
    if (ariaLabel) {
      return ariaLabel.trim();
    }
    if (inputId) {
      const labelElement = document.querySelector(`label[for="${inputId}"]`);
      if (labelElement) {
        return labelElement.textContent?.trim() || "";
      }
    }
    const wrappingLabel = inputElement.closest("label");
    if (wrappingLabel) {
      return wrappingLabel.textContent?.trim() || "";
    }
    const title = inputElement.getAttribute("title");
    if (title) {
      return title.trim();
    }
    return "";
  }, [trayLabelProp, isServer]);
  useLayoutEffect(() => {
    setTrayLabel(computeEffectiveTrayLabel());
  }, [setTrayLabel, computeEffectiveTrayLabel]);
  const isListOpen = shouldUseTray ? getIsTrayOpen() : getIsDropdownOpen();
  const { filteredOptions, resolvedOptionsLookup, isLoading } = useAsyncOptions({
    allowedOptions,
    selectedValues: arrayValues,
    searchText: activeInputValue,
    isOpen: isListOpen,
    language,
    maxNumberOfPresentedOptions
  });
  const allOptionsLookup = resolvedOptionsLookup;
  const invalidValues = useMemo2(() => {
    if (allowFreeText) return [];
    return arrayValues?.filter((v) => !resolvedOptionsLookup[v]) || [];
  }, [allowFreeText, arrayValues, resolvedOptionsLookup]);
  const updateSelectionAnnouncement = useCallback4(
    /**
     * @param {string[]} selectedValues
     * @param {"added"|"removed"|null} [diff]
     */
    (selectedValues, diff) => {
      const announcement = formatSelectionAnnouncement(
        selectedValues,
        diff,
        allOptionsLookup,
        language,
        mergedTranslations
      );
      setLastSelectionAnnouncement(announcement);
    },
    [allOptionsLookup, mergedTranslations, language]
  );
  const handleActiveDescendantChange = useCallback4(
    /** @param {string} value */
    (value2) => {
      setActiveDescendantValue(value2);
    },
    []
  );
  const closeDropdown = useCallback4(
    (closedExplicitly = false) => {
      setIsDropdownOpen(false);
      if (dropdownPopperRef.current) {
        dropdownPopperRef.current.style.display = "none";
      }
      if (closedExplicitly) {
        dropdownClosedExplicitlyRef.current = true;
      }
      updateSelectionAnnouncement(arrayValues);
      autocompleteListRef.current?.clearActiveDescendant();
    },
    [setIsDropdownOpen, updateSelectionAnnouncement, arrayValues]
  );
  useEffect4(() => {
    if (getIsDropdownOpen() && !shouldUseTray && rootElementRef.current && dropdownPopperRef.current) {
      const computedDir = window.getComputedStyle(rootElementRef.current).direction;
      const placement = computedDir === "rtl" ? "bottom-end" : "bottom-start";
      const popperInstance = createPopper(rootElementRef.current, dropdownPopperRef.current, {
        placement,
        // @ts-ignore
        modifiers: dropdownPopperModifiers
      });
      dropdownPopperRef.current.style.display = "block";
      return () => {
        popperInstance.destroy();
      };
    }
    if (shouldUseTray && dropdownPopperRef.current) {
      dropdownPopperRef.current.style.display = "none";
    }
  }, [getIsDropdownOpen, shouldUseTray]);
  useEffect4(() => {
    if (invalidValues.length > 0 && warningIconHovered && warningIconRef.current && tooltipPopperRef.current && rootElementRef.current) {
      const computedDir = window.getComputedStyle(rootElementRef.current).direction;
      const placement = computedDir === "rtl" ? "bottom-end" : "bottom-start";
      const popperInstance = createPopper(warningIconRef.current, tooltipPopperRef.current, {
        placement,
        // @ts-ignore
        modifiers: tooltipPopperModifiers
      });
      tooltipPopperRef.current.style.display = "block";
      return () => {
        popperInstance.destroy();
      };
    }
  }, [warningIconHovered, invalidValues.length]);
  const handleOptionSelect = useCallback4(
    /**
     * @param {string} selectedValue
     * @param {{ toggleSelected?: boolean }} [options]
     */
    (selectedValue, { toggleSelected = false } = {}) => {
      const option = allOptionsLookup[selectedValue];
      if (option?.disabled) {
        return;
      }
      if (values) {
        const isExistingOption = values.includes(selectedValue);
        let newValues;
        if (!isExistingOption || toggleSelected && isExistingOption) {
          if (toggleSelected && isExistingOption) {
            newValues = values.filter((v) => v !== selectedValue);
          } else {
            newValues = [...values, selectedValue];
          }
          onChange(newValues);
          updateSelectionAnnouncement(
            [selectedValue],
            newValues.length < values.length ? "removed" : "added"
          );
          undoStack.current.push(values);
          redoStack.current = [];
        }
      } else {
        if (singleSelectValue !== selectedValue || toggleSelected && singleSelectValue === selectedValue) {
          let newValue;
          if (toggleSelected && singleSelectValue === selectedValue) {
            newValue = "";
          } else {
            newValue = selectedValue;
          }
          onChange(newValue);
          updateSelectionAnnouncement([selectedValue], newValue ? "removed" : "added");
          undoStack.current.push([newValue]);
          redoStack.current = [];
          closeDropdown();
        }
        setInputValue("");
      }
    },
    [
      onChange,
      singleSelectValue,
      values,
      updateSelectionAnnouncement,
      closeDropdown,
      allOptionsLookup
    ]
  );
  const focusInput = useCallback4(
    (forceOpenKeyboard = false) => {
      const input = inputRef.current;
      if (input) {
        const shouldTemporarilyDisableInput = getIsFocused() && virtualKeyboardExplicitlyClosedRef.current === true && !forceOpenKeyboard;
        if (shouldTemporarilyDisableInput) {
          input.setAttribute("readonly", "readonly");
        }
        input.focus();
        if (shouldTemporarilyDisableInput) {
          setTimeout(() => {
            input.removeAttribute("readonly");
          }, 10);
        }
      }
    },
    [getIsFocused]
  );
  const openTray = useCallback4(() => {
    if (!shouldUseTray) return;
    setIsTrayOpen(true);
    setIsDropdownOpen(false);
    trayClosedExplicitlyRef.current = false;
  }, [shouldUseTray, setIsDropdownOpen, setIsTrayOpen]);
  const closeTray = useCallback4(() => {
    setIsTrayOpen(false);
    setTrayActiveInputValue("");
    trayClosedExplicitlyRef.current = true;
    focusInput(true);
  }, [setIsTrayOpen, focusInput]);
  const handleInputChange = useCallback4(
    /**
     * Handle input change
     * @param {import('preact/compat').ChangeEvent<HTMLInputElement>} e - Input change event
     */
    (e) => {
      if (shouldUseTray) {
        e.preventDefault();
        openTray();
        return;
      }
      setInputValue(e.currentTarget.value);
      if (!dropdownClosedExplicitlyRef.current) {
        setIsDropdownOpen(true);
      }
    },
    [setIsDropdownOpen, shouldUseTray, openTray]
  );
  const handleTrayInputChange = useCallback4(
    /**
     * Handle tray input change
     * @param {string} value - Input value
     */
    (value2) => {
      setTrayActiveInputValue(value2);
    },
    []
  );
  const virtualKeyboardExplicitlyClosedRef = useRef4(null);
  const virtualKeyboardDismissSubscription = useRef4(
    /** @type {function | null} */
    null
  );
  const virtualKeyboardHeightAdjustSubscription = useRef4(
    /** @type {function | null} */
    null
  );
  const handleInputFocus = useCallback4(() => {
    setIsFocused(true);
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = void 0;
    if (shouldUseTray) {
      if (!trayClosedExplicitlyRef.current) {
        openTray();
      }
      trayClosedExplicitlyRef.current = false;
    } else {
      setIsDropdownOpen(true);
      dropdownClosedExplicitlyRef.current = false;
      if (!virtualKeyboardDismissSubscription.current) {
        virtualKeyboardDismissSubscription.current = subscribeToVirtualKeyboard({
          visibleCallback(isVisible) {
            virtualKeyboardExplicitlyClosedRef.current = !isVisible;
          }
        });
      }
    }
    updateSelectionAnnouncement(arrayValues);
  }, [
    setIsFocused,
    setIsDropdownOpen,
    openTray,
    arrayValues,
    updateSelectionAnnouncement,
    shouldUseTray
  ]);
  const handleInputBlur = useCallback4(() => {
    setIsFocused(false);
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = void 0;
    closeDropdown();
    dropdownClosedExplicitlyRef.current = false;
    if (!multiple) {
      if (inputTrimmed && (allowFreeText || allOptionsLookup[inputTrimmed])) {
        handleOptionSelect(inputTrimmed);
      }
    }
    setInputValue("");
    setLastSelectionAnnouncement("");
    if (!shouldUseTray) {
      virtualKeyboardDismissSubscription.current?.();
      virtualKeyboardDismissSubscription.current = null;
      virtualKeyboardExplicitlyClosedRef.current = null;
    }
  }, [
    setIsFocused,
    allOptionsLookup,
    allowFreeText,
    handleOptionSelect,
    multiple,
    inputTrimmed,
    closeDropdown,
    shouldUseTray
  ]);
  const handleAddNewOption = useCallback4(
    /**
     * @param {string} newValue
     */
    (newValue) => {
      handleOptionSelect(newValue);
      autocompleteListRef.current?.setActiveDescendant(newValue);
    },
    [handleOptionSelect]
  );
  const handleKeyDown = useCallback4(
    /**
     * @param {import('preact/compat').KeyboardEvent<HTMLInputElement>} e - Keyboard event
     */
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const selected = autocompleteListRef.current?.selectActive();
        if (!selected && allowFreeText && inputTrimmed !== "") {
          handleAddNewOption(inputTrimmed);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
        autocompleteListRef.current?.navigateDown();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
        autocompleteListRef.current?.navigateUp();
      } else if (e.key === "Escape") {
        closeDropdown(true);
      } else if (e.key === "Home" && e.ctrlKey && getIsDropdownOpen()) {
        e.preventDefault();
        autocompleteListRef.current?.navigateToFirst();
      } else if (e.key === "End" && e.ctrlKey && getIsDropdownOpen()) {
        e.preventDefault();
        autocompleteListRef.current?.navigateToLast();
      } else if (inputValue === "" && (e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        const prevValues = undoStack.current.pop();
        if (prevValues) {
          onChange(prevValues);
          updateSelectionAnnouncement(prevValues);
          redoStack.current.push(Array.isArray(value) ? value : [value]);
        }
      } else if (inputValue === "" && (e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        const nextValues = redoStack.current.pop();
        if (nextValues) {
          onChange(nextValues);
          updateSelectionAnnouncement(nextValues);
          undoStack.current.push(Array.isArray(value) ? value : [value]);
        }
      }
    },
    [
      allowFreeText,
      handleAddNewOption,
      inputValue,
      inputTrimmed,
      onChange,
      getIsDropdownOpen,
      setIsDropdownOpen,
      value,
      closeDropdown,
      updateSelectionAnnouncement
    ]
  );
  const handlePaste = useCallback4(
    /**
     * @param {import('preact/compat').ClipboardEvent<HTMLInputElement>} e - Clipboard event
     */
    (e) => {
      if (!values) return;
      const allOptions = Object.values(allOptionsLookup);
      const valuesLookup = {
        ...Object.fromEntries(values.map((v) => [v, v])),
        ...Object.fromEntries(allOptions.map((o) => [o.value, o.value]))
      };
      const valuesLowerCaseLookup = {
        ...Object.fromEntries(values.map((v) => [v.toLowerCase(), v])),
        ...Object.fromEntries(allOptions.map((o) => [o.value.toLowerCase(), o.value]))
      };
      const optionsLabelLookup = Object.fromEntries(
        allOptions.map((o) => [o.label.toLowerCase(), o.value])
      );
      const pastedText = e.clipboardData?.getData("text") || "";
      if (!pastedText) return;
      const pastedOptions = pastedText.split(",").map((x) => x.trim()).filter((x) => x !== "").map(
        (x) => valuesLookup[x] || valuesLowerCaseLookup[x.toLowerCase()] || optionsLabelLookup[x.toLocaleLowerCase()] || x
      );
      const newValues = unique([...values, ...pastedOptions]);
      onChange(newValues);
      updateSelectionAnnouncement(newValues, "added");
      undoStack.current.push(values);
      redoStack.current = [];
    },
    [allOptionsLookup, onChange, values, updateSelectionAnnouncement]
  );
  const handleClearValue = useCallback4(() => {
    setInputValue("");
    onChange(multiple ? [] : "");
    updateSelectionAnnouncement(arrayValues, "removed");
    undoStack.current.push(arrayValues);
    redoStack.current = [];
    if (getIsFocused()) {
      focusInput();
    }
  }, [onChange, multiple, arrayValues, updateSelectionAnnouncement, getIsFocused, focusInput]);
  const handleRootElementClick = useCallback4(() => {
    if (!disabled) {
      if (shouldUseTray) {
        openTray();
      } else {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          focusInput(true);
        }
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
      }
    }
  }, [disabled, shouldUseTray, openTray, focusInput, setIsDropdownOpen]);
  const selectChildren = useMemo2(
    () => formSubmitCompatible ? arrayValues.map((val) => /* @__PURE__ */ jsx4("option", { value: val, disabled: allOptionsLookup[val]?.disabled, children: allOptionsLookup[val]?.label || val }, val)).concat(
      typeof allowedOptions !== "function" ? allowedOptions.filter((o) => !arrayValuesLookup.has(o.value)).slice(0, maxNumberOfPresentedOptions - arrayValues.length).map((o) => /* @__PURE__ */ jsx4("option", { value: o.value, disabled: o.disabled, children: o.label }, o.value)) : []
    ) : null,
    [
      arrayValues,
      allOptionsLookup,
      formSubmitCompatible,
      allowedOptions,
      arrayValuesLookup,
      maxNumberOfPresentedOptions
    ]
  );
  const isServerSideForm = isServer && formSubmitCompatible;
  const setDropdownRef = useCallback4(
    /** @param {HTMLUListElement | null} el */
    (el) => {
      dropdownPopperRef.current = el;
    },
    []
  );
  const autocompleteList = !isServer ? /* @__PURE__ */ jsx4(
    AutocompleteList_default,
    {
      ref: autocompleteListRef,
      id,
      searchText: activeInputValue,
      filteredOptions,
      isLoading,
      arrayValues,
      invalidValues,
      multiple,
      allowFreeText,
      onOptionSelect: handleOptionSelect,
      onActiveDescendantChange: handleActiveDescendantChange,
      onClose: shouldUseTray ? closeTray : closeDropdown,
      optionRenderer,
      warningIcon,
      tickIcon,
      optionIconRenderer,
      showValue,
      language,
      loadingRenderer,
      translations: mergedTranslations,
      theme,
      isOpen: isListOpen,
      shouldUseTray,
      setDropdownRef
    }
  ) : null;
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      className: [
        className,
        "PreactCombobox",
        disabled ? "PreactCombobox--disabled" : "",
        `PreactCombobox--${theme}`,
        tray === "auto" ? "PreactCombobox--trayAuto" : ""
      ].filter(Boolean).join(" "),
      "aria-disabled": disabled,
      onClick: handleRootElementClick,
      id: `${id}-root`,
      ref: rootElementRef,
      ...rootElementProps,
      children: [
        /* @__PURE__ */ jsx4("div", { className: "PreactCombobox-srOnly", "aria-live": "polite", "aria-atomic": "true", children: getIsFocused() ? lastSelectionAnnouncement : "" }),
        /* @__PURE__ */ jsx4("div", { className: "PreactCombobox-srOnly", "aria-live": "polite", "aria-atomic": "true", children: getIsFocused() ? loadingAnnouncement : "" }),
        /* @__PURE__ */ jsx4("div", { className: "PreactCombobox-srOnly", "aria-live": "polite", "aria-atomic": "true", children: invalidValues.length > 0 && getIsFocused() ? mergedTranslations.fieldContainsInvalidValues : "" }),
        /* @__PURE__ */ jsxs3("div", { className: `PreactCombobox-field ${disabled ? "PreactCombobox-field--disabled" : ""}`, children: [
          !isServerSideForm && /* @__PURE__ */ jsxs3(Fragment2, { children: [
            !multiple && singleSelectValue && allOptionsLookup[singleSelectValue] && optionIconRenderer?.(allOptionsLookup[singleSelectValue], true),
            /* @__PURE__ */ jsx4(
              "input",
              {
                id,
                ref: inputRef,
                type: "text",
                value: inputValue,
                placeholder: !shouldUseTray && getIsDropdownOpen() ? mergedTranslations.searchPlaceholder : arrayValues.length > 0 ? arrayValues.map((value2) => allOptionsLookup[value2]?.label || value2).join(", ") : placeholder,
                onChange: handleInputChange,
                onKeyDown: handleKeyDown,
                onFocus: handleInputFocus,
                onBlur: () => {
                  blurTimeoutRef.current = setTimeout(handleInputBlur, 200);
                },
                onPaste: handlePaste,
                className: `PreactCombobox-input ${multiple ? "PreactCombobox-input--multiple" : ""} ${disabled ? "PreactCombobox-input--disabled" : ""}`,
                role: "combobox",
                "aria-expanded": getIsDropdownOpen(),
                "aria-haspopup": "listbox",
                "aria-controls": `${id}-options-listbox`,
                "aria-activedescendant": activeDescendantValue ? `${id}-option-${toHTMLId(activeDescendantValue)}` : void 0,
                disabled,
                required: required && arrayValues.length === 0,
                ...inputProps
              }
            ),
            !disabled && showClearButton && arrayValues.length > 0 ? /* @__PURE__ */ jsx4(
              "button",
              {
                type: "button",
                className: "PreactCombobox-clearButton",
                "aria-label": mergedTranslations.clearValue,
                onClick: handleClearValue,
                children: /* @__PURE__ */ jsx4("span", { "aria-hidden": "true", children: "\u2715" })
              }
            ) : null,
            invalidValues.length > 0 && /* @__PURE__ */ jsx4(
              "span",
              {
                ref: warningIconRef,
                className: "PreactCombobox-warningIconWrapper",
                onMouseEnter: () => setWarningIconHovered(true),
                onMouseLeave: () => setWarningIconHovered(false),
                children: warningIcon
              }
            ),
            multiple && arrayValues.length > 1 && /* @__PURE__ */ jsx4("span", { className: "PreactCombobox-badge", children: mergedTranslations.selectedCountFormatter(arrayValues.length, language) }),
            chevronIcon
          ] }),
          formSubmitCompatible ? /* @__PURE__ */ jsx4(
            "select",
            {
              ...selectElementProps,
              multiple,
              hidden: !isServerSideForm,
              tabIndex: isServerSideForm ? 0 : -1,
              readOnly: !isServerSideForm,
              value,
              name,
              size: 1,
              className: isServerSideForm ? "PreactCombobox-formSelect" : "",
              children: selectChildren
            }
          ) : null
        ] }),
        autocompleteList ? /* @__PURE__ */ jsx4(Portal, { parent: portal, rootElementRef, children: shouldUseTray ? /* @__PURE__ */ jsx4(
          TraySearchList_default,
          {
            id,
            isOpen: getIsTrayOpen(),
            onClose: closeTray,
            trayLabel: getTrayLabel() || "",
            theme,
            translations: mergedTranslations,
            onInputChange: handleTrayInputChange,
            children: autocompleteList
          }
        ) : autocompleteList }) : null,
        invalidValues.length > 0 && warningIconHovered && !isServer && /* @__PURE__ */ jsx4(Portal, { parent: portal, rootElementRef, children: /* @__PURE__ */ jsxs3(
          "div",
          {
            className: `PreactCombobox-valueTooltip ${`PreactCombobox--${theme}`}`,
            role: "tooltip",
            ref: tooltipPopperRef,
            children: [
              mergedTranslations.invalidValues,
              invalidValues.map((value2) => /* @__PURE__ */ jsx4("div", { className: "PreactCombobox-tooltipValue", children: value2 }, value2))
            ]
          }
        ) })
      ]
    }
  );
};
var PreactCombobox_default = PreactCombobox;
export {
  PreactCombobox_default as default,
  defaultOptionRenderer
};
//# sourceMappingURL=PreactCombobox.js.map
