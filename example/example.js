import htm from "htm";
import { createElement, render } from "preact";
import { useEffect, useState } from "preact/hooks";
const html = htm.bind(createElement);

import PreactCombobox from "/dist/esm/PreactCombobox.js";

let allowedOptions = [
  {
    label: "United States of America",
    value: "usa",
    icon: "🇺🇸",
  },
  {
    label: "France",
    value: "france",
    icon: "🇫🇷",
  },
  {
    label: "Japan",
    value: "japan",
    icon: "🇯🇵",
  },
  {
    label: "Brazil",
    value: "brazil",
    icon: "🇧🇷",
  },
  {
    label: "Australia",
    value: "australia",
    icon: "🇦🇺",
  },
  {
    label: "China",
    value: "china",
    icon: "🇨🇳",
  },
  {
    label: "Russia",
    value: "russia",
    icon: "🇷🇺",
  },
  {
    label: "South Korea",
    value: "korea",
    icon: "🇰🇷",
  },
  {
    label: "Indonesia",
    value: "indonesia",
    icon: "🇮🇩",
  },
];

// Arabic options for RTL example
const arabicOptions = [
  {
    label: "المملكة العربية السعودية",
    value: "saudi-arabia",
    icon: "🇸🇦",
  },
  {
    label: "مصر",
    value: "egypt",
    icon: "🇪🇬",
  },
  {
    label: "الإمارات العربية المتحدة",
    value: "uae",
    icon: "🇦🇪",
  },
  {
    label: "قطر",
    value: "qatar",
    icon: "🇶🇦",
  },
  {
    label: "المغرب",
    value: "morocco",
    icon: "🇲🇦",
  },
  // Add some English options to test mixed content
  {
    label: "United Kingdom",
    value: "uk",
    icon: "🇬🇧",
  },
  {
    label: "Germany",
    value: "germany",
    icon: "🇩🇪",
  },
];

// Carrier data for remote fetching simulation
const carrierData = [
  { label: "FedEx", value: "550e8400-e29b-41d4-a716-446655440000" },
  { label: "DHL", value: "550e8400-e29b-41d4-a716-446655440001" },
  { label: "UPS", value: "550e8400-e29b-41d4-a716-446655440002" },
  { label: "USPS", value: "550e8400-e29b-41d4-a716-446655440003" },
  { label: "Aramex", value: "550e8400-e29b-41d4-a716-446655440004" },
  { label: "DPD", value: "550e8400-e29b-41d4-a716-446655440005" },
  { label: "Royal Mail", value: "550e8400-e29b-41d4-a716-446655440006" },
  { label: "Australia Post", value: "550e8400-e29b-41d4-a716-446655440007" },
  { label: "Canada Post", value: "550e8400-e29b-41d4-a716-446655440008" },
  { label: "China Post", value: "550e8400-e29b-41d4-a716-446655440009" },
];

// Simulate remote data fetching
const fetchCarrierOptions = async (queryOrValues, limit, currentSelections, signal) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Check if aborted
  if (signal.aborted) {
    console.log("Aborted");
    return [];
  }

  // If queryOrValues is an array, we're resolving existing values (initial load)
  if (Array.isArray(queryOrValues)) {
    return queryOrValues
      .map((value) => carrierData.find((option) => option.value === value))
      .filter(Boolean);
  }

  // Otherwise, we're searching based on user input
  const query = queryOrValues.toLowerCase();
  return carrierData
    .filter(
      (option) =>
        option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query),
    )
    .slice(0, limit);
};

// Performance test
// for (let i = 0; i < 10000; i++) {
//   allowedOptions.push({ label: "Option " + i, value: "option" + i });
// }

// Arabic translations
const arabicTranslations = {
  searchPlaceholder: "بحث...",
  noOptionsFound: "لم يتم العثور على خيارات",
  loadingOptions: "جاري التحميل...",
  loadingOptionsAnnouncement: "جاري تحميل الخيارات، يرجى الانتظار...",
  optionsLoadedAnnouncement: "تم تحميل الخيارات.",
  noOptionsFoundAnnouncement: "لم يتم العثور على خيارات.",
  addOption: 'إضافة "{value}"',
  typeToLoadMore: "...اكتب للمزيد من الخيارات",
  clearValue: "مسح القيمة",
  selectedOption: "خيار محدد.",
  invalidOption: "خيار غير صالح.",
  invalidValues: "قيم غير صالحة:",
  fieldContainsInvalidValues: "يحتوي الحقل على قيم غير صالحة",
  noOptionsSelected: "لم يتم تحديد أي خيارات",
  selectionAdded: "تمت إضافة",
  selectionRemoved: "تمت إزالة",
  selectionsCurrent: "محدد حاليا",
  selectionsMore: "و {count} خيار إضافي",
  selectionsMorePlural: "و {count} خيارات إضافية",
  // Custom formatter for Arabic that explicitly uses Arabic numerals
  selectedCountFormatter: (count) =>
    new Intl.NumberFormat("ar", {
      numberingSystem: "arab",
    }).format(count),
};

