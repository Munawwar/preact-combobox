import htm from "htm";
import { createElement, useState, Fragment } from "react";
import { createRoot } from "react-dom/client";
const html = htm.bind(createElement);

import MultiSelectAutocomplete from "../dist/esm/MultiSelectAutocomplete.js";

const allowedOptions = [
  { label: "United States of America", value: "usa" },
  { label: "France", value: "france" },
  { label: "Japan", value: "japan" },
  { label: "Brazil", value: "brazil" },
  { label: "Australia", value: "australia" },
];

function App() {
  const [values1, setValues1] = useState(["India"]);
  const [values2, setValues2] = useState(["India"]);
  const [value1, setValue1] = useState("India");
  return html`
    <form>
        <h3>Multi-select, Free text allowed, Backspace delete enabled</h3>
        <${MultiSelectAutocomplete}
          id="example-1"
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          enableBackspaceDelete=${true}
          value=${values1}
          onChange=${setValues1}
          name="example-1"
          required=${true}
        />
        <br/>

        <h3>Free text not allowed, Invalid styling</h3>
        <${MultiSelectAutocomplete}
          id="example-2"
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          enableBackspaceDelete=${true}
          value=${values2}
          onChange=${setValues2}
        />
        <br/>

        <h3>Disabled</h3>
        <${MultiSelectAutocomplete}
          id="example-3"
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          enableBackspaceDelete=${false}
          value=${["france"]}
          disabled
        />
        <br/>

        <h3>Single-select, No free text allowed</h3>
        <${MultiSelectAutocomplete}
          id="example-4"
          multiple=${false}
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          enableBackspaceDelete=${true}
          value=${value1}
          onChange=${setValue1}
          name="example-4"
          required=${true}
        />
        <br/>

        <button type="submit">Test Form Submit</button>
    </form>
  `;
}

const root = document.getElementById("root");
createRoot(root).render(html`<${App} />`);
