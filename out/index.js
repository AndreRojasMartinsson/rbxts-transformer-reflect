"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_1 = __importStar(require("typescript"));
var logger_1 = require("./logger");
function default_1(program) {
    var typeChecker = program.getTypeChecker();
    return function (context) { return function (file) {
        logger_1.Logger.write("\n");
        logger_1.Logger.writeLine("Transforming file '".concat(file.fileName, "' ..."));
        var decoratorExpressions = [];
        var createMetadataCall = function (key, type) {
            logger_1.Logger.writeLine("Constructing a metadata call.");
            var metadataValue;
            if (type.getCallSignatures().length > 0) {
                metadataValue = typescript_1.factory.createIdentifier("Function");
            }
            else {
                switch (typeChecker.typeToString(type)) {
                    case "string":
                        metadataValue = typescript_1.factory.createIdentifier("String");
                        break;
                    case "number":
                        metadataValue = typescript_1.factory.createIdentifier("Number");
                        break;
                    case "boolean":
                        metadataValue = typescript_1.factory.createIdentifier("Boolean");
                        break;
                    case "object":
                        metadataValue = typescript_1.factory.createIdentifier("YOOY");
                        break;
                    default:
                        metadataValue = typescript_1.factory.createIdentifier(typeChecker.typeToString(type));
                }
            }
            return typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("__metadata"), undefined, [typescript_1.factory.createStringLiteral(key), metadataValue]);
        };
        var processDecorators = function (modifiers) {
            if (modifiers) {
                modifiers.forEach(function (modifier) {
                    if (typescript_1.default.isDecorator(modifier)) {
                        logger_1.Logger.writeLine("Processing decorator \"".concat(modifier.id, "\""));
                        decoratorExpressions.push(modifier.expression);
                        var parent_1 = modifier.parent;
                        if (typescript_1.default.isMethodDeclaration(parent_1)) {
                            logger_1.Logger.writeLine("Printing metadata decorator factories for \"".concat(modifier.id, "\" at \"").concat(parent_1.name.getText(), "\""));
                            var type = typeChecker.getTypeAtLocation(parent_1);
                            decoratorExpressions.push(createMetadataCall("design:type", type));
                            // design:returntype
                            var signatures = typeChecker.getSignaturesOfType(typeChecker.getTypeAtLocation(parent_1), typescript_1.default.SignatureKind.Call);
                            signatures.forEach(function (signature) {
                                var returnType = signature.getReturnType();
                                var typeMetadataCall = createMetadataCall("design:returntype", returnType);
                                decoratorExpressions.push(typeMetadataCall);
                            });
                            var paramTypes_1 = [];
                            // design:paramtypes
                            parent_1.parameters.map(function (param) {
                                var type = typeChecker.getTypeAtLocation(param);
                                // const metadataCall = createMetadataCall("design:paramtypes", type);
                                var metadataValue;
                                if (type.getCallSignatures().length > 0) {
                                    metadataValue = typescript_1.factory.createIdentifier("Function");
                                }
                                else {
                                    switch (typeChecker.typeToString(type)) {
                                        case "string":
                                            metadataValue = typescript_1.factory.createIdentifier("String");
                                            break;
                                        case "number":
                                            metadataValue = typescript_1.factory.createIdentifier("Number");
                                            break;
                                        case "boolean":
                                            metadataValue = typescript_1.factory.createIdentifier("Boolean");
                                            break;
                                        case "object":
                                            metadataValue = typescript_1.factory.createIdentifier("YOOY");
                                            break;
                                        default:
                                            metadataValue = typescript_1.factory.createIdentifier(typeChecker.typeToString(type));
                                    }
                                }
                                paramTypes_1.push(metadataValue);
                            });
                            decoratorExpressions.push(typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("__metadata"), undefined, [
                                typescript_1.factory.createStringLiteral("design:paramtypes"),
                                typescript_1.factory.createArrayLiteralExpression(paramTypes_1, false),
                            ]));
                        }
                    }
                });
            }
        };
        var visit = function (node) {
            if (typescript_1.default.isClassDeclaration(node) ||
                typescript_1.default.isMethodDeclaration(node) ||
                typescript_1.default.isPropertyDeclaration(node) ||
                typescript_1.default.isParameter(node)) {
                if (node.modifiers) {
                    processDecorators(node.modifiers);
                }
            }
            return typescript_1.default.visitEachChild(node, visit, context);
        };
        var transformedFile = typescript_1.default.visitNode(file, visit);
        if (!typescript_1.default.isSourceFile(transformedFile)) {
            throw new Error("The transformed result is not a SourceFile.");
        }
        return transformedFile;
    }; };
}
exports.default = default_1;
