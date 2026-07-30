export default function isDevelopment() {
    if (process.env.NODE_ENV === "production") {
        return false;
    }
    return true;
}
