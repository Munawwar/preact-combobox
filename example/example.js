import htm from "htm";
import { createElement, render } from "preact";
import { useEffect, useState } from "preact/hooks";
const html = htm.bind(createElement);

import PreactCombobox from "../dist/esm/PreactCombobox.js";

let allowedOptions = [
  {
    label: "United States of America",
    value: "usa",
    icon: "🇺🇸",
  },
  {
    label: "Argentina",
    value: "argentina",
    icon: "🇦🇷",
  },
  {
    label: "Australia",
    value: "australia",
    icon: "🇦🇺",
  },
  {
    label: "Brazil",
    value: "brazil",
    icon: "🇧🇷",
  },
  {
    label: "Canada",
    value: "canada",
    icon: "🇨🇦",
  },
  {
    label: "China",
    value: "china",
    icon: "🇨🇳",
  },
  {
    label: "Fiji",
    value: "fiji",
    icon: "🇫🇯",
  },
  {
    label: "France",
    value: "france",
    icon: "🇫🇷",
  },
  {
    label: "Germany",
    value: "germany",
    icon: "🇩🇪",
  },
  {
    label: "Indonesia",
    value: "indonesia",
    icon: "🇮🇩",
  },
  {
    label: "Italy",
    value: "italy",
    icon: "🇮🇹",
  },
  {
    label: "Japan",
    value: "japan",
    icon: "🇯🇵",
  },
  {
    label: "Mexico",
    value: "mexico",
    icon: "🇲🇽",
  },
  {
    label: "Netherlands",
    value: "netherlands",
    icon: "🇳🇱",
  },
  {
    label: "Pakistan",
    value: "pakistan",
    icon: "🇵🇰",
  },
  {
    label: "Poland",
    value: "poland",
    icon: "🇵🇱",
  },
  {
    label: "Russia",
    value: "russia",
    icon: "🇷🇺",
  },
  {
    label: "Saudi Arabia",
    value: "saudi-arabia",
    icon: "🇸🇦",
  },
  {
    label: "South Africa",
    value: "south-africa",
    icon: "🇿🇦",
  },
  {
    label: "South Korea",
    value: "korea",
    icon: "🇰🇷",
  },
  {
    label: "Spain",
    value: "spain",
    icon: "🇪🇸",
  },
  {
    label: "Sweden",
    value: "sweden",
    icon: "🇸🇪",
  },
  {
    label: "Switzerland",
    value: "switzerland",
    icon: "🇨🇭",
  },
  {
    label: "Turkey",
    value: "turkey",
    icon: "🇹🇷",
  },
  {
    label: "United Kingdom",
    value: "uk",
    icon: "🇬🇧",
  },
];

const example1Options = allowedOptions.map((option) => {
  if (option.value === "usa") {
    return {
      ...option,
      divider: true,
    };
  } else if (option.value === "fiji") {
    return {
      ...option,
      disabled: true,
    };
  }
  return option;
});

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
  // console.log("fetchCarrierOptions", queryOrValues, limit, currentSelections);
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

