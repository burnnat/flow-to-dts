# flow-to-dts
[![flow-to-dts](https://img.shields.io/npm/v/flow-to-dts.svg)](https://www.npmjs.com/package/flow-to-dts) [![Build Status](https://travis-ci.org/burnnat/flow-to-dts.svg?branch=master)](https://travis-ci.org/burnnat/flow-to-dts) [![Coverage Status](https://coveralls.io/repos/github/burnnat/flow-to-dts/badge.svg?branch=master)](https://coveralls.io/github/burnnat/flow-to-dts?branch=master)

Convert [Flow libdefs](https://flow.org/en/docs/libdefs/) to [Typescript declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html).

**This tool is currently pre-alpha.** Contribution of issues, suggesions, and pull requests are welcome!

# Usage
## Command Line
```
flow-to-dts input.flow.js output.d.ts
```

## Node API
Transforming a code string:
```js
import { transform } from 'flow-to-dts';

const input = 'type MyCode';

transform(input).then((output) => console.log(output));
```

Transforming an AST:
```js
import { parse } from '@babel/parser';
import { transformAst } from 'flow-to-dts';

const input = parse('type MyCode');

transformAst(input).then((output) => console.log(JSON.stringify(output)));
```

# Supported Features
(Note that this is not intended as an exhaustive list, but merely a representative sample indicating some of the key transformations performed by the tool.)

| Feature          | Supported          | Flow                                | Typescript                                        |
|------------------|--------------------|-------------------------------------|---------------------------------------------------|
| Flow Header      | :heavy_check_mark: | `// @flow`                          | `// `                                             |
| Module Exports   | :heavy_check_mark: | `declare module.exports: MyModule;` | `export = MyModule;`                              |
| Mixed Type       | :heavy_check_mark: | `mixed`                             | `number \| string \| boolean \| symbol \| object` |
| Nullable Types   | :heavy_check_mark: | `?string`                           | `string \| null \| undefined`                     |
| Exact Objects    | :heavy_check_mark: | `{\| name: string \|}`              | `{ name: string }`                                |
| Open Objects     | :heavy_check_mark: | `{ name: string }`                  | `{ name: string; [field: string]: any }`          |
| Class Types      | :heavy_check_mark: | `Class<SomeType>`                   | `typeof SomeType`                                 |
| Key Types        | :x:                | `$Keys<A>`                          |                                                   |
| Value Types      | :x:                | `$Values<A>`                        |                                                   |
| Difference Types | :x:                | `$Diff<A>`                          |                                                   |
| Partial Types    | :heavy_check_mark: | `$Shape<A>`                         | `Partial<A>`                                      |
| Rest Types       | :x:                | `$Rest<A>`                          |                                                   |
| Supertypes       | :x:                | `$Supertype<A>`                     |                                                   |
| Subtypes         | :x:                | `$Subtype<A>`                       |                                                   |
| Existential Type | :heavy_check_mark: | `*`                                 | `any`                                             |

# Acknowledgements
Special thanks to the creators and maintainers of the following projects that made this tool possible:

- [`astexplorer`](https://astexplorer.net/)
- [`babel`](https://babeljs.io/)
- [`babel-handbook`](https://github.com/jamiebuilds/babel-handbook)
- [`babel-plugin-tester`](https://github.com/babel-utils/babel-plugin-tester)
- [`flow-typed`](https://github.com/flow-typed/flow-typed)
- [`recast`](https://github.com/benjamn/recast)
- [`typescript-vs-flowtype`](https://github.com/niieani/typescript-vs-flowtype)
- [`yargs`](https://yargs.js.org/)