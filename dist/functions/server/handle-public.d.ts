type Params = {
    req: Request;
};
export default function ({ req }: Params): Promise<Response>;
export declare function readFileResponse({ file_path }: {
    file_path: string;
}): Response;
export {};
