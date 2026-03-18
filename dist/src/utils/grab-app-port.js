import AppNames from "./grab-app-names";
import numberfy from "./numberfy";
export default function grabAppPort() {
    const { defaultPort } = AppNames;
    try {
        if (process.env.PORT) {
            return numberfy(process.env.PORT);
        }
        if (global.CONFIG.port) {
            return global.CONFIG.port;
        }
        return numberfy(defaultPort);
    }
    catch (error) {
        return numberfy(defaultPort);
    }
}
