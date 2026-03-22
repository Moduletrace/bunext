type Params = {
    page_path: string;
};
/**
 * # Transform a page path to the destination
 * path in the .bunext directory
 */
export default function pagePathTransform({ page_path }: Params): string;
export {};
