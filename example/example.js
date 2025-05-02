import htm from "htm";
import { createElement, render } from "preact";
import { useState } from "preact/hooks";
const html = htm.bind(createElement);

import PreactCombobox from "../dist/esm/PreactCombobox.js";

let allowedOptions = [
  { label: "United States of America", value: "usa" },
  { label: "France", value: "france" },
  { label: "Japan", value: "japan" },
  { label: "Brazil", value: "brazil" },
  { label: "Australia", value: "australia" },
  { label: "China", value: "china" },
  { label: "Russia", value: "russia" },
  { label: "South Korea", value: "korea" },
  { label: "Indonesia", value: "indonesia" },
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
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if aborted
  if (signal.aborted) {
    throw new Error("Aborted");
  }

  // If queryOrValues is an array, we're resolving existing values (initial load)
  if (Array.isArray(queryOrValues)) {
    return queryOrValues
      .map(value => carrierData.find(option => option.value === value))
      .filter(Boolean);
  }
  
  // Otherwise, we're searching based on user input
  const query = queryOrValues.toLowerCase();
  return carrierData
    .filter(option => 
      option.label.toLowerCase().includes(query) || 
      option.value.toLowerCase().includes(query)
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
  const [value1, setValue1] = useState("India");
  const [carrierValues, setCarrierValues] = useState([
    "550e8400-e29b-41d4-a716-446655440001", // DHL
    "550e8400-e29b-41d4-a716-446655440004"  // Aramex
  ]);
  
  return html`
    <form>
        <h3>Multi-select, Free text allowed</h3>
        <${PreactCombobox}
          id="example-1"
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          value=${values1}
          onChange=${setValues1}
          name="example-1"
          required=${true}
        />
        <br/>

        <h3>Free text not allowed (with invalid values)</h3>
        <${PreactCombobox}
          id="example-2"
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          value=${values2}
          onChange=${setValues2}
        />
        <br/>

        <h3>Disabled</h3>
        <${PreactCombobox}
          id="example-3"
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          value=${["france"]}
          disabled
        />
        <br/>

        <h3>Single-select, No free text allowed</h3>
        <${PreactCombobox}
          id="example-4"
          multiple=${false}
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          value=${value1}
          onChange=${setValue1}
          name="example-4"
          required=${true}
        />
        <br/>
        
        <h3>Remote data fetching (Carrier Accounts)</h3>
        <p>Selected values are UUIDs that get resolved to carrier names</p>
        <${PreactCombobox}
          id="example-5"
          allowedOptions=${fetchCarrierOptions}
          allowFreeText=${false}
          value=${carrierValues}
          onChange=${setCarrierValues}
          showValue=${false}
          placeholder="Search for carriers..."
        />
        <br/>

        <button type="submit">Test Form Submit</button>
    </form>
  `;
}

const root = document.getElementById("root");
render(html`<${App} />`, root);
