import bunextInit from "./functions/bunext-init";
import bunextRequestHandler from "./functions/server/bunext-req-handler";
import { log } from "./utils/log";

const bunext = {
    bunextRequestHandler,
    bunextLog: log,
    bunextInit,
};
export default bunext;
