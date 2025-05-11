import htm from "htm";
import { createElement, render } from "preact";
import { useState } from "preact/hooks";
const html = htm.bind(createElement);

import PreactCombobox from "../dist/esm/PreactCombobox.js";

let allowedOptions = [
  {
    label: "United States of America",
    value: "usa",
    icon: html`<span style="font-size: 16px;" role="img" aria-hidden="true">🇺🇸</span>`,
  },
  {
    label: "France",
    value: "france",
    icon: html`<span style="font-size: 16px;" role="img" aria-hidden="true">🇫🇷</span>`,
  },
  {
    label: "Japan",
    value: "japan",
    icon: html`<span style="font-size: 16px;" role="img" aria-hidden="true">🇯🇵</span>`,
  },
  {
    label: "Brazil",
    value: "brazil",
    icon: html`<span style="font-size: 16px;" role="img" aria-hidden="true">🇧🇷</span>`,
  },
  {
    label: "Australia",
    value: "australia",
    icon: html`<span style="font-size: 16px;" role="img" aria-hidden="true">🇦🇺</span>`,
  },
  {
    label: "China",
    value: "china",
    icon: html`<span style="font-size: 16px;" role="img" aria-hidden="true">🇨🇳</span>`,
  },
  {
    label: "Russia",
    value: "russia",
    icon: html`<span style="font-size: 16px;" role="img" aria-hidden="true">🇷🇺</span>`,
  },
  {
    label: "South Korea",
    value: "korea",
    icon: html`<span style="font-size: 16px;" role="img" aria-hidden="true">🇰🇷</span>`,
  },
  {
    label: "Indonesia",
    value: "indonesia",
    icon: html`<span style="font-size: 16px;" role="img" aria-hidden="true">🇮🇩</span>`,
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

function App() {
  const [values1, setValues1] = useState(["United Arab Emirates"]);
  const [values2, setValues2] = useState(["India"]);
  const [value3, setValue3] = useState("usa");
  const [carrierValues, setCarrierValues] = useState([
    "550e8400-e29b-41d4-a716-446655440001", // DHL
    "550e8400-e29b-41d4-a716-446655440004", // Aramex
  ]);
  const [serverSideValue, setServerSideValue] = useState("usa");

  return html`
    <form>
        <label for="example-1">Multi-select, Free text allowed, Form Submit Compatible</label>
        <${PreactCombobox}
          id="example-1"
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          value=${values1}
          onChange=${setValues1}
          name="example-1"
          required=${true}
          formSubmitCompatible=${true}
        />
        <br/>

        <label for="example-2">Multi-select, Free text not allowed, with invalid values</label>
        <${PreactCombobox}
          id="example-2"
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          value=${values2}
          onChange=${setValues2}
        />
        <br/>

        <label for="example-3">Disabled</label>
        <${PreactCombobox}
          id="example-3"
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          value=${["france"]}
          disabled
        />
        <br/>

        <label for="example-4">Single-select, No free text allowed</label>
        <${PreactCombobox}
          id="example-4"
          multiple=${false}
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          value=${value3}
          onChange=${setValue3}
          name="example-4"
          required=${true}
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
        />
        <br/>

        <label for="example-6">Server-Side Rendering Example</label>
        <p>This example shows how the component renders with isServer and formSubmitCompatible both set to true</p>
        <${PreactCombobox}
          id="example-6"
          multiple=${false}
          allowedOptions=${allowedOptions}
          value=${serverSideValue}
          onChange=${setServerSideValue}
          name="server-side-example"
          isServer=${true}
          formSubmitCompatible=${true}
        />
        <br/>

        <button type="submit">Test Form Submit</button>
    </form>
  `;
}

const root = document.getElementById("root");
render(html`<${App} />`, root);
