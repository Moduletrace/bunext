import EJSON from "../../../utils/ejson";
import pagePathTransform from "../../../utils/page-path-transform";
export default function grabPageReactComponentString({ file_path, root_file_path, server_res, }) {
    try {
        // const target_path = pagePathTransform({ page_path: file_path });
        // const target_root_path = root_file_path
        //     ? pagePathTransform({ page_path: root_file_path })
        //     : undefined;
        let tsx = ``;
        const server_res_json = JSON.stringify(EJSON.stringify(server_res || {}) ?? "{}");
        // Import Root from its original source path so that all sub-components
        // that import __root (e.g. AppContext) resolve to the same module instance.
        // Using the rewritten .bunext/pages/__root would create a separate
        // createContext() call, breaking context for any sub-component that
        // imports AppContext via a relative path to the source __root.
        if (root_file_path) {
            tsx += `import Root from "${root_file_path}"\n`;
        }
        tsx += `import Page from "${file_path}"\n`;
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
        return undefined;
    }
}
