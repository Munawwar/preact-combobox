# MultiSelectAutocomplete

A React/Preact autocomplete component

## Installation

```bash
npm add react-multiselect-autocomplete @popperjs/core
```

## Usage

```jsx
import MultiSelectAutocomplete from "react-multiselect-autocomplete";

const options = [
  { label: "Option 1", value: "option-1" },
  { label: "Option 2", value: "option-2" },
  { label: "Option 3", value: "option-3" },
];

function App() {
  const [values, setValues] = useState([]);

  return (
    <MultiSelectAutocomplete
      allowedOptions={options}
      values={values}
      onChange={setValues}
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