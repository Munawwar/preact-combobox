# PreactComboBox

A Preact autocomplete component

## Installation

```bash
npm add preact-combo-box @popperjs/core
```

## Usage

```jsx
import PreactComboBox from "preact-combo-box";

const options = [
  { label: "Option 1", value: "option-1" },
  { label: "Option 2", value: "option-2" },
  { label: "Option 3", value: "option-3" },
];

function App() {
  const [values, setValues] = useState([]);

  return (
    <PreactComboBox
      allowedOptions={options}
      values={values}
      onChange={setValues}

      // Optional props (defaults shown)
      className=""
      placeholder=""
      allowFreeText={false}
      disabled={false}
      required={false}
      // any language that Intl.Collator and Intl.Segmenter specifications support for word splitting and matching
      language="en"
      // name attribute. Useful for form submission
      name="my-autocomplete"
      // in case you want to place the dropdown in a different element for z-index management
      portal={document.body}

      // more props for important elements
      rootElementProps={{}}
      inputProps={{}}
      selectElementProps={{}}
    />
  );
}
```

## Run Demo

```bash
npm run watch
# on another terminal
npm run example
```