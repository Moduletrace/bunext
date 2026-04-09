import EJSON from "../../../utils/ejson";
import { log } from "../../../utils/log";

type Params = {
    file_path: string;
    root_file_path?: string;
    // server_res?: any;
};

export default function grabPageReactComponentString({
    file_path,
    root_file_path,
    // server_res,
}: Params): string | undefined {
    try {
        let tsx = ``;

        // const server_res_json = JSON.stringify(
        //     EJSON.stringify(server_res || {}) ?? "{}",
        // );

        if (root_file_path) {
            tsx += `import Root from "${root_file_path}"\n`;
        }

        tsx += `import Page from "${file_path}"\n`;
        tsx += `export default function Main({...props}) {\n\n`;
        // tsx += `const props = JSON.parse(${server_res_json})\n\n`;
        tsx += `    return (\n`;
        if (root_file_path) {
            tsx += `        <Root {...props}><Page {...props} /></Root>\n`;
        } else {
            tsx += `        <Page {...props} />\n`;
        }
        tsx += `    )\n`;
        tsx += `}\n`;

        return tsx;
    } catch (error: any) {
        log.error(`grabPageReactComponentString Error: ${error.message}`);
        return undefined;
    }
}
