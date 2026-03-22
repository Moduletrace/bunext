import EJSON from "../../../utils/ejson";
import pagePathTransform from "../../../utils/page-path-transform";

type Params = {
    file_path: string;
    root_file?: string;
    server_res?: any;
};

export default function grabPageReactComponentString({
    file_path,
    root_file,
    server_res,
}: Params): string | undefined {
    try {
        const target_path = pagePathTransform({ page_path: file_path });
        let tsx = ``;

        const server_res_json = JSON.stringify(
            EJSON.stringify(server_res || {}) ?? "{}",
        );

        if (root_file) {
            tsx += `import Root from "${root_file}"\n`;
        }

        tsx += `import Page from "${target_path}"\n`;
        tsx += `export default function Main() {\n\n`;
        tsx += `const props = JSON.parse(${server_res_json})\n\n`;
        tsx += `    return (\n`;
        if (root_file) {
            tsx += `        <Root suppressHydrationWarning={true} {...props}><Page {...props} /></Root>\n`;
        } else {
            tsx += `        <Page suppressHydrationWarning={true} {...props} />\n`;
        }
        tsx += `    )\n`;
        tsx += `}\n`;

        return tsx;
    } catch (error: any) {
        return undefined;
    }
}
