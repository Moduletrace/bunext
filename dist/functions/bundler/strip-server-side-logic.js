import ts from "typescript";
export default function stripServerSideLogic({ txt_code }) {
    const sourceFile = ts.createSourceFile("temp.tsx", txt_code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const transformer = (context) => {
        return (rootNode) => {
            const visitor = (node) => {
                if (ts.isVariableStatement(node) &&
                    node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
                    const isServerExport = node.declarationList.declarations.some((d) => ts.isIdentifier(d.name) &&
                        d.name.text === "server");
                    if (isServerExport)
                        return undefined; // Remove it
                }
                return ts.visitEachChild(node, visitor, context);
            };
            return ts.visitNode(rootNode, visitor);
        };
    };
    const result = ts.transform(sourceFile, [transformer]);
    const printer = ts.createPrinter();
    const strippedCode = printer.printFile(result.transformed[0]);
    const cleanSourceFile = ts.createSourceFile("clean.tsx", strippedCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    // Simple reference check: if a named import isn't found in the text, drop it
    const cleanupTransformer = (context) => {
        return (rootNode) => {
            const visitor = (node) => {
                if (ts.isImportDeclaration(node)) {
                    const clause = node.importClause;
                    if (!clause)
                        return node;
                    // Handle named imports like { BunextPageProps, BunextPageServerFn }
                    if (clause.namedBindings &&
                        ts.isNamedImports(clause.namedBindings)) {
                        const activeElements = clause.namedBindings.elements.filter((el) => {
                            const name = el.name.text;
                            // Check if the name appears anywhere else in the file
                            const regex = new RegExp(`\\b${name}\\b`, "g");
                            const matches = strippedCode.match(regex);
                            return matches && matches.length > 1; // 1 for the import itself, >1 for usage
                        });
                        if (activeElements.length === 0)
                            return undefined;
                        return ts.factory.updateImportDeclaration(node, node.modifiers, ts.factory.updateImportClause(clause, clause.isTypeOnly, clause.name, ts.factory.createNamedImports(activeElements)), node.moduleSpecifier, node.attributes);
                    }
                    // Handle default imports like 'import BunSQLite'
                    if (clause.name) {
                        const name = clause.name.text;
                        const regex = new RegExp(`\\b${name}\\b`, "g");
                        const matches = strippedCode.match(regex);
                        if (!matches || matches.length <= 1)
                            return undefined;
                    }
                }
                return ts.visitEachChild(node, visitor, context);
            };
            return ts.visitNode(rootNode, visitor);
        };
    };
    const finalResult = ts.transform(cleanSourceFile, [cleanupTransformer]);
    return printer.printFile(finalResult.transformed[0]);
}
