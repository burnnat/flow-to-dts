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
  type GenericCustom<T> = T & Item;

  class Item {
    length: number;
    hasField(name: string): boolean;
  }

  interface Other {
    value?: number;
    method(foo: Item[]): void;
  }

  function concat(first: Custom, second: Other): Item
}

declare module "fullexport" {
  export type Custom = string | number;
  export type GenericCustom<T> = T & Item;

  export class Item {
    length: number;
    hasField(name: string): boolean;
  }

  export interface Other {
    value?: number;
    method(foo: Item[]): void;
  }

  export function concat(first: Custom, second: Other): Item;
}