import type { ServeOptions } from "bun";
type Params = {
    dev?: boolean;
};
export default function (params?: Params): Promise<ServeOptions>;
export {};
