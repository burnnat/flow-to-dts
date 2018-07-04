declare class ClassType {
  field: string;
  method(arg: boolean): OtherType;
  builder(): this;
  fn: () => void;
}

declare interface InterfaceType {
  field?: string;
  method(arg: boolean): OtherType;
  builder(): this;
  fn: () => void;
}