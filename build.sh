#!/bin/bash
set -e

ENTRY="./lib/PreactCombobox.jsx"
ESM_OPTS="--format=esm --external:preact --external:@popperjs/core"
CJS_OPTS="--format=cjs --external:react"
COMMON_OPTS="--bundle --jsx-factory=h --jsx-fragment=Fragment --jsx=automatic --sourcemap"

rm -fr dist lib/*.d.ts

# ESM build
esbuild $ENTRY --outdir=dist/esm $ESM_OPTS $COMMON_OPTS

# CJS build (with React externalized for compat)
esbuild $ENTRY --outdir=dist/cjs $CJS_OPTS $COMMON_OPTS

# Remove CSS sourcemaps (single file, not useful)
rm -f dist/esm/PreactCombobox.css.map dist/cjs/PreactCombobox.css.map
sed -i '/\/\*# sourceMappingURL/d' dist/esm/PreactCombobox.css dist/cjs/PreactCombobox.css

# Generate and copy type declarations
tsc
cp lib/PreactCombobox.d.ts dist/esm/
cp lib/PreactCombobox.d.ts dist/cjs/
