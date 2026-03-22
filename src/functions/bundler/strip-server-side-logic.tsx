import path from "path";
import ts from "typescript";

type Params = {
    txt_code: string;
    file_path: string;
};

export default function stripServerSideLogic({ txt_code, file_path }: Params) {
    const sourceFile = ts.createSourceFile(
        "file.tsx",
        txt_code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
    );
    const printer = ts.createPrinter();
    const file_fir_name = path.dirname(file_path);

    const transformer: ts.TransformerFactory<ts.SourceFile> =
        (context) => (rootNode) => {
            const visitor = (node: ts.Node): ts.Node | undefined => {
                // 1. Strip the 'server' export
                if (
                    ts.isVariableStatement(node) &&
                    node.modifiers?.some(
                        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
                    )
                ) {
                    const isServer = node.declarationList.declarations.some(
                        (d) =>
                            ts.isIdentifier(d.name) && d.name.text === "server",
                    );
                    if (isServer) return undefined;
                }

                // 2. Convert relative imports to absolute imports
                if (ts.isImportDeclaration(node)) {
                    const moduleSpecifier = node.moduleSpecifier;
                    if (
                        ts.isStringLiteral(moduleSpecifier) &&
                        moduleSpecifier.text.startsWith(".")
                    ) {
                        // Resolve the relative path to an absolute filesystem path
                        const absolutePath = path.resolve(
                            file_fir_name,
                            moduleSpecifier.text,
                        );

                        return ts.factory.updateImportDeclaration(
                            node,
                            node.modifiers,
                            node.importClause,
                            ts.factory.createStringLiteral(absolutePath),
                            node.attributes,
                        );
                    }
                }

                return ts.visitEachChild(node, visitor, context);
            };
            return ts.visitNode(rootNode, visitor) as ts.SourceFile;
        };

    const result = ts.transform(sourceFile, [transformer]);
    const intermediate = printer.printFile(result.transformed[0]);

    // Pass 2: Cleanup unused imports (Same logic as before)
    const cleanSource = ts.createSourceFile(
        "clean.tsx",
        intermediate,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
    );
    const cleanup: ts.TransformerFactory<ts.SourceFile> =
        (context) => (rootNode) => {
            const visitor = (node: ts.Node): ts.Node | undefined => {
                if (ts.isImportDeclaration(node)) {
                    const clause = node.importClause;
                    if (!clause) return node;

                    if (
                        clause.namedBindings &&
                        ts.isNamedImports(clause.namedBindings)
                    ) {
                        const used = clause.namedBindings.elements.filter(
                            (el) => {
                                const regex = new RegExp(
                                    `\\b${el.name.text}\\b`,
                                    "g",
                                );
                                return (
                                    (intermediate.match(regex) || []).length > 1
                                );
                            },
                        );
                        if (used.length === 0) return undefined;
                        return ts.factory.updateImportDeclaration(
                            node,
                            node.modifiers,
                            ts.factory.updateImportClause(
                                clause,
                                clause.isTypeOnly,
                                clause.name,
                                ts.factory.createNamedImports(used),
                            ),
                            node.moduleSpecifier,
                            node.attributes,
                        );
                    }

                    if (clause.name) {
                        const regex = new RegExp(
                            `\\b${clause.name.text}\\b`,
                            "g",
                        );
                        if ((intermediate.match(regex) || []).length <= 1)
                            return undefined;
                    }
                }
                return ts.visitEachChild(node, visitor, context);
            };
            return ts.visitNode(rootNode, visitor) as ts.SourceFile;
        };

    const final = ts.transform(cleanSource, [cleanup]);
    return printer.printFile(final.transformed[0]);
}
