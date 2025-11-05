import AppNames from "./grab-app-names";
import numberfy from "./numberfy";

export default function grabAppPort() {
    if (process.env.PORT) {
        return numberfy(process.env.PORT);
    }

    if (global.CONFIG.port) {
        return global.CONFIG.port;
    }

    const { defaultPort } = AppNames;

    return numberfy(defaultPort);
}
