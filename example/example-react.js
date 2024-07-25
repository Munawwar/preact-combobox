import htm from "htm";
import { createElement, useState, Fragment } from "react";
import { createRoot } from "react-dom/client";
const html = htm.bind(createElement);

import MultiSelectAutocomplete from "../dist/esm/MultiSelectAutocomplete.js";

const allowedOptions = [
  { label: "United States", value: "usa" },
  { label: "France", value: "france" },
  { label: "Japan", value: "japan" },
  { label: "Brazil", value: "brazil" },
  { label: "Australia", value: "australia" },
];

function App() {
  const [values1, setValues1] = useState(["India"]);
  const [values2, setValues2] = useState(["India"]);
  return html`
    <${Fragment}>
      <h3>Free text allowed, Backspace delete enabled</h3>
      <${MultiSelectAutocomplete}
        id="example-react-18"
        allowedOptions=${allowedOptions}
        allowFreeText=${true}
        enableBackspaceDelete=${true}
        values=${values1}
        onChange=${setValues1}
      />
      <br/><br/>

      <h3>Free text not allowed, Invalid styling</h3>
      <${MultiSelectAutocomplete}
        id="example-react-18"
        allowedOptions=${allowedOptions}
        allowFreeText=${false}
        enableBackspaceDelete=${true}
        values=${values2}
        onChange=${setValues2}
      />
      <br/><br/>

      <h3>Disabled</h3>
      <${MultiSelectAutocomplete}
        id="example-react-18-disabled"
        allowedOptions=${allowedOptions}
        allowFreeText=${true}
        enableBackspaceDelete=${false}
        values=${["france"]}
        disabled
      />
    </${Fragment}>
  `;
}

const root = document.getElementById("root");
createRoot(root).render(html`<${App} />`);
