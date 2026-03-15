export default function isDevelopment() {
    const config = global.CONFIG;

    if (process.env.NODE_ENV == "production") {
        return false;
    }

    if (config.development) {
        return true;
    }

    return false;
}
