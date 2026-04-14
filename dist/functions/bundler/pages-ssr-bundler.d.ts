type Params = {
    post_build_fn?: (params: {
        artifacts: any[];
    }) => Promise<void> | void;
};
export default function pagesSSRBundler(params?: Params): Promise<void>;
export {};
