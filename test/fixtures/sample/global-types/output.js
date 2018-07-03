export = MyModule
type _export = typeof MyModule;
export = _export

declare class DeclaredClass {
  hasField(name: string): boolean;
}

declare function globalFunc(first: DeclaredType, second: string): DeclaredClass;