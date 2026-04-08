import { afterAll, afterEach, describe, expect, test } from "bun:test";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import grabPageBundledReactComponent from "../../../../src/functions/server/web-pages/grab-page-bundled-react-component";
import grabDirNames from "../../../../src/utils/grab-dir-names";

const { BUNX_CWD_MODULE_CACHE_DIR, BUNX_TMP_DIR } = grabDirNames();

describe("grabPageBundledReactComponent", () => {
    const fixtureDirs: string[] = [];
    const originalConfig = global.CONFIG;

    global.CONFIG = { development: true } as any;

    afterEach(() => {
        for (const fixtureDir of fixtureDirs.splice(0)) {
            fs.rmSync(fixtureDir, { recursive: true, force: true });
        }

        global.CONFIG = { development: true } as any;
    });

    afterAll(() => {
        global.CONFIG = originalConfig;
    });

    test("keeps __root context connected during SSR", async () => {
        fs.mkdirSync(BUNX_CWD_MODULE_CACHE_DIR, { recursive: true });
        fs.mkdirSync(BUNX_TMP_DIR, { recursive: true });

        const fixtureDir = path.join(BUNX_TMP_DIR, `ssr-context-${Date.now()}`);
        fixtureDirs.push(fixtureDir);
        fs.mkdirSync(fixtureDir, { recursive: true });

        const rootFilePath = path.join(fixtureDir, "__root.tsx");
        const pageFilePath = path.join(fixtureDir, "page.tsx");

        fs.writeFileSync(
            rootFilePath,
            `import { createContext } from "react";
export const AppContext = createContext("missing-context");

export default function Root({ children }: { children: React.ReactNode }) {
    return (
        <AppContext.Provider value="server-context">
            {children}
        </AppContext.Provider>
    );
}
`,
        );

        fs.writeFileSync(
            pageFilePath,
            `import { useContext } from "react";
import { AppContext } from "./__root";

export default function Page() {
    const value = useContext(AppContext);

    return <div>{value}</div>;
}
`,
        );

        const result = await grabPageBundledReactComponent({
            file_path: pageFilePath,
            root_file_path: rootFilePath,
        });

        expect(result?.component).toBeDefined();
        expect(renderToString(result!.component)).toContain("server-context");
    });
});
