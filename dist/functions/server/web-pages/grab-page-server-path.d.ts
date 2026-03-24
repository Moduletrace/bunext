type Params = {
    file_path: string;
};
export default function grabPageServerPath({ file_path }: Params): {
    server_file_path: string | undefined;
};
export {};
