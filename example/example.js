import htm from "htm";
import { render, createElement } from "preact";
import { useState } from "preact/hooks";
const html = htm.bind(createElement);

import PreactComboBox from "../dist/esm/PreactComboBox.js";

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

// Performance test
// for (let i = 0; i < 10000; i++) {
//   allowedOptions.push({ label: "Option " + i, value: "option" + i });
// }

function App() {
  const [values1, setValues1] = useState(["United Arab Emirates"]);
  const [values2, setValues2] = useState(["India"]);
  const [value1, setValue1] = useState("India");
  return html`
    <form>
        <h3>Multi-select, Free text allowed</h3>
        <${PreactComboBox}
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
        <${PreactComboBox}
          id="example-2"
          allowedOptions=${allowedOptions}
          allowFreeText=${false}
          value=${values2}
          onChange=${setValues2}
        />
        <br/>

        <h3>Disabled</h3>
        <${PreactComboBox}
          id="example-3"
          allowedOptions=${allowedOptions}
          allowFreeText=${true}
          value=${["france"]}
          disabled
        />
        <br/>

        <h3>Single-select, No free text allowed</h3>
        <${PreactComboBox}
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

        <button type="submit">Test Form Submit</button>
    </form>
  `;
}

const root = document.getElementById("root");
render(html`<${App} />`, root);
