type Exact = {
  name: string,
  age: number
};

type Readonly = {
  readonly key: boolean
};

type Extended = {
  name: string,
  age?: number,
  [field: string]: any
};

type ExtendedReserved = {
  field: string,
  value: any,
  [field: string]: any
};
