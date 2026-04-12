import type { APIResponseObject } from "../types";

type Params = {
    path: string;
};

export default function ({ path }: Params): boolean {
    for (let i = 0; i < global.CONSTANTS.RouteIgnorePatterns.length; i++) {
        const regex = global.CONSTANTS.RouteIgnorePatterns[i];
        if (path.match(regex)) return true;
    }

    return false;
}