// 120 world cities — many with diacritics to showcase search
const manyOptions = [
  { label: "Ålesund", value: "alesund", divider: true },
  { label: "Ålborg", value: "aalborg" },
  { label: "Almería", value: "almeria", disabled: true },
  { label: "Amsterdam", value: "amsterdam" },
  { label: "Asunción", value: "asuncion" },
  { label: "Athens", value: "athens" },
  { label: "Auckland", value: "auckland" },
  { label: "Bangkok", value: "bangkok" },
  { label: "Beijing", value: "beijing" },
  { label: "Belém", value: "belem" },
  { label: "Berlin", value: "berlin" },
  { label: "Besançon", value: "besancon" },
  { label: "Béziers", value: "beziers" },
  { label: "Białystok", value: "bialystok" },
  { label: "Bogotá", value: "bogota" },
  { label: "Brașov", value: "brasov" },
  { label: "Brasília", value: "brasilia" },
  { label: "Brussels", value: "brussels" },
  { label: "Bucharest", value: "bucharest" },
  { label: "Budapest", value: "budapest" },
  { label: "Buenos Aires", value: "buenos-aires" },
  { label: "Cádiz", value: "cadiz" },
  { label: "Cairo", value: "cairo" },
  { label: "Cape Town", value: "cape-town" },
  { label: "Casablanca", value: "casablanca" },
  { label: "České Budějovice", value: "ceske-budejovice" },
  { label: "Cluj-Napoca", value: "cluj-napoca" },
  { label: "Colombo", value: "colombo" },
  { label: "Constanța", value: "constanta" },
  { label: "Córdoba", value: "cordoba" },
  { label: "Curaçao", value: "curacao" },
  { label: "Częstochowa", value: "czestochowa" },
  { label: "Debrecen", value: "debrecen" },
  { label: "Delhi", value: "delhi" },
  { label: "Dubai", value: "dubai" },
  { label: "Düsseldorf", value: "dusseldorf" },
  { label: "Florianópolis", value: "florianopolis" },
  { label: "Gävle", value: "gavle" },
  { label: "Gdańsk", value: "gdansk" },
  { label: "Genève", value: "geneve" },
  { label: "Goiânia", value: "goiania" },
  { label: "Göteborg", value: "goteborg" },
  { label: "Graz", value: "graz" },
  { label: "Gruyères", value: "gruyeres" },
  { label: "Győr", value: "gyor" },
  { label: "Havana", value: "havana" },
  { label: "Helsingør", value: "helsingor" },
  { label: "Hong Kong", value: "hong-kong" },
  { label: "Iași", value: "iasi" },
  { label: "Innsbruck", value: "innsbruck" },
  { label: "Istanbul", value: "istanbul" },
  { label: "Jakarta", value: "jakarta" },
  { label: "Jönköping", value: "jonkoping" },
  { label: "København", value: "kobenhavn" },
  { label: "Köln", value: "koln" },
  { label: "Košice", value: "kosice" },
  { label: "Kraków", value: "krakow" },
  { label: "Lagos", value: "lagos" },
  { label: "León", value: "leon" },
  { label: "Liège", value: "liege" },
  { label: "Lima", value: "lima" },
  { label: "Linköping", value: "linkoping" },
  { label: "Łódź", value: "lodz" },
  { label: "London", value: "london" },
  { label: "Lübeck", value: "lubeck" },
  { label: "Luleå", value: "lulea" },
  { label: "Lyon", value: "lyon" },
  { label: "Madrid", value: "madrid" },
  { label: "Málaga", value: "malaga" },
  { label: "Malmö", value: "malmo" },
  { label: "Manila", value: "manila" },
  { label: "Marseille", value: "marseille" },
  { label: "Medellín", value: "medellin" },
  { label: "Melbourne", value: "melbourne" },
  { label: "México City", value: "mexico-city" },
  { label: "Montréal", value: "montreal" },
  { label: "Mumbai", value: "mumbai" },
  { label: "München", value: "munchen" },
  { label: "Nairobi", value: "nairobi" },
  { label: "Neuchâtel", value: "neuchatel" },
  { label: "Nice", value: "nice" },
  { label: "Norrköping", value: "norrkoping" },
  { label: "Nürnberg", value: "nurnberg" },
  { label: "Örebro", value: "orebro" },
  { label: "Orléans", value: "orleans" },
  { label: "Panamá", value: "panama" },
  { label: "Paris", value: "paris" },
  { label: "Pécs", value: "pecs" },
  { label: "Plzeň", value: "plzen" },
  { label: "Poznań", value: "poznan" },
  { label: "Prague", value: "prague" },
  { label: "Québec", value: "quebec" },
  { label: "Recife", value: "recife" },
  { label: "Reykjavík", value: "reykjavik" },
  { label: "Rome", value: "rome" },
  { label: "Salzburg", value: "salzburg" },
  { label: "San José", value: "san-jose" },
  { label: "Santiago", value: "santiago" },
  { label: "São Paulo", value: "sao-paulo" },
  { label: "Seoul", value: "seoul" },
  { label: "Shanghai", value: "shanghai" },
  { label: "Singapore", value: "singapore" },
  { label: "Sofia", value: "sofia" },
  { label: "Strasbourg", value: "strasbourg" },
  { label: "Sydney", value: "sydney" },
  { label: "Székesfehérvár", value: "szekesfehervar" },
  { label: "Taipei", value: "taipei" },
  { label: "Timișoara", value: "timisoara" },
  { label: "Tokyo", value: "tokyo" },
  { label: "Tórshavn", value: "torshavn" },
  { label: "Toulouse", value: "toulouse" },
  { label: "Tromsø", value: "tromso" },
  { label: "Umeå", value: "umea" },
  { label: "Valparaíso", value: "valparaiso" },
  { label: "Västerås", value: "vasteras" },
  { label: "Vienna", value: "vienna" },
  { label: "Warsaw", value: "warsaw" },
  { label: "Wrocław", value: "wroclaw" },
  { label: "Würzburg", value: "wurzburg" },
  { label: "Zürich", value: "zurich" },
];

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
  const [valuesManyOptions, setValuesManyOptions] = useState(["zurich"]);
  const [valuesBasicExample, setValuesBasicExample] = useState(["United Arab Emirates"]);
  const [invalidValuesExample, setInvalidValuesExample] = useState(["India"]);
  const [singleSelectTrayExample, setSingleSelectTrayExample] = useState("usa");
  const [singleSelectExample, setSingleSelectExample] = useState("usa");
  const [carrierValues, setCarrierValues] = useState([
    "550e8400-e29b-41d4-a716-446655440001", // DHL
    "550e8400-e29b-41d4-a716-446655440004", // Aramex
  ]);
  const [valueServerSideExample, setValueServerSideExample] = useState("usa");
  const [valuesDarkThemeExample, setValuesDarkThemeExample] = useState(["japan", "china", "India"]);
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
        <label for="example-0">Multi-select, Free text allowed, Form Submit Compatible</label>
        <p>With dividers, disabled options, and mobile tray</p>
        <${PreactCombobox}
          id="example-0"
          allowedOptions=${manyOptions}
          allowFreeText=${true}
          value=${valuesManyOptions}
          onChange=${setValuesManyOptions}
          name="example-0"
          required=${true}
          formSubmitCompatible=${true}
          theme=${appTheme}
        />
        <br/>

        <label for="example-1">Multi-select, Free text allowed, Form Submit Compatible</label>
        <p>With dividers, disabled options, and mobile tray</p>
        <${PreactCombobox}
          id="example-1"
          allowedOptions=${example1Options}
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

        <label for="example-4">Single-select, with mobile tray</label>
        <${PreactCombobox}
          id="example-4"
          multiple=${false}
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          value=${singleSelectTrayExample}
          onChange=${setSingleSelectTrayExample}
          name="example-4"
          required=${true}
          theme=${appTheme}
        />
        <br/>

        <label for="example-5">Single-select, No free text, no mobile tray</label>
        <p>Mobile tray is disabled for this example but still provides reasonable UX on mobile devices</p>
        <${PreactCombobox}
          id="example-5"
          multiple=${false}
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          value=${singleSelectExample}
          onChange=${setSingleSelectExample}
          name="example-5"
          required=${true}
          theme=${appTheme}
          tray=${false}
        />
        <br/>

        <label for="example-6">Remote data fetching</label>
        <p id="example-6-explanation">Selected values are UUIDs that get resolved to carrier names</p>
        <${PreactCombobox}
          id="example-6"
          allowedOptions=${fetchCarrierOptions}
          allowFreeText=${false}
          value=${carrierValues}
          onChange=${setCarrierValues}
          placeholder="Search for carriers..."
          inputProps=${{
            "aria-describedby": "example-6-explanation",
          }}
          showValue=${false}
          theme=${appTheme}
        />
        <br/>

        <label for="example-7">Explicity use Dark Theme</label>
        <${PreactCombobox}
          id="example-7"
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          value=${valuesDarkThemeExample}
          onChange=${setValuesDarkThemeExample}
          theme="dark"
        />
        <br/>

        <label for="example-8">RTL Example with Arabic Translations</label>
        <p>This example demonstrates explicit RTL direction with Arabic language translations</p>
        <div class="rtl-container" dir="rtl">
          <${PreactCombobox}
            id="example-8"
            allowedOptions=${arabicOptions}
            allowFreeText=${true}
            value=${valuesRTLExample}
            onChange=${setValuesRTLExample}
            language="ar"
            theme=${appTheme}
            translations=${arabicTranslations}
            inputProps=${{
              autocomplete: "off",
            }}
          />
        </div>
        <br/>

        <label for="example-9">Progressive Enhancement Example</label>
        <p>This example shows how the component renders with isServer and formSubmitCompatible both set to true</p>
        <${PreactCombobox}
          id="example-9"
          multiple=${false}
          allowedOptions=${example1Options}
          value=${valueServerSideExample}
          onChange=${setValueServerSideExample}
          name="server-side-example"
          isServer=${true}
          formSubmitCompatible=${true}
          theme=${appTheme}
        />
        <br/>
        <button type="submit">Test Form Submit</button>
        <p>
          Note on client-side, when JS loads, isServer is set to false and select will get replaced with the combobox experience.
        </p>
    </form>
  `;
}

const root = document.getElementById("root");
render(html`<${App} />`, root);
