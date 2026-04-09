import { log } from "../../../utils/log";
export default function grabPageReactComponentString({ file_path, root_file_path, }) {
    try {
        let tsx = ``;
        if (root_file_path) {
            tsx += `import Root from "${root_file_path}"\n`;
        }
        tsx += `import Page from "${file_path}"\n`;
        tsx += `export default function Main({...props}) {\n\n`;
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
