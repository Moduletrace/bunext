export default function ({ path }) {
    for (let i = 0; i < global.CONSTANTS.RouteIgnorePatterns.length; i++) {
        const regex = global.CONSTANTS.RouteIgnorePatterns[i];
        if (path.match(regex))
            return true;
    }
    return false;
}
