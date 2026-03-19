import { jsx as _jsx } from "react/jsx-runtime";
import EJSON from "../../../utils/ejson";
import grabTsxStringModule from "./grab-tsx-string-module";
export default async function grabPageBundledReactComponent({ file_path, root_file, server_res, }) {
    try {
        let tsx = ``;
        const server_res_json = EJSON.stringify(server_res || {})?.replace(/"/g, '\\"');
        if (root_file) {
            tsx += `import Root from "${root_file}"\n`;
        }
        tsx += `import Page from "${file_path}"\n`;
        tsx += `export default function Main() {\n\n`;
        tsx += `const props = JSON.parse("${server_res_json}")\n\n`;
        tsx += `    return (\n`;
        if (root_file) {
            tsx += `        <Root {...props}><Page {...props} /></Root>\n`;
        }
        else {
            tsx += `        <Page {...props} />\n`;
        }
        tsx += `    )\n`;
        tsx += `}\n`;
        const mod = await grabTsxStringModule({ tsx, file_path });
        const Main = mod.default;
        const component = _jsx(Main, {});
        return {
            component,
            server_res,
        };
    }
    catch (error) {
        return undefined;
    }
}
