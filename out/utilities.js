"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCustomEnum = exports.isLiteral = exports.isObjectType = exports.isMapType = exports.isArrayType = exports.isTupleType = exports.isFunctionType = exports.isEnum = exports.seperateArray = exports.mergeArrays = void 0;
var typescript_1 = __importDefault(require("typescript"));
function mergeArrays(array1, array2) {
    return __spreadArray([], __read(new Set(__spreadArray(__spreadArray([], __read(array1), false), __read(array2), false))), false);
}
exports.mergeArrays = mergeArrays;
function seperateArray(array, predicate) {
    var nextIteration = function (array, onTrue, onFalse) {
        if (array.length === 0)
            return [onTrue, onFalse];
        var _a = __read(array), head = _a[0], tail = _a.slice(1);
        if (predicate(head))
            return nextIteration(tail, __spreadArray(__spreadArray([], __read(onTrue), false), [head], false), onFalse);
        return nextIteration(tail, onTrue, __spreadArray(__spreadArray([], __read(onFalse), false), [head], false));
    };
    return nextIteration(array, [], []);
}
exports.seperateArray = seperateArray;
function isEnum(type) {
    var _a, _b;
    return ((_b = (_a = type.aliasSymbol) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.escapedName) === "Enum";
}
exports.isEnum = isEnum;
function isFunctionType(type) {
    return type.getCallSignatures().length !== 0;
}
exports.isFunctionType = isFunctionType;
function isTupleType(type, typeChecker) {
    return typeChecker.isTupleType(type);
}
exports.isTupleType = isTupleType;
function isArrayType(type, typeChecker) {
    return typeChecker.isArrayType(type);
}
exports.isArrayType = isArrayType;
function isMapType(type) {
    var _a;
    return ((_a = type.symbol) === null || _a === void 0 ? void 0 : _a.getName()) === "Map";
}
exports.isMapType = isMapType;
function isObjectType(type) {
    var _a;
    return ((_a = type.symbol) === null || _a === void 0 ? void 0 : _a.getName()) === "__type";
}
exports.isObjectType = isObjectType;
function isLiteral(typeChecker) {
    return function (type) { return type.isLiteral() || ["true", "false"].includes(typeChecker.typeToString(type)); };
}
exports.isLiteral = isLiteral;
function isCustomEnum(type) {
    var _a, _b;
    return ((_b = (_a = type.symbol) === null || _a === void 0 ? void 0 : _a.valueDeclaration) === null || _b === void 0 ? void 0 : _b.kind) === typescript_1.default.SyntaxKind.EnumDeclaration;
}
exports.isCustomEnum = isCustomEnum;
