type NullableType = ?string;
type UnionType = NullableType | boolean;
type FunctionType = (arg1: string, arg2: number) => boolean;
type UnionOfFunctionsType = (() => void) | (arg: UnionType) => string;
type ClassType = Class<OtherType>;