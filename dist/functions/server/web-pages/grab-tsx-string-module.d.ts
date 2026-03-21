type Params = {
    tsx: string;
    file_path: string;
};
export default function grabTsxStringModule<T extends any = any>({ tsx, file_path, }: Params): Promise<T>;
export {};
