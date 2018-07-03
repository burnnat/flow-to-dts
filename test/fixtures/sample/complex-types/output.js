type NullableType = string | null | undefined;
type UnionType = NullableType | boolean;
type FunctionType = (arg1: string, arg2: number) => boolean;
type UnionOfFunctionsType = (() => void) | ((arg: UnionType) => string);
type ClassType = typeof OtherType;
type PartialType = Partial<OtherType>;