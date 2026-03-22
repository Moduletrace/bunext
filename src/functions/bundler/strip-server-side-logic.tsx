import path from "path";
import ts from "typescript";

type Params = {
    txt_code: string;
    file_path: string;
};

export default function stripServerSideLogic({ txt_code, file_path }: Params) {
    const file_dir_name = path.dirname(file_path);

    // 1. Initial Parse of the source
    const sourceFile = ts.createSourceFile(
        "file.tsx",
        txt_code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
    );
    const printer = ts.createPrinter();

    /**
     * PASS 1: Remove 'server' export and resolve absolute paths
     */
    const stripTransformer: ts.TransformerFactory<ts.SourceFile> =
        (context) => (rootNode) => {
            const visitor = (node: ts.Node): ts.Node | undefined => {
                // Remove 'export const server'
                if (
                    ts.isVariableStatement(node) &&
                    node.modifiers?.some(
                        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
                    )
                ) {
                    if (
                        node.declarationList.declarations.some(
                            (d) =>
                                ts.isIdentifier(d.name) &&
                                d.name.text === "server",
                        )
                    ) {
                        return undefined;
                    }
                }

                // Convert relative imports to absolute
                if (ts.isImportDeclaration(node)) {
                    const specifier = node.moduleSpecifier;
                    if (
                        ts.isStringLiteral(specifier) &&
                        specifier.text.startsWith(".")
                    ) {
                        const absolutePath = path.resolve(
                            file_dir_name,
                            specifier.text,
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

    const step1Result = ts.transform(sourceFile, [stripTransformer]);
    const intermediateCode = printer.printFile(step1Result.transformed[0]);

    // 2. Re-parse to get a "Clean Slate" AST
    const cleanSource = ts.createSourceFile(
        "clean.tsx",
        intermediateCode,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
    );

    /**
     * PASS 2: Collect all used Identifiers and Prune Imports
     */
    const usedIdentifiers = new Set<string>();

    function walkAndFindUsages(node: ts.Node) {
        if (ts.isIdentifier(node)) {
            // We only care about identifiers that AREN'T the names in the import statements themselves
            const parent = node.parent;
            const isImportName =
                ts.isImportSpecifier(parent) ||
                ts.isImportClause(parent) ||
                ts.isNamespaceImport(parent);
            if (!isImportName) {
                usedIdentifiers.add(node.text);
            }
        }
        ts.forEachChild(node, walkAndFindUsages);
    }
    walkAndFindUsages(cleanSource);

    const cleanupTransformer: ts.TransformerFactory<ts.SourceFile> =
        (context) => (rootNode) => {
            const visitor = (node: ts.Node): ts.Node | undefined => {
                if (ts.isImportDeclaration(node)) {
                    const clause = node.importClause;
                    if (!clause) return node;

                    // 1. Clean Named Imports: { A, B }
                    if (
                        clause.namedBindings &&
                        ts.isNamedImports(clause.namedBindings)
                    ) {
                        const activeElements =
                            clause.namedBindings.elements.filter((el) =>
                                usedIdentifiers.has(el.name.text),
                            );

                        // If no named imports are used and there is no default import, nix the whole line
                        if (activeElements.length === 0 && !clause.name)
                            return undefined;

                        // If we have some named imports left, update the node
                        return ts.factory.updateImportDeclaration(
                            node,
                            node.modifiers,
                            ts.factory.updateImportClause(
                                clause,
                                clause.isTypeOnly,
                                // Only keep default import if it's used
                                clause.name &&
                                    usedIdentifiers.has(clause.name.text)
                                    ? clause.name
                                    : undefined,
                                ts.factory.createNamedImports(activeElements),
                            ),
                            node.moduleSpecifier,
                            node.attributes,
                        );
                    }

                    // 2. Clean Default Imports: import X from '...'
                    if (clause.name && !usedIdentifiers.has(clause.name.text)) {
                        // If there are no named bindings attached, nix the whole line
                        if (!clause.namedBindings) return undefined;

                        // Otherwise, just strip the default name and keep the named bindings
                        return ts.factory.updateImportDeclaration(
                            node,
                            node.modifiers,
                            ts.factory.updateImportClause(
                                clause,
                                clause.isTypeOnly,
                                undefined,
                                clause.namedBindings,
                            ),
                            node.moduleSpecifier,
                            node.attributes,
                        );
                    }
                }
                return ts.visitEachChild(node, visitor, context);
            };
            return ts.visitNode(rootNode, visitor) as ts.SourceFile;
        };

    const finalResult = ts.transform(cleanSource, [cleanupTransformer]);
    return printer.printFile(finalResult.transformed[0]);
}
