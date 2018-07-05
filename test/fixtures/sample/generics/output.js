type GenericArray = Array<string>;
declare type GenericType<T> = T | T[];

declare function genericFunction<T, R = boolean>(value: T): R;

declare interface GenericInterface<T> extends Superinterface<T>, Other<sring> {
  method<M>(param: P): Array<M>;
}

declare class GenericClass<P, S extends object = {}> extends Superclass<P> implements First<S>, Second<any> {
  method<M>(param: P): Array<M>;
}