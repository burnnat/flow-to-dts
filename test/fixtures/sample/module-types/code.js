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

  declare function concat(first: string, second: string): Item;
}

declare module "fullexport" {
  declare export type Custom = string | number;

  declare export class Item {
    length: number;
    hasField(name: string): boolean;
  }

  declare export function concat(first: string, second: string): Item;
}