export default function isDevelopment() {
    const config = global.CONFIG;
    if (config.development)
        return true;
    return false;
}
