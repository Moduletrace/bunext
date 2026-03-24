import { existsSync } from "fs";

type Params = {
    file_path: string;
};

export default function grabPageServerPath({ file_path }: Params) {
    const page_server_ts_file = file_path.replace(/\.tsx?$/, ".server.ts");
    const page_server_tsx_file = file_path.replace(/\.tsx?$/, ".server.tsx");

    const server_file_path = existsSync(page_server_ts_file)
        ? page_server_ts_file
        : existsSync(page_server_tsx_file)
          ? page_server_tsx_file
          : undefined;

    return { server_file_path };
}
