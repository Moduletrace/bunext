import AppNames from "./grab-app-names";
import numberfy from "./numberfy";

export default function grabAppPort() {
    const { defaultPort } = AppNames;

    try {
        if (process.env.PORT) {
            return numberfy(process.env.PORT);
        }

        if (global.BUNEXT_CONFIG.port) {
            return global.BUNEXT_CONFIG.port;
        }

        return numberfy(defaultPort);
    } catch (error) {
        return numberfy(defaultPort);
    }
}
