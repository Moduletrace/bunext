type Params = {
    path: string;
};

export default function ({ path }: Params): boolean {
    for (
        let i = 0;
        i < global.BUNEXT_CONSTANTS.RouteIgnorePatterns.length;
        i++
    ) {
        const regex = global.BUNEXT_CONSTANTS.RouteIgnorePatterns[i];
        if (path.match(regex)) return true;
    }

    return false;
}
