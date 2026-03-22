export declare const log: {
    info: (msg: string, log?: any) => void;
    success: (msg: string, log?: any) => void;
    error: (msg: string | Error, log?: any) => void;
    warn: (msg: string) => void;
    build: (msg: string) => void;
    watch: (msg: string) => void;
    server: (url: string) => void;
    banner: () => void;
};
