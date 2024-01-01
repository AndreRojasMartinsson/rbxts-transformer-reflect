"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
        logger_1.Logger.write("\n");
        logger_1.Logger.writeLine("Transforming file '".concat(file.fileName, "' ..."));
        var createMetadataCall = function (key, member, classNode, type) {
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
            return typescript_1.default.factory.createExpressionStatement(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier("Reflect"), "defineMetadata"), undefined, [typescript_1.default.factory.createIdentifier(classNode.name.getText()), typescript_1.default.factory.createStringLiteral(key), metadataValue, typescript_1.default.factory.createStringLiteral(member.name.getText())]));
        };
        var processMethod = function (classDec, method) {
            var e_1, _a;
            var metadataExpressions = [];
            var paramTypes = [];
            // design:paramtypes
            method.parameters.map(function (param) {
                var type = typeChecker.getTypeAtLocation(param);
                // const metadataCall = createMetadataCall("design:paramtypes", type);
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
                paramTypes.push(metadataValue);
            });
            metadataExpressions.push(typescript_1.default.factory.createExpressionStatement(typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier("Reflect"), "metadata"), undefined, [typescript_1.default.factory.createStringLiteral("design:paramtypes"), typescript_1.default.factory.createArrayLiteralExpression(paramTypes, false)])));
            // design:type
            {
                var type = typeChecker.getTypeAtLocation(method);
                var typeMetadataCall = createMetadataCall("design:type", method, classDec, type);
                metadataExpressions.push(typeMetadataCall);
            }
            // design:returntype
            {
                var signatures = typeChecker.getSignaturesOfType(typeChecker.getTypeAtLocation(method), typescript_1.default.SignatureKind.Call);
                signatures.forEach(function (signature) {
                    var returnType = signature.getReturnType();
                    var typeMetadataCall = createMetadataCall("design:returntype", method, classDec, returnType);
                    metadataExpressions.push(typeMetadataCall);
                });
            }
            var newBody = method.body;
            if (newBody) {
                var newArray = metadataExpressions;
                try {
                    for (var _b = __values(newBody.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var element = _c.value;
                        newArray.push(element);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                newBody = typescript_1.default.factory.updateBlock(newBody, newArray);
            }
            return typescript_1.default.factory.updateMethodDeclaration(method, method.modifiers, method.asteriskToken, method.name, method.questionToken, method.typeParameters, method.parameters, method.type, newBody);
        };
        var visit = function (node) {
            node = typescript_1.default.visitEachChild(node, visit, context);
            if (typescript_1.default.isClassDeclaration(node) && node.modifiers) {
                var newMembers = node.members.map(function (member) {
                    if (typescript_1.default.isMethodDeclaration(member)) {
                        return processMethod(node, member);
                    }
                    return member;
                });
                return typescript_1.default.factory.updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters, node.heritageClauses, newMembers);
            }
            return node;
        };
        var transformedFile = typescript_1.default.visitNode(file, visit);
        if (!typescript_1.default.isSourceFile(transformedFile)) {
            throw new Error("The transformed result is not a SourceFile.");
        }
        return transformedFile;
    }; };
}
exports.default = default_1;
