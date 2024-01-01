import ts, { factory } from "typescript";
import { Logger } from "./logger";

export default function(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
	const typeChecker = program.getTypeChecker();
	
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
    Logger.write("\n");

    Logger.writeLine(`Transforming file '${file.fileName}' ...`)
      const createMetadataCall = (
        key: string,
        type: ts.Type,
      ): ts.ExpressionStatement => {
        let metadataValue: ts.Expression;

        if (type.getCallSignatures().length > 0) {
          metadataValue = ts.factory.createStringLiteral("Function");
        } else {
          switch (typeChecker.typeToString(type)) {
            case "string":
              metadataValue = ts.factory.createStringLiteral("String");
              break;
            case "number":
              metadataValue = ts.factory.createStringLiteral("Number");
              break;
            case "boolean":
              metadataValue = ts.factory.createStringLiteral("Boolean");
              break;
            case "object":
              metadataValue = ts.factory.createStringLiteral("YOOY");
              break;
            default:
              metadataValue = ts.factory.createStringLiteral(
                typeChecker.typeToString(type),
              );
          }
        }

        return ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("Reflect"),
              "defineMetadata",
            ),
            undefined,
            [ts.factory.createStringLiteral(key), metadataValue],
          ),
        );
      };

      const processMethod = (
        method: ts.MethodDeclaration,
      ): ts.MethodDeclaration => {
        let metadataExpressions: ts.ExpressionStatement[] = [];

        let paramTypes: ts.Expression[] = [];
        // design:paramtypes
        method.parameters.map((param) => {
          const type = typeChecker.getTypeAtLocation(param);
          // const metadataCall = createMetadataCall("design:paramtypes", type);

          let metadataValue: ts.Expression;

          if (type.getCallSignatures().length > 0) {
            metadataValue = ts.factory.createStringLiteral("Function");
          } else {
            switch (typeChecker.typeToString(type)) {
              case "string":
                metadataValue = ts.factory.createStringLiteral("String");
                break;
              case "number":
                metadataValue = ts.factory.createStringLiteral("Number");
                break;
              case "boolean":
                metadataValue = ts.factory.createStringLiteral("Boolean");
                break;
              case "object":
                metadataValue = ts.factory.createStringLiteral("YOOY");
                break;
              default:
                metadataValue = ts.factory.createStringLiteral(
                  typeChecker.typeToString(type),
                );
            }
          }

          paramTypes.push(metadataValue)
        });

 

        metadataExpressions.push(ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("Reflect"),
              "metadata",
            ),
            undefined,
            [ts.factory.createStringLiteral("design:paramtypes"), ts.factory.createArrayLiteralExpression(
              paramTypes,
              false
            )],
          ),
        ))

        // design:type
        {
          const type = typeChecker.getTypeAtLocation(method);
          const typeMetadataCall = createMetadataCall("design:type", type);
          metadataExpressions.push(typeMetadataCall);
        }

        // design:returntype
        {
          const signatures = typeChecker.getSignaturesOfType(
            typeChecker.getTypeAtLocation(method),
            ts.SignatureKind.Call,
          );
          signatures.forEach((signature) => {
            const returnType = signature.getReturnType();
            const typeMetadataCall = createMetadataCall(
              "design:returntype",
              returnType,
            );
            metadataExpressions.push(typeMetadataCall);
          });
        }

        let newBody = method.body;
        if (newBody) {
          let newArray: any[] = metadataExpressions;
          for (const element of newBody.statements) {
            newArray.push(element);
          }

          newBody = ts.factory.updateBlock(newBody, newArray);
        }

        return ts.factory.updateMethodDeclaration(
          method,
          method.modifiers,
          method.asteriskToken,
          method.name,
          method.questionToken,
          method.typeParameters,
          method.parameters,
          method.type,
          newBody,
        );
      };
    const visit: ts.Visitor = (node) => {
      node = ts.visitEachChild(node, visit, context);
      

        if (ts.isClassDeclaration(node) && node.modifiers) {
          const newMembers = node.members.map((member) => {
            if (ts.isMethodDeclaration(member)) {
              return processMethod(member);
            }

            return member;
          });

          return ts.factory.updateClassDeclaration(
            node,
            node.modifiers,
            node.name,
            node.typeParameters,
            node.heritageClauses,
            newMembers,
          );
        }

        return node
		};

		const transformedFile = ts.visitNode(file, visit);
		if (!ts.isSourceFile(transformedFile!)) {
			throw new Error("The transformed result is not a SourceFile.")
		}

		return transformedFile
	};
}
