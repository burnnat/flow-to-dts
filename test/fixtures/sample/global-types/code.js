declare module.exports: MyModule;
declare module.exports: Class<MyModule>;
// declare type DeclaredType = string | number;
declare class DeclaredClass {
  hasField(name: string): boolean;
}

declare function globalFunc(first: DeclaredType, second: string): DeclaredClass;