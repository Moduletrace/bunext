type Params = {
    log_time?: boolean;
    debug?: boolean;
    target_page_file?: string;
};
export default function initPages(params?: Params): Promise<void>;
export {};
