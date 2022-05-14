# Note

## Debug

in `package.json`, `"main": "./dist/extension.js"` determines the entry point of the extension.
when debugging in VSCode, `"main"` needs to be changed to `"main": "./out/extension.js"` to hit the breakpoint, and set back to `"main": "./dist/extension.js"` after debugging.
