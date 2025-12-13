// lib/TraySearchList.jsx
import { useCallback as useCallback2, useEffect, useRef as useRef2, useState as useState2 } from "preact/hooks";

// lib/hooks.js
import { useCallback, useMemo, useRef, useState } from "preact/hooks";
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

// lib/TraySearchList.jsx
import { jsx, jsxs } from "preact/jsx-runtime";
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
  const [trayInputValue, setTrayInputValue] = useState2("");
  const [virtualKeyboardHeight, setVirtualKeyboardHeight] = useState2(0);
  const trayInputRef = useRef2(
    /** @type {HTMLInputElement | null} */
    null
  );
  const trayModalRef = useRef2(
    /** @type {HTMLDivElement | null} */
    null
  );
  const originalOverflowRef = useRef2("");
  const virtualKeyboardHeightAdjustSubscription = useRef2(
    /** @type {function | null} */
    null
  );
  const handleTrayInputChange = useCallback2(
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
  const handleClose = useCallback2(() => {
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
  useEffect(() => {
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
  useEffect(() => {
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
    /* @__PURE__ */ jsx(
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
        children: /* @__PURE__ */ jsxs("div", { className: `PreactCombobox-tray ${`PreactCombobox--${theme}`}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "PreactCombobox-trayHeader", children: [
            trayLabel && /* @__PURE__ */ jsx(
              "label",
              {
                id: `${id}-tray-label`,
                className: "PreactCombobox-trayLabel",
                htmlFor: `${id}-tray-input`,
                children: trayLabel
              }
            ),
            /* @__PURE__ */ jsx(
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
  );
};
var TraySearchList_default = TraySearchList;
export {
  TraySearchList_default as default
};
//# sourceMappingURL=TraySearchList.js.map
