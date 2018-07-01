# flow-to-dts
[![flow-to-dts](https://img.shields.io/npm/v/flow-to-dts.svg)](https://www.npmjs.com/package/flow-to-dts) [![Build Status](https://travis-ci.org/burnnat/flow-to-dts.svg?branch=master)](https://travis-ci.org/burnnat/flow-to-dts) [![Coverage Status](https://coveralls.io/repos/github/burnnat/flow-to-dts/badge.svg?branch=master)](https://coveralls.io/github/burnnat/flow-to-dts?branch=master)

Convert [Flow libdefs](https://flow.org/en/docs/libdefs/) to Typescript .d.ts definitions.

**This tool is currently pre-alpha.** Contribution of issues, suggesions, and pull requests are welcome!

# Usage
## Command Line
```
flow-to-dts input.flow.js output.d.ts
```

## Node API
```js
import transform from 'flow-to-dts';

cosnt input = 'type MyCode';

transform(input).then((output) => console.log(output));
```

# Supported Features
| Feature          | Status             | Flow                                | Typescript                               |
|------------------|--------------------|-------------------------------------|------------------------------------------|
| Flow Header      | :heavy_check_mark: | `// @flow`                          | `// `                                    |
| Module Exports   | :heavy_check_mark: | `declare module.exports: MyModule;` | `export = MyModule;`                     |
| Nullable Types   | :heavy_check_mark: | `?string`                           | `string | null | undefined`              |
| Class Types      | :heavy_check_mark: | `Class<SomeType>`                   | `typeof SomeType`                        |
| Exact Objects    | :heavy_check_mark: | `{| name: string |}`                | `{ name: string }`                       |
| Open Objects     | :heavy_check_mark: | `{ name: string }`                  | `{ name: string; [field: string]: any }` |
| Key Types        | :x:                | `$Keys<A>`                          |                                          |
| Value Types      | :x:                | `$Values<A>`                        |                                          |
| Difference Types | :x:                | `$Diff<A>`                          |                                          |
| Rest Types       | :x:                | `$Rest<A>`                          |                                          |
| Supertypes       | :x:                | `$Supertype<A>`                     |                                          |
| Subtypes         | :x:                | `$Subtype<A>`                       |                                          |
| Existential Type | :x:                | `*`                                 |                                          |
