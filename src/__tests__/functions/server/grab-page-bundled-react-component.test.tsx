import { afterAll, afterEach, describe, expect, test, mock } from "bun:test";
import path from "path";
import { renderToString } from "react-dom/server";
import React, { createContext, useContext } from "react";
import grabPageBundledReactComponent from "../../../../src/functions/server/web-pages/grab-page-bundled-react-component";
import grabDirNames from "../../../../src/utils/grab-dir-names";

const { BUNX_TMP_DIR } = grabDirNames();

describe("grabPageBundledReactComponent", () => {
    const originalConfig = global.CONFIG;
    const fixtureDirs: string[] = [];

    global.CONFIG = { development: true } as any;

    afterEach(() => {
        for (const fixtureDir of fixtureDirs.splice(0)) {
            const fs = require("fs");
            fs.rmSync(fixtureDir, { recursive: true, force: true });
        }

        global.CONFIG = { development: true } as any;
        mock.restore();
    });

    afterAll(() => {
        global.CONFIG = originalConfig;
    });

    test("keeps __root context connected during SSR", async () => {
        const fixtureDir = path.join(BUNX_TMP_DIR, `ssr-context-${Date.now()}`);
        fixtureDirs.push(fixtureDir);
        const rootFilePath = path.join(fixtureDir, "__root.tsx");
        const pageFilePath = path.join(fixtureDir, "page.tsx");

        mock.module("../../../../src/functions/server/web-pages/grab-root-file-path", () => ({
            default: () => ({ root_file_path: rootFilePath })
        }));

        mock.module("../../../../src/functions/server/web-pages/grab-tsx-string-module", () => ({
            default: async () => {
                const AppContext = createContext("missing-context");
                const Root = ({ children }: { children: React.ReactNode }) =>
                    React.createElement(AppContext.Provider, { value: "server-context" }, children);
                const Page = () => {
                    const value = useContext(AppContext);
                    return React.createElement("div", null, value);
                };
                const Main = (props: any) =>
                    React.createElement(Root, props, React.createElement(Page, props));
                return { default: Main };
            }
        }));

        const result = await grabPageBundledReactComponent({
            file_path: pageFilePath,
        });

        expect(result?.component).toBeDefined();
        const html = renderToString(React.createElement(result!.component));
        expect(html).toContain("server-context");
    });
});
