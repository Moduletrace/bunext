type Params = {
    req: Request;
};
export default function ({ req }: Params): Promise<Response>;
type FileResponse = {
    file_path: string;
    cache?: {
        duration?: "infinite" | number;
    };
};
export declare function readFileResponse({ file_path, cache }: FileResponse): Response;
export {};
