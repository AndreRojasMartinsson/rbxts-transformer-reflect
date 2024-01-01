import ts, { factory } from "typescript";
import { Logger } from "./logger";

export default function(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
	const typeChecker = program.getTypeChecker();
	
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
    Logger.write("\n");

    Logger.writeLine(`Transforming file '${file.fileName}' ...`)

     const decoratorExpressions: any[] = [];

    const createMetadataCall = (key: string, type: ts.Type) => {
        Logger.writeLine("Constructing a metadata call.")
        let metadataValue: ts.Expression;

        if (type.getCallSignatures().length > 0) {
          metadataValue = factory.createIdentifier("Function");
        } else {
          switch (typeChecker.typeToString(type)) {
            case "string":
              metadataValue = factory.createIdentifier("String");
              break;
            case "number":
              metadataValue = factory.createIdentifier("Number");
              break;
            case "boolean":
              metadataValue = factory.createIdentifier("Boolean");
              break;
            case "object":
              metadataValue = factory.createIdentifier("YOOY");
              break;
            default:
              metadataValue = factory.createIdentifier(
                typeChecker.typeToString(type),
              );
          }
        }

        return factory.createCallExpression(
          factory.createIdentifier("__metadata"),
          undefined,
          [factory.createStringLiteral(key), metadataValue],
        );
      };

    const processDecorators = (modifiers: ts.NodeArray<ts.ModifierLike>) => {
      if (modifiers) {
        modifiers.forEach((modifier) => {
          if (ts.isDecorator(modifier)) {
              Logger.writeLine(`Processing decorator "${modifier.id}"`)
              decoratorExpressions.push(modifier.expression);

              const parent = modifier.parent;
            if (ts.isMethodDeclaration(parent)) {
                
              Logger.writeLine(`Printing metadata decorator factories for "${modifier.id}" at "${parent.name.getText()}"`)

                const type = typeChecker.getTypeAtLocation(parent);
                decoratorExpressions.push(
                  createMetadataCall("design:type", type),
                );

                // design:returntype
                const signatures = typeChecker.getSignaturesOfType(
                  typeChecker.getTypeAtLocation(parent),
                  ts.SignatureKind.Call,
                );

                signatures.forEach((signature) => {
                  const returnType = signature.getReturnType();
                  const typeMetadataCall = createMetadataCall(
                    "design:returntype",
                    returnType,
                  );
                  decoratorExpressions.push(typeMetadataCall);
                });

                let paramTypes: ts.Expression[] = [];
                // design:paramtypes
                parent.parameters.map((param) => {
                  const type = typeChecker.getTypeAtLocation(param);
                  // const metadataCall = createMetadataCall("design:paramtypes", type);

                  let metadataValue: ts.Expression;

                  if (type.getCallSignatures().length > 0) {
                    metadataValue = factory.createIdentifier("Function");
                  } else {
                    switch (typeChecker.typeToString(type)) {
                      case "string":
                        metadataValue = factory.createIdentifier("String");
                        break;
                      case "number":
                        metadataValue = factory.createIdentifier("Number");
                        break;
                      case "boolean":
                        metadataValue = factory.createIdentifier("Boolean");
                        break;
                      case "object":
                        metadataValue = factory.createIdentifier("YOOY");
                        break;
                      default:
                        metadataValue = factory.createIdentifier(
                          typeChecker.typeToString(type),
                        );
                    }
                  }

                  paramTypes.push(metadataValue);
                });

                decoratorExpressions.push(
                  factory.createCallExpression(
                    factory.createIdentifier("__metadata"),
                    undefined,
                    [
                      factory.createStringLiteral("design:paramtypes"),
                      factory.createArrayLiteralExpression(
                        paramTypes,
                        false,
                      ),
                    ],
                  ),
                );
              }
            }
          });
        }
      };

		const visit: ts.Visitor = (node) => {
       if (
          ts.isClassDeclaration(node) ||
          ts.isMethodDeclaration(node) ||
          ts.isPropertyDeclaration(node) ||
          ts.isParameter(node)
        ) {
          if (node.modifiers) {
            processDecorators(node.modifiers);
          }
        }

        return ts.visitEachChild(node, visit, context);
		};

		const transformedFile = ts.visitNode(file, visit);
		if (!ts.isSourceFile(transformedFile!)) {
			throw new Error("The transformed result is not a SourceFile.")
		}

		return transformedFile
	};
}
