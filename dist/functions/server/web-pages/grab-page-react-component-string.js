import EJSON from "../../../utils/ejson";
import isDevelopment from "../../../utils/is-development";
import { log } from "../../../utils/log";
export default function grabPageReactComponentString({ file_path, root_file_path, server_res, }) {
    const now = Date.now();
    const dev = isDevelopment();
    try {
        const import_suffix = dev ? `?t=${now}` : "";
        let tsx = ``;
        const server_res_json = JSON.stringify(EJSON.stringify(server_res || {}) ?? "{}");
        // Import Root from its original source path so that all sub-components
        // that import __root (e.g. AppContext) resolve to the same module instance.
        // Using the rewritten .bunext/pages/__root would create a separate
        // createContext() call, breaking context for any sub-component that
        // imports AppContext via a relative path to the source __root.
        if (root_file_path) {
            tsx += `import Root from "${root_file_path}${import_suffix}"\n`;
        }
        tsx += `import Page from "${file_path}${import_suffix}"\n`;
        tsx += `export default function Main() {\n\n`;
        tsx += `const props = JSON.parse(${server_res_json})\n\n`;
        tsx += `    return (\n`;
        if (root_file_path) {
            tsx += `        <Root {...props}><Page {...props} /></Root>\n`;
        }
        else {
            tsx += `        <Page {...props} />\n`;
        }
        tsx += `    )\n`;
        tsx += `}\n`;
        return tsx;
    }
    catch (error) {
        log.error(`grabPageReactComponentString Error: ${error.message}`);
        return undefined;
    }
}
