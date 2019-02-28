type Exact = {|
  name: string,
  age: number
|};

type Readonly = {|
  +key: boolean
|};

type Extended = {
  name: string,
  age?: number
};

type ExtendedReserved = {
  field: string,
  value: any
};