type Params = {
    file_path: string;
    out_file?: string;
};
export default function grabFilePathModule<T extends any = any>({ file_path, out_file, }: Params): Promise<T>;
export {};
