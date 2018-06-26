# flow-to-dts
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
