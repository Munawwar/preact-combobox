// lib/PreactCombobox.jsx
import { createPopper } from "@popperjs/core";
import { createPortal } from "preact/compat";
import {
  useCallback as useCallback2,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo as useMemo2,
  useRef as useRef2,
  useState as useState2
} from "preact/hooks";

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
function useLive(initialValue) {
  const [refreshValue, forceRefresh] = useState(0);
  const ref = useRef(initialValue);
  let hasValueChanged = false;
  const getValue = useMemo(() => {
    hasValueChanged = true;
    return () => ref.current;
  }, [refreshValue]);
  const setValue = useCallback((value) => {
    if (value !== ref.current) {
      ref.current = value;
      forceRefresh((x) => x + 1);
    }
  }, []);
  return [getValue, setValue, hasValueChanged];
}

// lib/PreactCombobox.jsx
import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
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
var isPlaywright = navigator.webdriver === true;
var isServerDefault = typeof self === "undefined";
function unique(arr) {
  return Array.from(new Set(arr));
}
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
var Portal = ({ parent = document.body, children, rootElementRef }) => {
  const [dir, setDir] = useState2(
    /** @type {string|null} */
    null
  );
  useEffect(() => {
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
  const wrappedChildren = dir ? /* @__PURE__ */ jsx("div", { dir: (
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
var isTouchDevice = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)")?.matches;
var visualViewportInitialHeight = window.visualViewport?.height ?? 0;
var wasVisualViewportInitialHeightAnApproximate = true;
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
var languageCache = {};
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
var defaultWarningIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    className: "PreactCombobox-warningIcon",
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" })
  }
);
var defaultTickIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    className: "PreactCombobox-tickIcon",
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z", fill: "currentColor" })
  }
);
var defaultChevronIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    className: "PreactCombobox-chevron",
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M7 10l5 5 5-5z" })
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
  const getLabel = (labelNodes, valueNodes) => /* @__PURE__ */ jsxs(Fragment, { children: [
    optionIconRenderer?.(option, false),
    /* @__PURE__ */ jsxs("span", { className: "PreactCombobox-optionLabelFlex", children: [
      /* @__PURE__ */ jsx("span", { children: labelNodes }),
      isLabelSameAsValue || !showValue ? null : /* @__PURE__ */ jsxs("span", { className: "PreactCombobox-optionValue", "aria-hidden": "true", children: [
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
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
  return option.icon ? /* @__PURE__ */ jsx("span", { className: "PreactCombobox-optionIcon", "aria-hidden": "true", role: "img", children: option.icon }) : null;
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
  maxPresentedOptions = 100
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
  const [inputValue, setInputValue] = useState2("");
  const [getIsDropdownOpen, setIsDropdownOpen, hasDropdownOpenChanged] = useLive(false);
  const cachedOptions = useRef2(
    /** @type {{ [value: string]: Option }} */
    {}
  );
  const [filteredOptions, setFilteredOptions] = useState2(
    /** @type {OptionMatch[]} */
    []
  );
  const [isLoading, setIsLoading] = useState2(false);
  const [getIsFocused, setIsFocused] = useLive(false);
  const [lastSelectionAnnouncement, setLastSelectionAnnouncement] = useState2("");
  const [loadingAnnouncement, setLoadingAnnouncement] = useState2("");
  const activeDescendant = useRef2("");
  const [warningIconHovered, setWarningIconHovered] = useState2(false);
  const inputRef = useRef2(
    /** @type {HTMLInputElement | null} */
    null
  );
  const blurTimeoutRef = useRef2(
    /** @type {number | undefined} */
    void 0
  );
  const rootElementRef = useRef2(
    /** @type {HTMLDivElement | null} */
    null
  );
  const dropdownPopperRef = useRef2(
    /** @type {HTMLUListElement | null} */
    null
  );
  const dropdownClosedExplicitlyRef = useRef2(false);
  const warningIconRef = useRef2(null);
  const tooltipPopperRef = useRef2(null);
  const undoStack = useRef2(
    /** @type {string[][]} */
    []
  );
  const redoStack = useRef2(
    /** @type {string[][]} */
    []
  );
  const [getTrayLabel, setTrayLabel] = useLive(trayLabelProp);
  const [getIsTrayOpen, setIsTrayOpen, hasTrayOpenChanged] = useLive(false);
  const [trayInputValue, setTrayInputValue] = useState2("");
  const trayInputRef = useRef2(
    /** @type {HTMLInputElement | null} */
    null
  );
  const trayModalRef = useRef2(
    /** @type {HTMLDivElement | null} */
    null
  );
  const trayClosedExplicitlyRef = useRef2(false);
  const [isMobileScreen, setIsMobileScreen] = useState2(false);
  const originalOverflowRef = useRef2("");
  const [virtualKeyboardHeight, setVirtualKeyboardHeight] = useState2(0);
  useEffect(() => {
    if (tray === "auto") {
      const mediaQuery = window.matchMedia(`(max-width: ${trayBreakpoint})`);
      setIsMobileScreen(mediaQuery.matches);
      const handleChange = (e) => setIsMobileScreen(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [tray, trayBreakpoint]);
  const shouldUseTray = tray === true || tray === "auto" && isMobileScreen;
  const activeInputValue = getIsTrayOpen() ? trayInputValue : inputValue;
  const inputTrimmed = activeInputValue.trim();
  const computeEffectiveTrayLabel = useCallback2(() => {
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
  const invalidValues = useMemo2(() => {
    if (allowFreeText) return [];
    return arrayValues?.filter((v) => !allOptionsLookup[v]) || [];
  }, [allowFreeText, arrayValues, allOptionsLookup]);
  const updateSelectionAnnouncement = useCallback2(
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
  const activateDescendant = useCallback2(
    /**
     * @param {string} optionValue
     * @param {boolean} [scroll=true]
     */
    (optionValue, scroll = true) => {
      if (activeDescendant.current && dropdownPopperRef.current) {
        const el = dropdownPopperRef.current.querySelector(".PreactCombobox-option--active");
        el?.classList.remove("PreactCombobox-option--active");
        el?.querySelector('span[data-reader="selected"]')?.setAttribute("aria-hidden", "true");
        el?.querySelector('span[data-reader="invalid"]')?.setAttribute("aria-hidden", "true");
      }
      activeDescendant.current = optionValue;
      const elementId = optionValue ? `${id}-option-${toHTMLId(optionValue)}` : "";
      inputRef.current?.setAttribute("aria-activedescendant", elementId);
      if (elementId && dropdownPopperRef.current) {
        const activeDescendantElement = dropdownPopperRef.current.querySelector(`#${elementId}`);
        if (activeDescendantElement) {
          activeDescendantElement.classList.add("PreactCombobox-option--active");
          activeDescendantElement.querySelector('span[data-reader="selected"]')?.setAttribute("aria-hidden", "false");
          activeDescendantElement.querySelector('span[data-reader="invalid"]')?.setAttribute("aria-hidden", "false");
          if (scroll) {
            const dropdownRect = dropdownPopperRef.current.getBoundingClientRect();
            const itemRect = activeDescendantElement.getBoundingClientRect();
            if (itemRect.top < dropdownRect.top) {
              dropdownPopperRef.current.scrollTop += itemRect.top - dropdownRect.top;
            } else if (itemRect.bottom > dropdownRect.bottom) {
              dropdownPopperRef.current.scrollTop += itemRect.bottom - dropdownRect.bottom;
            }
          }
        }
      }
    },
    [id]
  );
  const closeDropdown = useCallback2(
    (closedExplicitly = false) => {
      setIsDropdownOpen(false);
      if (dropdownPopperRef.current) {
        dropdownPopperRef.current.style.display = "none";
      }
      if (closedExplicitly) {
        dropdownClosedExplicitlyRef.current = true;
      }
      updateSelectionAnnouncement(arrayValues);
      activateDescendant("");
    },
    [setIsDropdownOpen, activateDescendant, updateSelectionAnnouncement, arrayValues]
  );
  useEffect(() => {
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
  const abortControllerRef = useRef2(
    /** @type {AbortController | null} */
    null
  );
  const inputTypingDebounceTimer = useRef2(
    /** @type {any} */
    null
  );
  const newUnknownValues = arrayValues.filter((v) => !allOptionsLookup[v]);
  const newUnknownValuesAsKey = useDeepMemo(newUnknownValues);
  useEffect(() => {
    const isOpen = shouldUseTray ? getIsTrayOpen() : getIsDropdownOpen();
    const shouldFetchOptions = isOpen || typeof allowedOptions === "function";
    if (!shouldFetchOptions) return;
    const abortController = typeof allowedOptions === "function" ? new AbortController() : null;
    abortControllerRef.current?.abort();
    abortControllerRef.current = abortController;
    let debounceTime = 0;
    if (typeof allowedOptions === "function" && !// don't debounce for initial render (when we have to resolve the labels for selected values).
    // don't debounce for first time the dropdown is opened as well.
    (newUnknownValues.length > 0 || (isOpen && shouldUseTray ? hasTrayOpenChanged : hasDropdownOpenChanged)) && // Hack: We avoid debouncing to speed up playwright tests
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
          isOpen ? allowedOptions(inputTrimmed, maxPresentedOptions, arrayValues, signal) : (
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
        if (!inputTrimmed) {
          const unreturnedValues = newUnknownValues.filter((v) => !cachedOptions.current[v]).map((v) => ({ label: v, value: v }));
          if (unreturnedValues.length > 0) {
            updateCachedOptions(unreturnedValues);
            updatedOptions = unreturnedValues.concat(searchResults || []);
          }
        }
        const options = inputTrimmed ? updatedOptions : sortValuesToTop(updatedOptions, arrayValues);
        setFilteredOptions(getMatchScore(inputTrimmed, options, language, false));
      } else {
        const mergedOptions = arrayValues.filter((v) => !allOptionsLookup[v]).map((v) => ({ label: v, value: v })).concat(allowedOptions);
        const options = activeInputValue ? mergedOptions : sortValuesToTop(mergedOptions, arrayValues);
        setFilteredOptions(
          getMatchScore(activeInputValue, options, language, true).slice(0, maxPresentedOptions)
        );
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
    getIsDropdownOpen,
    getIsTrayOpen,
    shouldUseTray,
    inputTrimmed,
    language,
    newUnknownValuesAsKey,
    allowedOptionsAsKey
  ]);
  const addNewOptionVisible = !isLoading && allowFreeText && inputTrimmed && !arrayValues.includes(inputTrimmed) && !filteredOptions.find((o) => o.value === inputTrimmed);
  useEffect(() => {
    const isOpen = shouldUseTray ? getIsTrayOpen() : getIsDropdownOpen();
    if (!isOpen) return;
    if (activeDescendant.current && filteredOptions.find((o) => o.value === activeDescendant.current)) {
      activateDescendant(activeDescendant.current);
    } else if (addNewOptionVisible && activeDescendant.current === inputTrimmed) {
      activateDescendant(inputTrimmed);
    } else {
      activateDescendant("");
    }
  }, [
    shouldUseTray,
    getIsDropdownOpen,
    getIsTrayOpen,
    filteredOptions,
    activateDescendant,
    addNewOptionVisible,
    inputTrimmed
  ]);
  useEffect(() => {
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
  const handleOptionSelect = useCallback2(
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
  const focusInputWithVirtualKeyboardGuard = useCallback2(
    /**
     * @param {Object} params
     * @param {HTMLInputElement | null} params.input
     * @param {boolean} [params.shouldPreventKeyboardReopen]
     * @param {boolean} [params.forceOpenKeyboard]
     * @param {{ current: ReturnType<typeof setTimeout> | null } | null} [params.readonlyResetTimeoutRef]
     */
    (params) => {
      const {
        input,
        shouldPreventKeyboardReopen = false,
        forceOpenKeyboard = false,
        readonlyResetTimeoutRef = null
      } = params;
      if (!input) return;
      const shouldTemporarilyDisableInput = shouldPreventKeyboardReopen && !forceOpenKeyboard;
      if (shouldTemporarilyDisableInput) {
        input.setAttribute("readonly", "readonly");
      }
      input.focus();
      if (shouldTemporarilyDisableInput) {
        if (readonlyResetTimeoutRef?.current) {
          clearTimeout(readonlyResetTimeoutRef.current);
        }
        const removeReadonly = () => {
          input.removeAttribute("readonly");
          if (readonlyResetTimeoutRef) {
            readonlyResetTimeoutRef.current = null;
          }
        };
        if (readonlyResetTimeoutRef) {
          readonlyResetTimeoutRef.current = setTimeout(removeReadonly, 10);
        } else {
          setTimeout(removeReadonly, 10);
        }
      }
    },
    []
  );
  const focusInput = useCallback2(
    (forceOpenKeyboard = false) => {
      focusInputWithVirtualKeyboardGuard({
        input: inputRef.current,
        shouldPreventKeyboardReopen: getIsFocused() && virtualKeyboardExplicitlyClosedRef.current === true,
        forceOpenKeyboard
      });
    },
    [getIsFocused, focusInputWithVirtualKeyboardGuard]
  );
  const focusTrayInput = useCallback2(
    (forceOpenKeyboard = false) => {
      const input = trayInputRef.current;
      focusInputWithVirtualKeyboardGuard({
        input,
        shouldPreventKeyboardReopen: document.activeElement === input && virtualKeyboardExplicitlyClosedRef.current === true,
        forceOpenKeyboard,
        readonlyResetTimeoutRef: trayReadonlyResetTimeoutRef
      });
    },
    [focusInputWithVirtualKeyboardGuard]
  );
  const openTray = useCallback2(() => {
    if (!shouldUseTray) return;
    const scrollingElement = (
      /** @type {HTMLElement} */
      document.scrollingElement || document.documentElement
    );
    originalOverflowRef.current = scrollingElement.style.overflow;
    scrollingElement.style.overflow = "hidden";
    setIsTrayOpen(true);
    setIsDropdownOpen(false);
    trayClosedExplicitlyRef.current = false;
    if (!virtualKeyboardHeightAdjustSubscription.current) {
      if (wasVisualViewportInitialHeightAnApproximate && trayModalRef.current) {
        trayModalRef.current.style.removeProperty("display");
        const height = trayModalRef.current.offsetHeight;
        if (height > 0) {
          visualViewportInitialHeight = height;
          wasVisualViewportInitialHeightAnApproximate = false;
        }
      }
      virtualKeyboardHeightAdjustSubscription.current = subscribeToVirtualKeyboard({
        heightCallback(keyboardHeight, isVisible) {
          setVirtualKeyboardHeight(isVisible ? keyboardHeight : 0);
          virtualKeyboardExplicitlyClosedRef.current = !isVisible;
        }
      });
    }
  }, [shouldUseTray, setIsDropdownOpen, setIsTrayOpen]);
  useEffect(() => {
    if (shouldUseTray && getIsTrayOpen()) {
      focusTrayInput(true);
    }
  }, [shouldUseTray, getIsTrayOpen, focusTrayInput]);
  const closeTray = useCallback2(() => {
    setIsTrayOpen(false);
    setTrayInputValue("");
    setVirtualKeyboardHeight(0);
    virtualKeyboardExplicitlyClosedRef.current = null;
    virtualKeyboardHeightAdjustSubscription.current?.();
    virtualKeyboardHeightAdjustSubscription.current = null;
    if (trayReadonlyResetTimeoutRef.current) {
      clearTimeout(trayReadonlyResetTimeoutRef.current);
      trayReadonlyResetTimeoutRef.current = null;
    }
    trayInputRef.current?.removeAttribute("readonly");
    const scrollingElement = (
      /** @type {HTMLElement} */
      document.scrollingElement || document.documentElement
    );
    scrollingElement.style.overflow = originalOverflowRef.current;
    trayClosedExplicitlyRef.current = true;
    focusInput(true);
  }, [setIsTrayOpen, focusInput]);
  const handleInputChange = useCallback2(
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
  const handleTrayInputChange = useCallback2(
    /**
     * Handle tray input change
     * @param {import('preact/compat').ChangeEvent<HTMLInputElement>} e - Input change event
     */
    (e) => {
      setTrayInputValue(e.currentTarget.value);
    },
    []
  );
  const virtualKeyboardExplicitlyClosedRef = useRef2(null);
  const virtualKeyboardDismissSubscription = useRef2(
    /** @type {function | null} */
    null
  );
  const virtualKeyboardHeightAdjustSubscription = useRef2(
    /** @type {function | null} */
    null
  );
  const trayReadonlyResetTimeoutRef = useRef2(
    /** @type {ReturnType<typeof setTimeout> | null} */
    null
  );
  const handleInputFocus = useCallback2(() => {
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
  const handleInputBlur = useCallback2(() => {
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
  const handleAddNewOption = useCallback2(
    /**
     * @param {string} newValue
     */
    (newValue) => {
      handleOptionSelect(newValue);
      if (!filteredOptions.find((o) => o.value === newValue)) {
        setFilteredOptions((options) => {
          options = [
            /** @type {OptionMatch} */
            {
              label: newValue,
              value: newValue
            }
          ].concat(options);
          const isRemoteSearch = typeof allowedOptions === "function";
          return getMatchScore(inputTrimmed, options, language, !isRemoteSearch);
        });
      }
      activateDescendant(newValue);
    },
    [
      allowedOptions,
      language,
      handleOptionSelect,
      activateDescendant,
      inputTrimmed,
      filteredOptions
    ]
  );
  const handleKeyDown = useCallback2(
    /**
     * @param {import('preact/compat').KeyboardEvent<HTMLInputElement>} e - Keyboard event
     */
    (e) => {
      const currentActiveDescendant = activeDescendant.current;
      if (e.key === "Enter") {
        e.preventDefault();
        const currentIndex = currentActiveDescendant ? filteredOptions.findIndex((o) => o.value === currentActiveDescendant) : -1;
        if (currentIndex > -1) {
          const option = (
            /** @type {OptionMatch} */
            filteredOptions[currentIndex]
          );
          handleOptionSelect(option.value, {
            toggleSelected: true
          });
        } else if (allowFreeText && inputTrimmed !== "") {
          handleAddNewOption(inputTrimmed);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
        if (!filteredOptions.length && !addNewOptionVisible) return;
        const currentIndex = currentActiveDescendant ? filteredOptions.findIndex((o) => o.value === currentActiveDescendant) : -1;
        if (addNewOptionVisible && currentActiveDescendant !== inputTrimmed && (currentIndex < 0 || currentIndex === filteredOptions.length - 1)) {
          activateDescendant(inputTrimmed);
        } else if (filteredOptions.length) {
          let nextIndex = currentIndex === filteredOptions.length - 1 ? 0 : currentIndex + 1;
          let attempts = 0;
          while (attempts < filteredOptions.length) {
            const option = (
              /** @type {OptionMatch} */
              filteredOptions[nextIndex]
            );
            if (!option.disabled) {
              activateDescendant(option.value);
              break;
            }
            nextIndex = nextIndex === filteredOptions.length - 1 ? 0 : nextIndex + 1;
            attempts++;
          }
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
        if (!filteredOptions.length && !addNewOptionVisible) return;
        const currentIndex = currentActiveDescendant ? filteredOptions.findIndex((o) => o.value === currentActiveDescendant) : 0;
        if (addNewOptionVisible && currentActiveDescendant !== inputTrimmed && (currentIndex === 0 && currentActiveDescendant || !filteredOptions.length)) {
          activateDescendant(inputTrimmed);
        } else if (filteredOptions.length) {
          let prevIndex = (currentIndex - 1 + filteredOptions.length) % filteredOptions.length;
          let attempts = 0;
          while (attempts < filteredOptions.length) {
            const option = (
              /** @type {OptionMatch} */
              filteredOptions[prevIndex]
            );
            if (!option.disabled) {
              activateDescendant(option.value);
              break;
            }
            prevIndex = (prevIndex - 1 + filteredOptions.length) % filteredOptions.length;
            attempts++;
          }
        }
      } else if (e.key === "Escape") {
        closeDropdown(true);
      } else if (e.key === "Home" && (e.ctrlKey || !inputValue) && getIsDropdownOpen()) {
        e.preventDefault();
        if (filteredOptions.length > 0) {
          const firstNonDisabledOption = filteredOptions.find((option) => !option.disabled);
          if (firstNonDisabledOption) {
            activateDescendant(firstNonDisabledOption.value);
          }
        } else if (addNewOptionVisible) {
          activateDescendant(inputTrimmed);
        }
      } else if (e.key === "End" && (e.ctrlKey || !inputValue) && getIsDropdownOpen()) {
        e.preventDefault();
        if (filteredOptions.length > 0) {
          const lastNonDisabledOption = filteredOptions.findLast((option) => !option.disabled);
          if (lastNonDisabledOption) {
            activateDescendant(lastNonDisabledOption.value);
          }
        } else if (addNewOptionVisible) {
          activateDescendant(inputTrimmed);
        }
      } else if (e.key === "PageDown") {
        e.preventDefault();
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
        if (!filteredOptions.length) return;
        const listEl = dropdownPopperRef.current;
        const firstOption = listEl?.querySelector(".PreactCombobox-option");
        const pageSize = listEl && firstOption ? Math.max(
          1,
          Math.floor(listEl.clientHeight / firstOption.getBoundingClientRect().height)
        ) : 10;
        const currentIndex = currentActiveDescendant ? filteredOptions.findIndex((o) => o.value === currentActiveDescendant) : -1;
        let targetIndex = Math.min(currentIndex + pageSize, filteredOptions.length - 1);
        while (targetIndex >= 0 && /** @type {OptionMatch} */
        filteredOptions[targetIndex].disabled) {
          targetIndex--;
        }
        if (targetIndex >= 0) {
          activateDescendant(
            /** @type {OptionMatch} */
            filteredOptions[targetIndex].value
          );
        }
      } else if (e.key === "PageUp") {
        e.preventDefault();
        setIsDropdownOpen(true);
        dropdownClosedExplicitlyRef.current = false;
        if (!filteredOptions.length) return;
        const listEl = dropdownPopperRef.current;
        const firstOption = listEl?.querySelector(".PreactCombobox-option");
        const pageSize = listEl && firstOption ? Math.max(
          1,
          Math.floor(listEl.clientHeight / firstOption.getBoundingClientRect().height)
        ) : 10;
        const currentIndex = currentActiveDescendant ? filteredOptions.findIndex((o) => o.value === currentActiveDescendant) : filteredOptions.length;
        let targetIndex = Math.max(currentIndex - pageSize, 0);
        while (targetIndex < filteredOptions.length && /** @type {OptionMatch} */
        filteredOptions[targetIndex].disabled) {
          targetIndex++;
        }
        if (targetIndex < filteredOptions.length) {
          activateDescendant(
            /** @type {OptionMatch} */
            filteredOptions[targetIndex].value
          );
        }
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
      activateDescendant,
      allowFreeText,
      filteredOptions,
      addNewOptionVisible,
      handleOptionSelect,
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
  const handlePaste = useCallback2(
    /**
     * @param {import('preact/compat').ClipboardEvent<HTMLInputElement>} e - Clipboard event
     */
    (e) => {
      if (!values) return;
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
      setFilteredOptions((filteredOptions2) => filteredOptions2.slice());
    },
    [allOptions, onChange, values, updateSelectionAnnouncement]
  );
  const handleClearValue = useCallback2(() => {
    setInputValue("");
    onChange(multiple ? [] : "");
    updateSelectionAnnouncement(arrayValues, "removed");
    undoStack.current.push(arrayValues);
    redoStack.current = [];
    if (getIsFocused()) {
      focusInput();
    }
  }, [onChange, multiple, arrayValues, updateSelectionAnnouncement, getIsFocused, focusInput]);
  const handleRootElementClick = useCallback2(() => {
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
    () => formSubmitCompatible ? arrayValues.map((val) => /* @__PURE__ */ jsx("option", { value: val, disabled: allOptionsLookup[val]?.disabled, children: allOptionsLookup[val]?.label || val }, val)).concat(
      typeof allowedOptions !== "function" ? allowedOptions.filter((o) => !arrayValuesLookup.has(o.value)).slice(0, maxPresentedOptions - arrayValues.length).map((o) => /* @__PURE__ */ jsx("option", { value: o.value, disabled: o.disabled, children: o.label }, o.value)) : []
    ) : null,
    [
      arrayValues,
      allOptionsLookup,
      formSubmitCompatible,
      allowedOptions,
      arrayValuesLookup,
      maxPresentedOptions
    ]
  );
  useEffect(() => {
    const isOpen = getIsDropdownOpen() || getIsTrayOpen();
    if (isLoading && isOpen) {
      setLoadingAnnouncement(mergedTranslations.loadingOptionsAnnouncement);
    } else if (loadingAnnouncement && !isLoading && isOpen) {
      setLoadingAnnouncement(
        filteredOptions.length ? mergedTranslations.optionsLoadedAnnouncement : mergedTranslations.noOptionsFoundAnnouncement
      );
      const timer = setTimeout(() => {
        setLoadingAnnouncement("");
      }, 1e3);
      return () => clearTimeout(timer);
    } else if (loadingAnnouncement && !isOpen) {
      setLoadingAnnouncement("");
    }
  }, [
    isLoading,
    loadingAnnouncement,
    getIsDropdownOpen,
    getIsTrayOpen,
    filteredOptions.length,
    mergedTranslations.loadingOptionsAnnouncement,
    mergedTranslations.optionsLoadedAnnouncement,
    mergedTranslations.noOptionsFoundAnnouncement
  ]);
  const isServerSideForm = isServer && formSubmitCompatible;
  let list = null;
  if (!isServer) {
    list = // biome-ignore lint/a11y/useFocusableInteractive: <explanation>
    /* @__PURE__ */ jsx(
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
        hidden: shouldUseTray ? !getIsTrayOpen() : !getIsDropdownOpen(),
        ref: shouldUseTray ? null : dropdownPopperRef,
        children: isLoading ? /* @__PURE__ */ jsx("li", { className: "PreactCombobox-option", "aria-disabled": true, children: loadingRenderer(mergedTranslations.loadingOptions) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          addNewOptionVisible && /* @__PURE__ */ jsx(
            "li",
            {
              id: `${id}-option-${toHTMLId(inputTrimmed)}`,
              className: "PreactCombobox-option",
              role: "option",
              tabIndex: -1,
              "aria-selected": false,
              onMouseEnter: () => activateDescendant(inputTrimmed, false),
              onMouseDown: (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddNewOption(inputTrimmed);
                if (shouldUseTray) {
                  if (!multiple) {
                    closeTray();
                  } else {
                    focusTrayInput();
                  }
                } else {
                  if (!multiple) {
                    closeDropdown();
                  }
                  focusInput();
                }
              },
              children: mergedTranslations.addOption.replace("{value}", inputTrimmed)
            },
            inputTrimmed
          ),
          filteredOptions.map((option) => {
            const isActive = activeDescendant.current === option.value;
            const isSelected = arrayValues.includes(option.value);
            const isInvalid = invalidValues.includes(option.value);
            const isDisabled = option.disabled;
            const hasDivider = option.divider && !inputTrimmed;
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
                onMouseEnter: () => !isDisabled && activateDescendant(option.value, false),
                onMouseDown: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOptionSelect(option.value, { toggleSelected: true });
                  if (shouldUseTray) {
                    if (!multiple) {
                      closeTray();
                    } else {
                      focusTrayInput();
                    }
                  } else {
                    if (!multiple) {
                      closeDropdown();
                    }
                    focusInput();
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
                  isSelected ? /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "PreactCombobox-srOnly",
                      "aria-atomic": "true",
                      "data-reader": "selected",
                      "aria-hidden": !isActive,
                      children: mergedTranslations.selectedOption
                    }
                  ) : null,
                  isInvalid ? /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "PreactCombobox-srOnly",
                      "aria-atomic": "true",
                      "data-reader": "invalid",
                      "aria-hidden": !isActive,
                      children: mergedTranslations.invalidOption
                    }
                  ) : null
                ]
              },
              option.value
            );
          }),
          filteredOptions.length === 0 && !isLoading && (!allowFreeText || !activeInputValue || arrayValues.includes(activeInputValue)) && /* @__PURE__ */ jsx("li", { className: "PreactCombobox-option", children: mergedTranslations.noOptionsFound }),
          filteredOptions.length === maxPresentedOptions && /* @__PURE__ */ jsx("li", { className: "PreactCombobox-option", children: mergedTranslations.typeToLoadMore })
        ] })
      }
    );
  }
  return /* @__PURE__ */ jsxs(
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
        /* @__PURE__ */ jsx("div", { className: "PreactCombobox-srOnly", "aria-live": "polite", "aria-atomic": "true", children: getIsFocused() ? lastSelectionAnnouncement : "" }),
        /* @__PURE__ */ jsx("div", { className: "PreactCombobox-srOnly", "aria-live": "polite", "aria-atomic": "true", children: getIsFocused() ? loadingAnnouncement : "" }),
        /* @__PURE__ */ jsx("div", { className: "PreactCombobox-srOnly", "aria-live": "polite", "aria-atomic": "true", children: invalidValues.length > 0 && getIsFocused() ? mergedTranslations.fieldContainsInvalidValues : "" }),
        /* @__PURE__ */ jsxs("div", { className: `PreactCombobox-field ${disabled ? "PreactCombobox-field--disabled" : ""}`, children: [
          !isServerSideForm && /* @__PURE__ */ jsxs(Fragment, { children: [
            !multiple && singleSelectValue && allOptionsLookup[singleSelectValue] && optionIconRenderer?.(allOptionsLookup[singleSelectValue], true),
            /* @__PURE__ */ jsx(
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
                "aria-activedescendant": activeDescendant.current ? `${id}-option-${toHTMLId(activeDescendant.current)}` : void 0,
                disabled,
                required: required && arrayValues.length === 0,
                ...inputProps
              }
            ),
            !disabled && showClearButton && arrayValues.length > 0 ? /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "PreactCombobox-clearButton",
                "aria-label": mergedTranslations.clearValue,
                onClick: handleClearValue,
                children: /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "\u2715" })
              }
            ) : null,
            invalidValues.length > 0 && /* @__PURE__ */ jsx(
              "span",
              {
                ref: warningIconRef,
                className: "PreactCombobox-warningIconWrapper",
                onMouseEnter: () => setWarningIconHovered(true),
                onMouseLeave: () => setWarningIconHovered(false),
                children: warningIcon
              }
            ),
            multiple && arrayValues.length > 1 && /* @__PURE__ */ jsx("span", { className: "PreactCombobox-badge", children: mergedTranslations.selectedCountFormatter(arrayValues.length, language) }),
            chevronIcon
          ] }),
          formSubmitCompatible ? /* @__PURE__ */ jsx(
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
        list && /* @__PURE__ */ jsx(Portal, { parent: portal, rootElementRef, children: shouldUseTray ? (
          // I couldn't use native <dialog> element because trying to focus input right
          // after dialog.close() doesn't seem to work on Chrome (Android).
          /* @__PURE__ */ jsx(
            "div",
            {
              ref: trayModalRef,
              className: `PreactCombobox-modal ${`PreactCombobox--${theme}`}`,
              style: { display: getIsTrayOpen() ? null : "none" },
              onClick: (e) => {
                if (e.target === trayModalRef.current) {
                  closeTray();
                }
              },
              onKeyDown: (e) => {
                if (e.key === "Escape") {
                  closeTray();
                }
              },
              role: "dialog",
              "aria-modal": "true",
              "aria-labelledby": getTrayLabel() ? `${id}-tray-label` : void 0,
              tabIndex: -1,
              children: /* @__PURE__ */ jsxs("div", { className: `PreactCombobox-tray ${`PreactCombobox--${theme}`}`, children: [
                /* @__PURE__ */ jsxs("div", { className: "PreactCombobox-trayHeader", children: [
                  getTrayLabel() && /* @__PURE__ */ jsx(
                    "label",
                    {
                      id: `${id}-tray-label`,
                      className: "PreactCombobox-trayLabel",
                      htmlFor: `${id}-tray-input`,
                      children: getTrayLabel()
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: `${id}-tray-input`,
                      ref: trayInputRef,
                      type: "text",
                      value: trayInputValue,
                      placeholder: mergedTranslations.searchPlaceholder,
                      onChange: handleTrayInputChange,
                      onKeyDown: (e) => {
                        if (e.key === "Escape") {
                          closeTray();
                        }
                      },
                      className: `PreactCombobox-trayInput ${!getTrayLabel() ? "PreactCombobox-trayInput--noLabel" : ""}`,
                      role: "combobox",
                      "aria-expanded": "true",
                      "aria-haspopup": "listbox",
                      "aria-controls": `${id}-options-listbox`,
                      "aria-label": getTrayLabel() || mergedTranslations.searchPlaceholder,
                      autoComplete: "off"
                    }
                  )
                ] }),
                list,
                virtualKeyboardHeight > 0 && /* @__PURE__ */ jsx(
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
        ) : list }),
        invalidValues.length > 0 && warningIconHovered && !isServer && /* @__PURE__ */ jsx(Portal, { parent: portal, rootElementRef, children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: `PreactCombobox-valueTooltip ${`PreactCombobox--${theme}`}`,
            role: "tooltip",
            ref: tooltipPopperRef,
            children: [
              mergedTranslations.invalidValues,
              invalidValues.map((value2) => /* @__PURE__ */ jsx("div", { className: "PreactCombobox-tooltipValue", children: value2 }, value2))
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
  defaultOptionRenderer,
  matchSlicesToNodes,
  subscribeToVirtualKeyboard
};
//# sourceMappingURL=PreactCombobox.js.map
