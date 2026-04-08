import EJSON from "../../../utils/ejson";
import { log } from "../../../utils/log";
export default function grabPageReactComponentString({ file_path, root_file_path, server_res, }) {
    try {
        let tsx = ``;
        const server_res_json = JSON.stringify(EJSON.stringify(server_res || {}) ?? "{}");
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
        log.error(`grabPageReactComponentString Error: ${error.message}`);
        return undefined;
    }
}
