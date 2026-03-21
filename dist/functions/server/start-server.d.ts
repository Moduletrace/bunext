type Params = {
    dev?: boolean;
};
export default function startServer(params?: Params): Promise<import("bun").Server>;
export {};
