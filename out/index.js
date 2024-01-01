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
var typescript_1 = __importDefault(require("typescript"));
var logger_1 = require("./logger");
function default_1(program) {
    var typeChecker = program.getTypeChecker();
    return function (context) { return function (file) {
        var _a;
        logger_1.Logger.write("\n");
        logger_1.Logger.writeLine("Transforming file '".concat(file.fileName, "' ..."));
        var decoratorExpressions = [];
        var createMetadataCall = function (type) {
            logger_1.Logger.writeLine("Constructing a metadata call.");
            var metadataValue;
            if (type.getCallSignatures().length > 0) {
                metadataValue = typescript_1.default.factory.createStringLiteral("Function");
            }
            else {
                switch (typeChecker.typeToString(type)) {
                    case "string":
                        metadataValue = typescript_1.default.factory.createStringLiteral("String");
                        break;
                    case "number":
                        metadataValue = typescript_1.default.factory.createStringLiteral("Number");
                        break;
                    case "boolean":
                        metadataValue = typescript_1.default.factory.createStringLiteral("Boolean");
                        break;
                    case "object":
                        metadataValue = typescript_1.default.factory.createStringLiteral("YOOY");
                        break;
                    default:
                        metadataValue = typescript_1.default.factory.createStringLiteral(typeChecker.typeToString(type));
                }
            }
            return metadataValue;
        };
        var processDecorators = function (classDec, methodDec, modifiers) {
            if (modifiers) {
                modifiers.forEach(function (modifier) {
                    if (typescript_1.default.isDecorator(modifier)) {
                        logger_1.Logger.writeLine("Processing decorator \"".concat(modifier.id, "\""));
                        if (methodDec) {
                            // design:type
                            logger_1.Logger.writeLine("Printing metadata decorator factories for \"".concat(modifier.id, "\" at \"").concat(classDec.name.getText(), "\""));
                            var type = typeChecker.getTypeAtLocation(methodDec);
                            var metadataValue = createMetadataCall(type);
                            decoratorExpressions.push([
                                typescript_1.default.factory.createIdentifier(classDec.name.getText()),
                                typescript_1.default.factory.createStringLiteral("design:type"),
                                metadataValue,
                                typescript_1.default.factory.createStringLiteral(methodDec.name.getText()),
                            ]);
                            // design:returntype
                            var signatures = typeChecker.getSignaturesOfType(type, typescript_1.default.SignatureKind.Call);
                            signatures.forEach(function (signature) {
                                var returnType = signature.getReturnType();
                                var metadataValue = createMetadataCall(returnType);
                                decoratorExpressions.push([
                                    typescript_1.default.factory.createIdentifier(classDec.name.getText()),
                                    typescript_1.default.factory.createStringLiteral("design:returntype"),
                                    metadataValue,
                                    typescript_1.default.factory.createStringLiteral(methodDec.name.getText()),
                                ]);
                            });
                            // design:paramtypes
                            var paramTypes_1 = [];
                            methodDec.parameters.map(function (param) {
                                var type = typeChecker.getTypeAtLocation(param);
                                var metadataValue = createMetadataCall(type);
                                paramTypes_1.push(metadataValue);
                            });
                            decoratorExpressions.push([
                                typescript_1.default.factory.createIdentifier(classDec.name.getText()),
                                typescript_1.default.factory.createStringLiteral("design:paramtypes"),
                                typescript_1.default.factory.createArrayLiteralExpression(paramTypes_1, false),
                                typescript_1.default.factory.createStringLiteral(methodDec.name.getText()),
                            ]);
                        }
                    }
                });
            }
        };
        var visit = function (node) {
            if (typescript_1.default.isMethodDeclaration(node) && node.modifiers) {
                if (node.modifiers) {
                    var parent_1 = node.parent;
                    if (typescript_1.default.isClassDeclaration(parent_1)) {
                        processDecorators(parent_1, node, node.modifiers);
                    }
                }
            }
            return typescript_1.default.visitEachChild(node, visit, context);
        };
        typescript_1.default.visitNode(file, visit);
        // const transformedFile = ts.visitNode(file, visit);
        // if (!ts.isSourceFile(transformedFile!)) {
        // Logger.error("The transformed result is not a sourcefile.")
        // }
        if (decoratorExpressions.length > 0) {
            var stmts_1 = [];
            decoratorExpressions.forEach(function (decoratorExpr) {
                stmts_1.push(typescript_1.default.factory.createExpressionStatement(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier("Reflect"), typescript_1.default.factory.createIdentifier("defineMetadata")), undefined, decoratorExpr)));
            });
            var newStatements = (_a = file.statements).concat.apply(_a, __spreadArray([], __read(stmts_1), false));
            return typescript_1.default.factory.updateSourceFile(file, newStatements);
        }
        // return transformedFile
        return file;
    }; };
}
exports.default = default_1;
