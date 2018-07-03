declare module "directexport" {
  export = MyModule
}

declare module "defaultexport" {
  class Item {
    length: number;
    hasField(name: string): boolean;
  }

  type _export = typeof Item;
  export default _export;
}

declare module "nonexport" {
  type Custom = string | number;

  class Item {
    length: number;
    hasField(name: string): boolean;
  }

  function concat(first: string, second: string): Item
}

declare module "fullexport" {
  export type Custom = string | number;

  export class Item {
    length: number;
    hasField(name: string): boolean;
  }

  export function concat(first: string, second: string): Item;
}