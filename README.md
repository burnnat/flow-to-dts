# flow-to-dts
[![flow-to-dts](https://img.shields.io/npm/v/flow-to-dts.svg)](https://www.npmjs.com/package/flow-to-dts) [![Build Status](https://travis-ci.org/burnnat/flow-to-dts.svg?branch=master)](https://travis-ci.org/burnnat/flow-to-dts) [![Coverage Status](https://coveralls.io/repos/github/burnnat/flow-to-dts/badge.svg?branch=master)](https://coveralls.io/github/burnnat/flow-to-dts?branch=master)

Convert Flow libdef files to Typescript .d.ts definitions.

# Usage
## Command Line
```
flow-to-dts input.flow.js output.d.ts
```

## Node API
```js
import transform from 'flow-to-dts';

cosnt input = 'type MyCode';

transform(input, (output) => console.log(output));
```
