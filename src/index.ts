import ts, { factory } from "typescript";
import { Logger } from "./logger";

export default function (program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
	const typeChecker = program.getTypeChecker();

	return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
		Logger.write("\n");

		Logger.writeLine(`Transforming file '${file.fileName}' ...`);

		const decoratorExpressions: any[] = [];

		const createMetadataCall = (type: ts.Type) => {
			Logger.writeLine("Constructing a metadata call.");

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
						metadataValue = ts.factory.createStringLiteral(typeChecker.typeToString(type));
				}
			}

			return metadataValue;
		};

		const processDecorators = (
			classDec: ts.ClassDeclaration,
			methodDec: ts.MethodDeclaration,
			modifiers: ts.NodeArray<ts.ModifierLike>,
		) => {
			if (modifiers) {
				modifiers.forEach((modifier) => {
					if (ts.isDecorator(modifier)) {
						Logger.writeLine(`Processing decorator "${modifier.id}"`);

						if (methodDec) {
							// design:type

							Logger.writeLine(
								`Printing metadata decorator factories for "${
									modifier.id
								}" at "${classDec.name!.getText()}"`,
							);

							const type = typeChecker.getTypeAtLocation(methodDec);
							const metadataValue = createMetadataCall(type);

							decoratorExpressions.push([
								ts.factory.createIdentifier(classDec.name!.getText()),
								ts.factory.createStringLiteral("design:type"),
								metadataValue,
								ts.factory.createStringLiteral(methodDec.name.getText()),
							]);

							// design:returntype
							const signatures = typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
							signatures.forEach((signature) => {
								const returnType = signature.getReturnType();
								const metadataValue = createMetadataCall(returnType);

								decoratorExpressions.push([
									ts.factory.createIdentifier(classDec.name!.getText()),
									ts.factory.createStringLiteral("design:returntype"),
									metadataValue,
									ts.factory.createStringLiteral(methodDec.name.getText()),
								]);
							});

							// design:paramtypes
							let paramTypes: ts.Expression[] = [];
							methodDec.parameters.map((param) => {
								const type = typeChecker.getTypeAtLocation(param);
								const metadataValue = createMetadataCall(type);

								paramTypes.push(metadataValue);
							});

							decoratorExpressions.push([
								ts.factory.createIdentifier(classDec.name!.getText()),
								ts.factory.createStringLiteral("design:paramtypes"),
								ts.factory.createArrayLiteralExpression(paramTypes, false),
								ts.factory.createStringLiteral(methodDec.name.getText()),
							]);
						}
					}
				});
			}
		};

		const visit: ts.Visitor = (node) => {
			if (ts.isMethodDeclaration(node) && node.modifiers) {
				if (node.modifiers) {
					const parent = node.parent;
					if (ts.isClassDeclaration(parent)) {
						processDecorators(parent, node, node.modifiers);
					}
				}
			}

			return ts.visitEachChild(node, visit, context);
		};

		ts.visitNode(file, visit);
		// const transformedFile = ts.visitNode(file, visit);
		// if (!ts.isSourceFile(transformedFile!)) {
		// Logger.error("The transformed result is not a sourcefile.")
		// }

		if (decoratorExpressions.length > 0) {
			let stmts: any[] = [];
			decoratorExpressions.forEach((decoratorExpr) => {
				stmts.push(
					ts.factory.createExpressionStatement(
						ts.factory.createCallExpression(
							ts.factory.createPropertyAccessExpression(
								ts.factory.createIdentifier("Reflect"),
								ts.factory.createIdentifier("defineMetadata"),
							),
							undefined,
							decoratorExpr,
						),
					),
				);
			});

			const newStatements = file.statements.concat(...stmts);
			return ts.factory.updateSourceFile(file, newStatements);
		}

		// return transformedFile
		return file;
	};
}
