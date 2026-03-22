import bunextInit from "./functions/bunext-init";
import bunextRequestHandler from "./functions/server/bunext-req-handler";
declare const bunext: {
    bunextRequestHandler: typeof bunextRequestHandler;
    bunextLog: {
        info: (msg: string, log?: any) => void;
        success: (msg: string, log?: any) => void;
        error: (msg: string | Error, log?: any) => void;
        warn: (msg: string) => void;
        build: (msg: string) => void;
        watch: (msg: string) => void;
        server: (url: string) => void;
        banner: () => void;
    };
    bunextInit: typeof bunextInit;
};
export default bunext;
