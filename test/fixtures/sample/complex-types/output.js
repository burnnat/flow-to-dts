type NullableType = string | null | undefined;
type UnionType = NullableType | boolean;
type TupleType = [number, string];
type ArrayType = UnionType[];
type FunctionType = (arg1: string, arg2: number) => boolean;
type UnionOfFunctionsType = (() => void) | ((arg: UnionType) => string);
type ClassType = typeof OtherType;
type PartialType = Partial<OtherType>;
type TypeofType = typeof Other;
type ComplexTypeofType = typeof Other.Child;