import htm from "htm";
import { createElement, useState } from "react";
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
  const [values, setValues] = useState(["India"]);
  return html`
    <${MultiSelectAutocomplete}
      allowedOptions=${allowedOptions}
      allowFreeText=${true}
      enableBackspaceDelete=${false}
      values=${values}
      onChange=${setValues}
    />
  `;
}

const root = document.getElementById("root");
createRoot(root).render(html`<${App} />`);
