import bunextInit from "../../functions/bunext-init";
import startServer from "../../functions/server/start-server";
import { log } from "../../utils/log";
log.info("Starting production server ...");
await bunextInit();
await startServer();
