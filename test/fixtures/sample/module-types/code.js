declare module "directexport" {
  declare module.exports: MyModule;
}

declare module "defaultexport" {
  declare class Item {
    length: number;
    hasField(name: string): boolean;
  }
  
  declare export default typeof Item;
}

declare module "nonexport" {
  declare type Custom = string | number;

  declare class Item {
    length: number;
    hasField(name: string): boolean;
  }

  declare interface Other {
    value?: number;
    method(foo: Item[]): void;
  }

  declare function concat(first: Custom, second: Other): Item;
}

declare module "fullexport" {
  declare export type Custom = string | number;

  declare export class Item {
    length: number;
    hasField(name: string): boolean;
  }

  declare export interface Other {
    value?: number;
    method(foo: Item[]): void;
  }

  declare export function concat(first: Custom, second: Other): Item;
}