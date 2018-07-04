type NullableType = ?string;
type UnionType = NullableType | boolean;
type ArrayType = UnionType[];
type FunctionType = (arg1: string, arg2: number) => boolean;
type UnionOfFunctionsType = (() => void) | (arg: UnionType) => string;
type ClassType = Class<OtherType>;
type PartialType = $Shape<OtherType>;
type TypeofType = typeof Other;
type ComplexTypeofType = typeof Other.Child;