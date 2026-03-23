import EJSON from "../../../utils/ejson";
import pagePathTransform from "../../../utils/page-path-transform";

type Params = {
    file_path: string;
    root_file_path?: string;
    server_res?: any;
};

export default function grabPageReactComponentString({
    file_path,
    root_file_path,
    server_res,
}: Params): string | undefined {
    try {
        const target_path = pagePathTransform({ page_path: file_path });
        const target_root_path = root_file_path
            ? pagePathTransform({ page_path: root_file_path })
            : undefined;

        let tsx = ``;

        const server_res_json = JSON.stringify(
            EJSON.stringify(server_res || {}) ?? "{}",
        );

        if (target_root_path) {
            tsx += `import Root from "${target_root_path}"\n`;
        }

        tsx += `import Page from "${target_path}"\n`;
        tsx += `export default function Main() {\n\n`;
        tsx += `const props = JSON.parse(${server_res_json})\n\n`;
        tsx += `    return (\n`;
        if (target_root_path) {
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
