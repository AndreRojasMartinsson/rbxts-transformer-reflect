import ts from "typescript";

export function mergeArrays<T>(array1: T[], array2: T[]): T[] {
	return [...new Set([...array1, ...array2])]
}

export function seperateArray<T>(array: T[], predicate: (element: T) => boolean): [T[], T[]] {
	const nextIteration = (array: T[], onTrue: T[], onFalse: T[]): [T[], T[]] => {
		if (array.length === 0) return [onTrue, onFalse]

		const [head, ...tail] = array;
		if (predicate(head)) return nextIteration(tail, [...onTrue, head], onFalse)

		return nextIteration(tail, onTrue, [...onFalse, head])
	}

	return nextIteration(array, [], [])
}

export function isEnum(type: ts.Type): boolean {
	return (<any>type.aliasSymbol)?.parent?.escapedName === "Enum";
}

export function isFunctionType(type: ts.Type): boolean {

	return type.getCallSignatures().length !== 0
}

export function isTupleType(type: ts.Type, typeChecker: ts.TypeChecker): type is ts.TupleType {
	return (<any>typeChecker).isTupleType(type)
}
export function isArrayType(type: ts.Type, typeChecker: ts.TypeChecker): type is ts.GenericType {

	return (<any>typeChecker).isArrayType(type)
}

export function isMapType(type: ts.Type): type is ts.GenericType {
	return type.symbol?.getName() === "Map"
}


export function isObjectType(type: ts.Type): type is ts.ObjectType {

	return type.symbol?.getName() === "__type"
}

export function isLiteral(typeChecker: ts.TypeChecker): (type: ts.Type) => boolean {
	return (type: ts.Type): boolean => type.isLiteral() || ["true", "false"].includes(typeChecker.typeToString(type))
}

export function isCustomEnum(type: ts.Type) {
    return type.symbol?.valueDeclaration?.kind === ts.SyntaxKind.EnumDeclaration
}