function App() {
  const [appTheme, setAppTheme] = useState("light");
  const [valuesBasicExample, setValuesBasicExample] = useState(["United Arab Emirates"]);
  const [invalidValuesExample, setInvalidValuesExample] = useState(["India"]);
  const [singleSelectExample, setSingleSelectExample] = useState("usa");
  const [carrierValues, setCarrierValues] = useState([
    "550e8400-e29b-41d4-a716-446655440001", // DHL
    "550e8400-e29b-41d4-a716-446655440004", // Aramex
  ]);
  const [valueServerSideExample, setValueServerSideExample] = useState("usa");
  const [valuesDarkThemeExample, setValuesDarkThemeExample] = useState(["japan", "china"]);
  const [valuesRTLExample, setValuesRTLExample] = useState(["egypt", "uae"]);
  const [value8, setValue8] = useState(["usa", "france"]);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (e) => {
      setAppTheme(e.detail.theme || (e.detail.darkMode ? "dark" : "light"));
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  return html`
    <form>
        <label for="example-1">Multi-select, Free text allowed, Form Submit Compatible</label>
        <${PreactCombobox}
          id="example-1"
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          value=${valuesBasicExample}
          onChange=${setValuesBasicExample}
          name="example-1"
          required=${true}
          formSubmitCompatible=${true}
          theme=${appTheme}
        />
        <br/>

        <label for="example-2">Multi-select, Free text not allowed, with invalid values</label>
        <${PreactCombobox}
          id="example-2"
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          value=${invalidValuesExample}
          onChange=${setInvalidValuesExample}
          theme=${appTheme}
        />
        <br/>

        <label for="example-3">Disabled</label>
        <${PreactCombobox}
          id="example-3"
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          value=${["france"]}
          disabled
          theme=${appTheme}
        />
        <br/>

        <label for="example-4">Single-select, No free text allowed</label>
        <${PreactCombobox}
          id="example-4"
          multiple=${false}
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          value=${singleSelectExample}
          onChange=${setSingleSelectExample}
          name="example-4"
          required=${true}
          theme=${appTheme}
        />
        <br/>
        
        <label for="example-5">Remote data fetching</label>
        <p id="example-5-explanation">Selected values are UUIDs that get resolved to carrier names</p>
        <${PreactCombobox}
          id="example-5"
          allowedOptions=${fetchCarrierOptions}
          allowFreeText=${false}
          value=${carrierValues}
          onChange=${setCarrierValues}
          placeholder="Search for carriers..."
          inputProps=${{
            "aria-describedby": "example-5-explanation",
          }}
          showValue=${false}
          theme=${appTheme}
        />
        <br/>

        <label for="example-6">Explicity use Dark Theme</label>
        <${PreactCombobox}
          id="example-6"
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          value=${valuesDarkThemeExample}
          onChange=${setValuesDarkThemeExample}
          theme="dark"
        />
        <br/>

        <label for="example-7">RTL Example with Arabic Translations</label>
        <p>This example demonstrates explicit RTL direction with Arabic language translations</p>
        <div class="rtl-container" dir="rtl">
          <${PreactCombobox}
            id="example-7"
            allowedOptions=${arabicOptions}
            allowFreeText=${true}
            value=${valuesRTLExample}
            onChange=${setValuesRTLExample}
            language="ar"
            theme=${appTheme}
            translations=${arabicTranslations}
          />
        </div>
        <br/>

        <label for="example-8">Server-Side Rendering Example</label>
        <p>This example shows how the component renders with isServer and formSubmitCompatible both set to true</p>
        <${PreactCombobox}
          id="example-8"
          multiple=${false}
          allowedOptions=${allowedOptions}
          value=${valueServerSideExample}
          onChange=${setValueServerSideExample}
          name="server-side-example"
          isServer=${true}
          formSubmitCompatible=${true}
          theme=${appTheme}
        />
        <br/>

        <button type="submit">Test Form Submit</button>
    </form>
  `;
}

const root = document.getElementById("root");
render(html`<${App} />`, root);
